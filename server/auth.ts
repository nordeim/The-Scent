import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "thescent-secret-key", // In production, use environment variable
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          }
          
          // Check if account is locked
          if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
            return done(null, false, { message: "Account is locked. Try again later." });
          }
          
          // Reset login attempts on successful login
          if (user.loginAttempts > 0) {
            await storage.updateUser(user.id, { loginAttempts: 0, lockUntil: null });
          }
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create user with hashed password
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) return next(err);
        // Filter out password before sending response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: Error, user: User, info: any) => {
      if (err) return next(err);
      
      // Handle failed login
      if (!user) {
        // If email exists, increment login attempts
        const existingUser = await storage.getUserByEmail(req.body.email);
        if (existingUser) {
          const updatedAttempts = (existingUser.loginAttempts || 0) + 1;
          
          // Lock account after 5 failed attempts
          if (updatedAttempts >= 5) {
            // Lock for 30 minutes
            const lockUntil = new Date(Date.now() + 30 * 60 * 1000);
            await storage.updateUser(existingUser.id, { 
              loginAttempts: updatedAttempts,
              lockUntil
            });
            return res.status(401).json({ message: "Account locked for 30 minutes due to too many failed attempts" });
          } else {
            await storage.updateUser(existingUser.id, { loginAttempts: updatedAttempts });
          }
        }
        
        return res.status(401).json({ message: info.message || "Invalid email or password" });
      }
      
      // Login successful
      req.login(user, (err) => {
        if (err) return next(err);
        // Filter out password before sending response
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // Filter out password before sending response
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });
}
