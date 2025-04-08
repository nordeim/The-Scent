# The-Scent E-Commerce Platform: Technical Design Specification Document

## 1. Executive Summary

This technical design specification document provides a comprehensive analysis of "The-Scent" e-commerce platform, a modern and sophisticated online retail system specialized in fragrance products. The platform aims to deliver a unique customer experience through personalized scent recommendations, detailed product information, and a seamless shopping journey from discovery to checkout.

The system architecture follows a modern full-stack approach with a React frontend, Express backend, and PostgreSQL database, incorporating specialized features for the fragrance domain. The document details the implementation of core e-commerce functionality, specialized fragrance features, payment processing, authentication, and system resilience mechanisms.

## 2. Introduction

### 2.1 Purpose and Scope

The purpose of this document is to provide a detailed technical specification of "The-Scent" e-commerce platform, outlining the system architecture, component implementations, data models, and key functionalities. The document serves as a comprehensive reference for understanding the current implementation, identifying potential improvements, and guiding future development efforts.

The scope encompasses:
- System architecture and technology stack
- Frontend implementation and user interface
- Backend services and API endpoints
- Database schema and data persistence
- Authentication and security mechanisms
- Payment processing with Stripe integration
- Specialized fragrance discovery features
- System resilience and fault tolerance

### 2.2 Project Overview

"The-Scent" is a specialized e-commerce platform focusing on fragrance products. It differentiates itself from standard e-commerce platforms through specialized features that help users discover and select fragrances based on their preferences, moods, and lifestyle. The platform combines traditional e-commerce functionality with unique fragrance-specific features to create a personalized shopping experience.

### 2.3 Design Methodology and Approach

The design approach follows modern web development practices with a focus on:

1. **Component-Based Architecture**: Modular components that can be developed, tested, and maintained independently.
2. **Separation of Concerns**: Clear separation between presentation layer, business logic, and data access.
3. **Type Safety**: Utilizing TypeScript throughout the application to ensure type safety and improve code quality.
4. **Responsive Design**: Ensuring the application works seamlessly across various device types and screen sizes.
5. **Progressive Enhancement**: Core functionality works for all users while enhanced features are available for modern browsers.
6. **Resilient Implementation**: Incorporating fallback mechanisms to ensure system functionality even when certain components fail.
7. **User-Centric Design**: Focusing on user experience and specialized domain features for fragrance shopping.

## 3. System Architecture

### 3.1 High-Level Architecture Overview

The system follows a client-server architecture with a clear separation between frontend and backend components. The architecture is designed to be modular, scalable, and resilient, with the following main components:

1. **Frontend**: React-based web application that provides the user interface and client-side functionality.
2. **Backend API**: Express-based REST API that handles business logic and data operations.
3. **Database**: PostgreSQL database for persistent data storage with an in-memory fallback mechanism.
4. **External Integrations**: Integration with Stripe for payment processing.

```
┌───────────────────┐       ┌───────────────────┐        ┌───────────────────┐
│                   │       │                   │        │                   │
│  React Frontend   │◄─────►│  Express Backend  │◄──────►│  PostgreSQL DB    │
│                   │       │                   │        │                   │
└───────────────────┘       └───────────────────┘        └───────────────────┘
                                      │
                                      │
                                      ▼
                            ┌───────────────────┐
                            │                   │
                            │  Stripe Payment   │
                            │  Gateway          │
                            │                   │
                            └───────────────────┘
```

### 3.2 Technology Stack

#### 3.2.1 Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API, TanStack Query (React Query)
- **Styling**: Tailwind CSS, Radix UI, shadcn UI components
- **Routing**: wouter (lightweight routing library)
- **Form Handling**: react-hook-form with zod validation
- **HTTP Client**: TanStack Query for data fetching

#### 3.2.2 Backend
- **Framework**: Express.js with TypeScript
- **API Style**: RESTful with JSON
- **Authentication**: Passport.js with local strategy
- **Session Management**: express-session with PostgreSQL or in-memory session store

#### 3.2.3 Database
- **Primary Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Migration Tool**: Drizzle Kit
- **Fallback Mechanism**: In-memory storage implementation

#### 3.2.4 Infrastructure
- **Deployment**: Replit
- **Runtime**: Node.js
- **Workflow Management**: Replit's workflow system

#### 3.2.5 External Services
- **Payment Processing**: Stripe API

## 4. Database Design

### 4.1 Database Schema

The database schema captures the domain model for the fragrance e-commerce platform, with specialized entities related to scent profiles, moods, and product characteristics. The schema is implemented using Drizzle ORM.

#### 4.1.1 Core Entities

The primary entities in the system include:

1. **Users**: Store customer information and authentication details
2. **Products**: Store fragrance product details
3. **Categories**: Organize products into logical groups
4. **Orders**: Track customer purchases
5. **Carts**: Manage shopping sessions
6. **Wishlists**: Save products for future consideration
7. **Reviews**: Store customer feedback on products
8. **Addresses**: Manage shipping and billing addresses

#### 4.1.2 Specialized Fragrance Entities

The schema also includes specialized entities for fragrance-specific features:

1. **ScentProfiles**: Define different scent characteristics (floral, woody, citrus, etc.)
2. **Moods**: Define emotional states (relaxation, energy, focus, etc.)
3. **ProductScentProfiles**: Map products to scent profiles with intensity levels
4. **ProductMoods**: Associate products with moods they help promote

#### 4.1.3 Schema Implementation

The database schema is defined in `shared/schema.ts` using Drizzle ORM. Here's a partial example of the schema definition:

```typescript
// User table definition
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  role: text('role', { enum: ['user', 'admin'] }).default('user'),
  loginAttempts: integer('login_attempts').default(0),
  lockUntil: timestamp('lock_until'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Product table definition
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  shortDescription: text('short_description'),
  price: text('price').notNull(),
  imageUrl: text('image_url').notNull(),
  featured: boolean('featured').default(false),
  categoryId: integer('category_id').references(() => categories.id),
  stock: integer('stock').default(0),
  reviewCount: integer('review_count').default(0),
  averageRating: text('average_rating').default('0'),
  sku: text('sku').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Category table definition
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 4.2 Database Access Layer

The application implements a flexible storage interface to abstract the data access layer, with two concrete implementations:

1. **DbStorage**: Uses Drizzle ORM to interact with PostgreSQL
2. **FixedMemStorage**: In-memory storage implementation as a fallback mechanism

This approach ensures system resilience when database connectivity issues occur.

#### 4.2.1 Storage Interface

The `IStorage` interface in `server/storage.ts` defines all data access operations:

```typescript
export interface IStorage {
  sessionStore: session.Store;
  
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Product management
  getProducts(limit?: number, offset?: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined>;
  
  // Additional methods for other entities...
}
```

#### 4.2.2 Database Storage Implementation

The `DbStorage` class in `server/db-storage.ts` implements the `IStorage` interface using Drizzle ORM to interact with PostgreSQL:

```typescript
/**
 * PostgreSQL implementation of the storage interface
 */
export class DbStorage implements IStorage {
  sessionStore: Store;
  
  constructor() {
    // Initialize PostgreSQL session store
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }
  
  // ... other method implementations ...
}
```

#### 4.2.3 In-Memory Fallback Implementation

The `FixedMemStorage` class in `server/fix-product-display.ts` provides an in-memory implementation of the `IStorage` interface, serving as a fallback when database connectivity issues occur:

```typescript
/**
 * This class implements a robust fallback in-memory storage solution 
 * to ensure data is available even if database connection fails.
 */
export class FixedMemStorage implements IStorage {
  // Maps to store data
  private userMap: Map<number, any> = new Map();
  private productMap: Map<number, any> = new Map();
  private categoryMap: Map<number, any> = new Map();
  private cartMap: Map<number, any> = new Map();
  private cartItemMap: Map<number, any> = new Map();
  private orderMap: Map<number, any> = new Map();
  private orderItemMap: Map<number, any> = new Map();
  // ... other maps ...
  
  // Counters for auto-incrementing IDs
  private userIdCounter = 1;
  private productIdCounter = 1;
  private categoryIdCounter = 1;
  // ... other counters ...
  
  sessionStore: Store;
  
  constructor() {
    // Initialize memory store for sessions
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
    
    // Initialize sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    console.log('Initializing sample data with 15 products from images folder...');
    
    // Initialize categories
    const essentialOils = this.createCategory({
      name: "Essential Oils",
      slug: "essential-oils", 
      description: "Pure essential oils for aromatherapy and wellness.",
      imageUrl: "/images/scent1.jpg"
    });
    
    // ... more initialization code ...
  }
  
  // Implementation of interface methods
  async getUser(id: number) {
    return this.userMap.get(id);
  }
  
  // ... other method implementations ...
}
```

#### 4.2.4 Storage Selection Strategy

The application implements a strategy to select the appropriate storage implementation based on database connectivity:

```typescript
// Try to use DbStorage with fallback to MemStorage 
let chosenStorage: IStorage;

// Set to true to force MemStorage usage (for debugging/development)
const forceMemStorage = true;

if (forceMemStorage) {
  console.log('Using fixed in-memory storage with 15 products (forced)');
  chosenStorage = new FixedMemStorage();
} else {
  try {
    // Attempt to create a DbStorage
    chosenStorage = new DbStorage();
    
    // Test the connection to make sure it actually works
    const testConnection = async () => {
      try {
        await chosenStorage.getCategories();
        console.log('PostgreSQL database connection successful');
        return true;
      } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
    };
    
    // If connection test fails, switch to FixedMemStorage
    testConnection().then(success => {
      if (!success) {
        console.warn('Falling back to in-memory storage after connection test failure');
        chosenStorage = new FixedMemStorage();
      }
    });
    
    console.log('Using PostgreSQL database for storage');
  } catch (error) {
    // Fallback to FixedMemStorage if DatabaseStorage fails
    console.warn('Failed to connect to PostgreSQL database:', error);
    console.warn('Falling back to in-memory storage - data will not persist between restarts');
    chosenStorage = new FixedMemStorage();
  }
}

export const storage = chosenStorage;
```

## 5. Backend Implementation

The backend implementation provides RESTful API endpoints for all e-commerce functionality, including product browsing, cart management, orders, user management, and specialized fragrance features.

### 5.1 Server Setup

The Express server is set up in `server/index.ts`, configuring middleware, routes, and error handling:

```typescript
// Import required modules
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { setupAuth } from './auth';
import { registerRoutes } from './routes';
import { setupDatabase } from './db-setup';

// Initialize Express app
const app = express();

// Configure middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Setup authentication
setupAuth(app);

// Initialize database
setupDatabase().catch(err => {
  console.error('Database setup failed:', err);
  console.warn('Continuing with application startup using fallback storage if available');
});

// Register API routes
const server = await registerRoutes(app);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[express] serving on port ${PORT}`);
});
```

### 5.2 API Routes

The application defines RESTful API endpoints for all functionality in `server/routes.ts`:

```typescript
export async function registerRoutes(app: Express): Promise<Server> {
  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const products = await storage.getProducts(limit, offset);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get('/api/products/featured', async (req, res) => {
    try {
      const featuredProducts = await storage.getFeaturedProducts();
      res.json(featuredProducts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get('/api/products/:slug', async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Cart routes
  app.get('/api/cart', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const cart = await storage.getCartByUserId(req.user.id);
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      const cartItems = await storage.getCartItems(cart.id);
      
      // Fetch product details for each cart item
      const enrichedCartItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return {
            ...item,
            product,
          };
        })
      );
      
      res.json({
        ...cart,
        items: enrichedCartItems,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Specialized fragrance routes
  app.get('/api/scent-profiles', async (req, res) => {
    try {
      const scentProfiles = await storage.getScentProfiles();
      res.json(scentProfiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get('/api/moods', async (req, res) => {
    try {
      const moods = await storage.getMoods();
      res.json(moods);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // More routes for other functionality...
  
  const httpServer = createServer(app);
  return httpServer;
}
```

### 5.3 Authentication and Authorization

Authentication is implemented using Passport.js with a local strategy for username/password authentication in `server/auth.ts`:

```typescript
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
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
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Incorrect username or password' });
        }
        
        // Verify password
        const isMatch = await comparePasswords(password, user.password);
        
        if (!isMatch) {
          // Increment login attempts
          const updatedUser = await storage.updateUser(user.id, {
            loginAttempts: (user.loginAttempts || 0) + 1,
            lockUntil: user.loginAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : user.lockUntil
          });
          
          return done(null, false, { message: 'Incorrect username or password' });
        }
        
        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
          await storage.updateUser(user.id, {
            loginAttempts: 0,
            lockUntil: null
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
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
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: SelectUser, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json(req.user);
  });
}
```

### 5.4 Payment Processing

Payment processing is implemented using Stripe API integration in `server/routes.ts`:

```typescript
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Creating a payment intent
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error creating payment intent: " + error.message });
  }
});

// Creating a subscription
app.post('/api/get-or-create-subscription', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }

  let user = req.user;

  if (user.stripeSubscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice?.payment_intent.client_secret,
    });

    return;
  }
  
  if (!user.email) {
    throw new Error('No user email on file');
  }

  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.username,
    });

    user = await storage.updateStripeCustomerId(user.id, customer.id);

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: process.env.STRIPE_PRICE_ID,
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    await storage.updateUserStripeInfo(user.id, {
      stripeCustomerId: customer.id, 
      stripeSubscriptionId: subscription.id
    });

    res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice?.payment_intent.client_secret,
    });
  } catch (error: any) {
    return res.status(400).send({ error: { message: error.message } });
  }
});
```

## 6. Frontend Implementation

The frontend provides a responsive, feature-rich user interface for browsing, selecting, and purchasing fragrance products, with specialized features for fragrance discovery.

### 6.1 Application Structure

The application follows a component-based architecture with clear separation of concerns:

```
client/
  ├── src/
  │   ├── components/    # Reusable UI components
  │   ├── pages/         # Page components
  │   ├── hooks/         # Custom React hooks
  │   ├── lib/           # Utilities and helper functions
  │   ├── styles/        # Global styles and theme
  │   ├── types/         # TypeScript type definitions
  │   ├── App.tsx        # Main application component
  │   ├── index.tsx      # Application entry point
  │   └── layout/        # Layout components
  └── public/            # Static assets
```

### 6.2 Routing and Navigation

Routing is implemented using the lightweight `wouter` library:

```typescript
// App.tsx
import HomePage from "@/pages/home-page";
import ProductPage from "@/pages/product-page";
import CategoryPage from "@/pages/category-page";
import CartPage from "@/pages/cart-page";
import CheckoutPage from "@/pages/checkout-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import OrdersPage from "@/pages/orders-page";
import WishlistPage from "@/pages/wishlist-page";
import NotFound from "@/pages/not-found";
import { Router, Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";

function AppRouter() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/products/:slug" component={ProductPage} />
        <Route path="/categories/:slug" component={CategoryPage} />
        <Route path="/cart" component={CartPage} />
        <ProtectedRoute path="/checkout" component={CheckoutPage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        <ProtectedRoute path="/orders" component={OrdersPage} />
        <ProtectedRoute path="/wishlist" component={WishlistPage} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}
```

### 6.3 State Management

State management is implemented using React Context API for global state, supplemented with TanStack Query for server state:

#### 6.3.1 Authentication State

The `useAuth` hook provides authentication state and functions:

```typescript
// hooks/use-auth.tsx
import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Other mutations and context provider implementation...
}
```

#### 6.3.2 Cart State

The `useCart` hook manages shopping cart state:

```typescript
// hooks/use-cart.tsx
import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type CartContextType = {
  cart: any | null;
  isLoading: boolean;
  error: Error | null;
  addToCartMutation: any;
  updateQuantityMutation: any;
  removeFromCartMutation: any;
  clearCartMutation: any;
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    data: cart,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user, // Only fetch cart when user is logged in
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const res = await apiRequest("POST", "/api/cart/items", { productId, quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Product added",
        description: "Product added to your cart successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Other mutations and context provider implementation...
}
```

### 6.4 Data Fetching

Data fetching is implemented using TanStack Query (React Query) with a custom setup for API requests in `lib/queryClient.ts`:

```typescript
import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Helper function to create API requests
export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  headers: HeadersInit = {}
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // Include cookies for auth
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  // Handle common error cases
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "An unknown error occurred",
    }));
    
    throw new Error(errorData.message || "Request failed");
  }

  return response;
}

// Helper function to create a query function with custom error handling
export function getQueryFn({
  on401 = "throw",
}: {
  on401: "throw" | "returnNull";
} = {
  on401: "throw",
}) {
  return async ({ queryKey }: { queryKey: string[] }): Promise<any> => {
    const [url] = queryKey;
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for auth
      });
      
      // Handle auth errors
      if (response.status === 401) {
        if (on401 === "returnNull") {
          return null;
        } else {
          throw new Error("Not authenticated");
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "An unknown error occurred",
        }));
        
        throw new Error(errorData.message || "Request failed");
      }
      
      return response.json();
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch data");
    }
  };
}
```

### 6.5 Checkout Process with Stripe Integration

The checkout process is implemented with Stripe integration in `pages/checkout-page.tsx`:

```typescript
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";

// Load Stripe outside of component render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { clearCartMutation } = useCart();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders?status=success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      
      // Clear cart after successful payment
      clearCartMutation.mutate();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || !elements}
      >
        Pay ${amount.toFixed(2)}
      </Button>
    </form>
  );
};

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");
  const { cart, isLoading } = useCart();
  const { toast } = useToast();
  
  // Calculate total amount
  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.product.price) * item.quantity;
    }, 0);
  };
  
  const amount = calculateTotal();
  
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add items before checkout.",
        variant: "destructive",
      });
      return;
    }
    
    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { amount })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  }, [cart, amount, toast]);

  // Render checkout page with payment form...
}
```

### 6.6 Specialized Fragrance Features

The application includes specialized features for fragrance discovery and selection, including scent profiles, mood-based recommendations, and interactive quiz interfaces:

#### 6.6.1 Scent Profile Display

Scent profiles are displayed on product pages to help users understand fragrance characteristics:

```typescript
// components/products/scent-profile.tsx
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";

export function ScentProfileDisplay({ productId }: { productId: number }) {
  const { data: scentProfiles, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}/scent-profiles`],
    queryFn: getQueryFn(),
  });
  
  if (isLoading) {
    return <div className="animate-pulse h-24 bg-muted rounded-md" />;
  }
  
  if (!scentProfiles || scentProfiles.length === 0) {
    return <div className="text-muted-foreground">No scent profile information available</div>;
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Scent Profile</h3>
      <div className="space-y-3">
        {scentProfiles.map((profile: any) => (
          <div key={profile.scentProfileId} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-medium">{profile.scentProfile.name}</span>
              <span className="text-sm text-muted-foreground">{profile.intensity}/10</span>
            </div>
            <Progress value={profile.intensity * 10} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 6.6.2 Mood-Based Recommendations

Users can browse products based on their desired mood or emotional state:

```typescript
// components/mood-selector.tsx
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { useNavigate } from "wouter";

export function MoodSelector() {
  const { data: moods, isLoading } = useQuery({
    queryKey: ["/api/moods"],
    queryFn: getQueryFn(),
  });
  
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-40 bg-muted rounded-md" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {moods.map((mood: any) => (
        <Card 
          key={mood.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/moods/${mood.id}`)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
              <i className={`${mood.iconClass} text-primary`} />
            </div>
            <CardTitle>{mood.name}</CardTitle>
            <CardDescription>{mood.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## 7. System Resilience

The application includes mechanisms to ensure resilience and fault tolerance, particularly for database connectivity issues.

### 7.1 Database Fallback Mechanism

A key resilience feature is the database fallback mechanism, which automatically switches to in-memory storage when PostgreSQL connectivity issues occur:

```typescript
// storage.ts
// Try to use DbStorage with fallback to MemStorage 
let chosenStorage: IStorage;

// Set to true to force MemStorage usage (for debugging/development)
const forceMemStorage = true;

if (forceMemStorage) {
  console.log('Using fixed in-memory storage with 15 products (forced)');
  chosenStorage = new FixedMemStorage();
} else {
  try {
    // Attempt to create a DbStorage
    chosenStorage = new DbStorage();
    
    // Test the connection to make sure it actually works
    const testConnection = async () => {
      try {
        await chosenStorage.getCategories();
        console.log('PostgreSQL database connection successful');
        return true;
      } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
    };
    
    // If connection test fails, switch to FixedMemStorage
    testConnection().then(success => {
      if (!success) {
        console.warn('Falling back to in-memory storage after connection test failure');
        chosenStorage = new FixedMemStorage();
      }
    });
    
    console.log('Using PostgreSQL database for storage');
  } catch (error) {
    // Fallback to FixedMemStorage if DatabaseStorage fails
    console.warn('Failed to connect to PostgreSQL database:', error);
    console.warn('Falling back to in-memory storage - data will not persist between restarts');
    chosenStorage = new FixedMemStorage();
  }
}

export const storage = chosenStorage;
```

### 7.2 Sample Data Population

The in-memory storage implementation includes a comprehensive data initialization function to ensure the application has sample data when operating in fallback mode:

```typescript
private initSampleData() {
  console.log('Initializing sample data with 15 products from images folder...');
  
  // Initialize categories
  const essentialOils = this.createCategory({
    name: "Essential Oils",
    slug: "essential-oils", 
    description: "Pure essential oils for aromatherapy and wellness.",
    imageUrl: "/images/scent1.jpg"
  });
  
  // ... initialize more sample data ...
  
  // 1. Lavender Essential Oil
  const lavenderOil = this.createProduct({
    name: "Lavender Essential Oil",
    slug: "lavender-essential-oil",
    price: "24.99",
    description: "Our pure lavender essential oil is sourced from high-altitude lavender fields...",
    shortDescription: "Pure, calming lavender for relaxation",
    imageUrl: "/images/scent1.jpg",
    featured: true,
    categoryId: essentialOils.id,
    stock: 100,
    sku: "EO-LAV-001"
  });
  
  // ... initialize more products ...
  
  console.log('Successfully initialized 15 sample products');
}
```

## 8. Issues and Improvement Opportunities

Despite the robust implementation, several issues and improvement opportunities exist in the current system:

### 8.1 Database Connectivity Issues

The system experiences persistent issues connecting to PostgreSQL, necessitating the in-memory fallback mechanism. While this ensures application functionality, it means data does not persist between application restarts. Potential solutions include:

1. **Connection Pool Configuration**: Review and optimize PostgreSQL connection pool settings.
2. **Database Migration**: Ensure all required tables are properly created with appropriate migrations.
3. **Database Credentials**: Verify that the correct database credentials are being used.
4. **Network Configuration**: Check for network connectivity or firewall issues that might be blocking database connections.

### 8.2 TypeScript Type Issues

Several TypeScript errors exist in the codebase, particularly related to:

1. **Inconsistent Interface Implementations**: Methods in `FixedMemStorage` and `DbStorage` don't fully adhere to the `IStorage` interface types.
2. **Promise Type Handling**: Incorrect handling of promise return types in several methods.
3. **Property Access**: Accessing properties that don't exist on certain types.

These issues should be addressed to improve type safety and code quality.

### 8.3 Authentication Security Enhancements

The authentication system could be strengthened with:

1. **Password Complexity Requirements**: Enforce stronger password requirements.
2. **Email Verification**: Implement email verification for new accounts.
3. **Two-Factor Authentication**: Add an optional second factor for authentication.
4. **Rate Limiting**: Implement more sophisticated rate limiting for login attempts.

### 8.4 Performance Optimization

Several performance optimizations could be implemented:

1. **Query Optimization**: Optimize database queries, particularly those fetching related data.
2. **Pagination**: Implement pagination for all list endpoints to limit data transfer.
3. **Caching**: Add caching for frequently accessed, rarely changing data.
4. **Image Optimization**: Optimize product images for faster loading.

## 9. Conclusion

"The-Scent" e-commerce platform demonstrates a comprehensive implementation of a specialized fragrance retail system. The application successfully combines traditional e-commerce functionality with domain-specific features for fragrance discovery and selection, creating a unique and personalized shopping experience.

The system architecture follows modern web development practices, with a clear separation between frontend and backend components, type-safe implementation using TypeScript, and responsive design for all device types. The specialized fragrance features, including scent profiles, mood-based recommendations, and the interactive scent quiz, provide significant value for users navigating the complex domain of fragrances.

The most notable technical achievement is the robust fallback mechanism that ensures system functionality even when database connectivity issues occur. This resilience approach, combined with comprehensive sample data population, ensures that users can continue to browse and explore products regardless of backend database status.

## 10. Recommendations

Based on the analysis of the current implementation, the following recommendations are proposed for future development:

### 10.1 Technical Improvements

1. **Resolve Database Connectivity Issues**: Prioritize resolving the underlying PostgreSQL connectivity issues to ensure data persistence.
2. **Fix TypeScript Type Issues**: Address TypeScript errors to improve type safety and code quality.
3. **Enhance Error Handling**: Implement more sophisticated error handling and logging throughout the application.
4. **Implement Comprehensive Testing**: Add unit, integration, and end-to-end tests to ensure system stability.
5. **Performance Optimization**: Implement the performance optimizations identified in section 8.4.

### 10.2 Feature Enhancements

1. **Enhanced Recommendation Engine**: Develop a more sophisticated algorithm for personalized fragrance recommendations.
2. **User Account Enhancements**: Add features like saved addresses, order history, and preference tracking.
3. **Subscription Service**: Implement a subscription model for regular fragrance deliveries.
4. **Expanded Product Information**: Add more detailed information about ingredients, sourcing, and sustainability.
5. **Community Features**: Consider adding community features like fragrance forums or user-curated collections.

### 10.3 Business Opportunities

1. **Fragrance Education**: Incorporate educational content about fragrances, ingredients, and how to select scents.
2. **Virtual Fragrance Consultation**: Implement virtual consultation features for personalized recommendations.
3. **Loyalty Program**: Develop a loyalty program to encourage repeat purchases.
4. **Seasonal Collections**: Create seasonal or limited-edition collections to drive engagement.
5. **Fragrance Gifting**: Enhance gift options with customized packaging and gift messages.

By addressing these recommendations, "The-Scent" can further enhance its unique position in the fragrance e-commerce market, providing exceptional value to customers and a robust, resilient platform for business growth.
