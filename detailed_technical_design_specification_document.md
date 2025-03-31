# The Scent E-commerce Platform - Technical Design Specification Document

## 1. Overview

### 1.1 Project Description

"The Scent" is a sophisticated e-commerce platform specializing in aromatherapy products like essential oils, diffusers, and scented personal care items. The platform aims to provide users with a personalized shopping experience by incorporating a scent finder quiz that recommends products based on user preferences, mood, and wellness goals. The application features a comprehensive product catalog, detailed product pages with scent profiles, shopping cart functionality, user authentication, wishlist capabilities, and secure checkout with Stripe integration.

### 1.2 Design Requirements

The platform requirements include:

1. **User Authentication System**: Secure login, registration, and account management functionality.
2. **Product Catalog**: Display and organization of products with filtering and categorization.
3. **Scent Finder Quiz**: Interactive questionnaire to recommend personalized products.
4. **Shopping Cart & Checkout**: Cart management and secure payment processing.
5. **Wishlist Functionality**: Allow users to save products for future consideration.
6. **Responsive Design**: Optimized experience across all device sizes.
7. **Stripe Integration**: Secure payment processing for customer orders.

### 1.3 Technology Stack

The application is built using modern web technologies:

- **Frontend**: React.js, TailwindCSS, ShadcnUI components, Framer Motion
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (schema defined using Drizzle ORM)
- **Authentication**: Passport.js with session-based authentication
- **Payment Processing**: Stripe
- **State Management**: Context API and React Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation

### 1.4 Design Methodology and Approach

The platform follows a modern application architecture with a clear separation of concerns:

- **Feature-Based Organization**: Code is organized by features (auth, cart, checkout, etc.).
- **Context-Based State Management**: Global state is managed using React Context API.
- **Typed Data Model**: Shared schema with TypeScript types for frontend and backend.
- **API-First Design**: Backend provides RESTful API endpoints for all functionality.
- **Storage Interface Abstraction**: Common interface for data operations, allowing easy switching between storage implementations.

## 2. Data Model and Schema

### 2.1 Core Schema

The application uses Drizzle ORM with PostgreSQL to define the data schema. The schema is shared between the frontend and backend, ensuring type safety across the application.

```typescript
// Core entities from shared/schema.ts
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  role: userRoleEnum("role").default('user'),
  loginAttempts: integer("login_attempts").default(0),
  lockUntil: timestamp("lock_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  imageUrl: text("image_url").notNull(),
  featured: boolean("featured").default(false),
  reviewCount: integer("review_count").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  stock: integer("stock").default(100),
  sku: text("sku").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  status: orderStatusEnum("status").default('pending'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddressId: integer("shipping_address_id").notNull().references(() => addresses.id),
  billingAddressId: integer("billing_address_id").notNull().references(() => addresses.id),
  paymentStatus: paymentStatusEnum("payment_status").default('pending'),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 2.2 Schema Extensions for Aromatherapy E-commerce

The schema includes specialized entities for the aromatherapy domain:

```typescript
// Specialized entities for aromatherapy domain
export const scentProfiles = pgTable("scent_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconClass: text("icon_class"),
});

export const productScentProfiles = pgTable("product_scent_profiles", {
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  scentProfileId: integer("scent_profile_id").notNull().references(() => scentProfiles.id, { onDelete: "cascade" }),
  intensity: integer("intensity").default(5),
});

export const moods = pgTable("moods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  iconClass: text("icon_class"),
});

export const productMoods = pgTable("product_moods", {
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  moodId: integer("mood_id").notNull().references(() => moods.id, { onDelete: "cascade" }),
  effectiveness: integer("effectiveness").default(5),
});
```

### 2.3 Type Definitions and Zod Schemas

The application leverages Zod for runtime validation and type inference:

```typescript
// Type definitions with Zod
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, loginAttempts: true, lockUntil: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true, reviewCount: true, averageRating: true });
export const insertCartSchema = createInsertSchema(carts).omit({ id: true, createdAt: true, updatedAt: true });

// Export Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;
```

## 3. Backend Architecture

### 3.1 Storage Interface

The application uses a storage interface pattern to abstract data operations, enabling easy switching between different storage implementations (memory, database, etc.).

```typescript
// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Product methods
  getProducts(limit?: number, offset?: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  // ... additional methods
  
  // Session store
  sessionStore: session.SessionStore;
}

// Memory-based implementation
export class MemStorage implements IStorage {
  private userMap: Map<number, User> = new Map();
  private productMap: Map<number, Product> = new Map();
  // ... additional maps
  
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.initSampleData();
  }
  
  // Implementation of interface methods
  async getUser(id: number): Promise<User | undefined> {
    return this.userMap.get(id);
  }
  
  // ... additional method implementations
}
```

### 3.2 Authentication System

The authentication system uses Passport.js with a local strategy and secure password hashing:

```typescript
// Auth setup
export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "thescent-secret-key",
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
        // Authentication logic
      }
    )
  );
  
  // Auth routes for login, register, logout
  app.post("/api/register", async (req, res, next) => {
    // Registration logic
  });
  
  app.post("/api/login", (req, res, next) => {
    // Login logic with account locking for security
  });
}
```

### 3.3 API Routes

The application provides RESTful API endpoints for all major functionality:

```typescript
export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes
  setupAuth(app);

  // Category routes
  app.get("/api/categories", async (req, res) => {
    // Get all categories
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    // Get all products with pagination
  });

  app.get("/api/products/featured", async (req, res) => {
    // Get featured products
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    // Get cart for authenticated user
  });

  app.post("/api/cart/items", async (req, res) => {
    // Add item to cart
  });

  // Wishlist routes, scent profiles, moods, etc.
  // ...
  
  const httpServer = createServer(app);
  return httpServer;
}
```

### 3.4 Stripe Integration

The application integrates with Stripe for payment processing:

```typescript
// Example Stripe integration in server/routes.ts
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating payment intent: " + error.message });
  }
});
```

## 4. Frontend Architecture

### 4.1 Component Structure

The frontend is organized by features and follows a component-based architecture:

- **Layout Components**: Base layout, navigation, footer
- **Page Components**: Home, Shop, Product Detail, Cart, Checkout, etc.
- **Feature Components**: Product card, cart summary, auth forms, etc.
- **UI Components**: Buttons, inputs, and other reusable UI elements from ShadcnUI

### 4.2 State Management with Context API

The application uses Context API for global state management:

#### 4.2.1 Authentication Context

```typescript
// Auth context
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (userData: Omit<User, "password">) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.firstName || userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register and logout mutations
  // ...

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

#### 4.2.2 Cart Context

```typescript
// Cart context
export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    data: cart,
    error,
    isLoading,
  } = useQuery<Cart | null>({
    queryKey: ["/api/cart"],
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });
  
  const addToCartMutation = useMutation({
    mutationFn: async (data: AddToCartData) => {
      const res = await apiRequest("POST", "/api/cart/items", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Additional mutations and calculated properties
  // ...

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addToCart: (data) => addToCartMutation.mutate(data),
        updateCartItem: (data) => updateCartItemMutation.mutate(data),
        removeCartItem: (id) => removeCartItemMutation.mutate(id),
        clearCart,
        itemCount,
        subtotal,
        isEmpty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
```

### 4.3 Data Fetching with React Query

The application uses React Query for data fetching, caching, and state management:

```typescript
// QueryClient configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Example usage in components
const { data: products, isLoading, error } = useQuery<Product[]>({
  queryKey: ["/api/products/featured"],
});
```

### 4.4 Form Handling with React Hook Form and Zod

The application uses React Hook Form with Zod validation for form handling:

```typescript
// Login form validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Form usage in components
const form = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    email: "",
    password: "",
  },
});

const onSubmit = (data: LoginFormValues) => {
  loginMutation.mutate(data);
};

// Form rendering
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="your@email.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    {/* Additional form fields */}
  </form>
</Form>
```

### 4.5 Routing with Wouter

The application uses Wouter for routing:

```typescript
// App.tsx - Main routing configuration
function Router() {
  return (
    <RootLayout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/shop" component={ShopPage} />
        <Route path="/products/:slug" component={ProductDetailPage} />
        <Route path="/cart" component={CartPage} />
        <ProtectedRoute path="/checkout" component={CheckoutPage} />
        <Route path="/scent-finder" component={ScentFinderPage} />
        <Route component={NotFound} />
      </Switch>
    </RootLayout>
  );
}
```

## 5. Key Features Implementation

### 5.1 Product Catalog

The product catalog displays products with filtering and pagination:

```tsx
// Featured Products Component
export function FeaturedProducts() {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  if (error) {
    return (
      <section className="py-16 px-6 bg-secondary/30">
        <div className="container mx-auto text-center">
          <p className="text-red-500">Failed to load featured products. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 bg-secondary/30">
      <div className="container mx-auto">
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-heading mb-4 md:mb-0">Bestselling Products</h2>
          <Link href="/shop">
            <a className="text-primary hover:text-accent flex items-center font-medium">
              <span>View All Products</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                {/* Skeleton UI */}
              </div>
            ))
          ) : (
            products?.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
```

### 5.2 Scent Finder Quiz

The scent finder quiz feature provides personalized product recommendations:

```tsx
// QuizForm component for the scent finder
export function QuizForm({ onComplete }: QuizFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  // Get scent profiles data
  const { data: scentProfiles } = useQuery({
    queryKey: ["/api/scent-profiles"],
  });
  
  // Get moods data
  const { data: moods } = useQuery({
    queryKey: ["/api/moods"],
  });
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  const handleSingleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    });
  };
  
  // Handle other answer types (multi, slider)
  // ...
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Process results and go to results page
      const results = processResults();
      onComplete(results);
    }
  };
  
  const processResults = () => {
    // Algorithm to determine recommendations based on answers
    // ...
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-3xl font-heading mb-2 text-center">Find Your Perfect Scent</h1>
      <p className="text-neutral-mid mb-8 text-center">Answer a few questions to discover products tailored just for you</p>
      
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-neutral-mid">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {/* Question rendering based on type */}
          {/* ... */}
        </motion.div>
      </AnimatePresence>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isQuestionAnswered()}
          className="bg-primary hover:bg-primary-dark"
        >
          {currentQuestionIndex < questions.length - 1 ? (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Get Results"
          )}
        </Button>
      </div>
    </div>
  );
}
```

### 5.3 Shopping Cart Implementation

The shopping cart functionality allows adding, updating, and removing items:

```tsx
// Cart Summary Component
export function CartSummary({ showCheckoutButton = true }: CartSummaryProps) {
  const { cart, isLoading, itemCount, subtotal, isEmpty } = useCart();
  const [, navigate] = useLocation();
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        {/* Loading skeleton */}
      </div>
    );
  }
  
  if (isEmpty) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-heading mb-4">Your Cart</h2>
        <div className="py-8 text-center">
          <ShoppingCart className="mx-auto h-8 w-8 text-neutral-mid mb-4" />
          <p className="text-neutral-mid">Your cart is empty</p>
          <Button
            onClick={() => navigate("/shop")}
            className="mt-4 bg-primary hover:bg-primary-dark"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <h2 className="text-xl font-heading mb-4">Order Summary</h2>
      
      {/* Cart Items Summary */}
      <div className="space-y-3 mb-4">
        {cart?.items.slice(0, 3).map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="flex-1">
              {item.product.name} <span className="text-neutral-mid">x{item.quantity}</span>
            </span>
            <span className="font-medium">
              ${(parseFloat(item.product.price.toString()) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        
        {/* Show more items indicator if needed */}
        {/* ... */}
      </div>
      
      {/* Subtotals, shipping, total */}
      {/* ... */}
      
      {/* Checkout Button */}
      {showCheckoutButton && (
        <Button
          className="w-full mt-6 bg-primary hover:bg-primary-dark"
          onClick={() => navigate("/checkout")}
          disabled={isEmpty}
        >
          Proceed to Checkout
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}
```

### 5.4 Checkout Flow with Stripe Integration

The checkout process involves address collection and payment using Stripe:

```tsx
// PaymentForm Component
export function PaymentForm({ onComplete, onBack }: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit-card");
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      nameOnCard: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    }
  });
  
  const onSubmit = async (data: PaymentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would call the Stripe API
      // For demo purposes, we'll simulate a successful payment
      setTimeout(() => {
        onComplete(data);
      }, 1500);
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format helpers for card inputs
  // ...
  
  return (
    <div>
      <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="credit-card" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Credit Card</span>
          </TabsTrigger>
          <TabsTrigger value="paypal" disabled>
            <span>PayPal (Coming Soon)</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="credit-card">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Form fields for credit card */}
              {/* ... */}
              
              <div className="text-sm text-neutral-mid mt-2">
                <p>For testing purposes, use:</p>
                <p>Card Number: 4242 4242 4242 4242</p>
                <p>Expiry: Any future date</p>
                <p>CVV: Any 3 digits</p>
              </div>
              
              <div className="pt-6 flex flex-col sm:flex-row gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={onBack}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Shipping
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 5.5 Authentication and User Management

The application provides secure authentication with session management:

```tsx
// AuthPage Component
export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  // Render login and registration forms with tabs
  // ...
}
```

## 6. UI/UX Design Implementation

### 6.1 Responsive Layout

The application uses a responsive grid-based layout:

```tsx
// Example of responsive grid in product catalog
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
  {products?.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

### 6.2 Animations with Framer Motion

The application uses Framer Motion for smooth animations and transitions:

```tsx
// Example animation in homepage hero
<motion.div 
  className="max-w-3xl text-center mx-auto"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-light text-white mb-6 leading-tight">
    Find Your Perfect Scent
  </h1>
  <p className="text-base md:text-xl text-white mb-8 font-accent font-light">
    Let us guide you to the aromatherapy products that match your preferences,
    mood, and wellness goals with our personalized scent finder.
  </p>
  <Button
    size="lg"
    className="bg-primary hover:bg-primary-dark text-white"
    onClick={handleStartQuiz}
  >
    Take The Quiz
  </Button>
</motion.div>
```

### 6.3 Loading States and Skeletons

The application provides responsive feedback with skeleton loaders during data fetching:

```tsx
// Example of skeleton loader
{isLoading ? (
  // Loading skeleton
  Array.from({ length: 4 }).map((_, index) => (
    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-square bg-gray-200"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  ))
) : (
  // Actual content
)}
```

### 6.4 Toast Notifications

The application uses toast notifications for user feedback:

```tsx
// Example toast usage
toast({
  title: "Added to cart",
  description: `${product.name} has been added to your cart.`,
});
```

## 7. Security Considerations

### 7.1 Password Security

The application implements secure password hashing using scrypt:

```typescript
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
```

### 7.2 Account Locking

The application implements account locking to prevent brute force attacks:

```typescript
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
}
```

### 7.3 Protected Routes

The application uses protected routes to guard authenticated content:

```tsx
// ProtectedRoute Component
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
```

## 8. Analysis of Current Implementation

### 8.1 Strengths

1. **Comprehensive Data Model**: The schema design is thorough and well-structured, capturing the specialized requirements of an aromatherapy e-commerce platform.
   
2. **Clean Architecture**: The application follows a clean architecture with separation of concerns, making it maintainable and extensible.
   
3. **Type Safety**: The use of TypeScript, Drizzle ORM, and Zod provides strong type safety across the entire application.
   
4. **Storage Abstraction**: The storage interface pattern allows flexibility in data storage implementations, making it easy to switch between memory storage and a database.
   
5. **Modern Frontend Patterns**: The application leverages modern React patterns, including hooks, context, and composition.
   
6. **Responsive Design**: The UI is responsive and optimized for all device sizes with a clean, modern aesthetic.
   
7. **Security Focus**: The application implements proper password hashing, account locking, and other security measures.

### 8.2 Areas for Improvement

1. **Error Handling**: While the application has basic error handling, it could benefit from more comprehensive error handling, especially in edge cases.
   
2. **Testing**: The current implementation lacks comprehensive testing suites for both frontend and backend.
   
3. **Database Implementation**: The current implementation uses in-memory storage. A complete implementation would include setting up a PostgreSQL database.
   
4. **Stripe Integration Completeness**: The Stripe integration could be expanded to include subscription options, saved payment methods, and other advanced features.
   
5. **SEO Optimization**: The application could benefit from enhanced SEO features, including structured data and better meta tags.
   
6. **Accessibility**: While the application uses ShadcnUI components which have good accessibility, a more comprehensive accessibility audit would be beneficial.
   
7. **Internationalization**: The application currently lacks internationalization support for multiple languages and currencies.

### 8.3 Missing Functionality

1. **Order History**: The data model includes orders, but the frontend implementation for viewing order history is missing.
   
2. **Admin Dashboard**: There's no admin interface for managing products, orders, and users.
   
3. **Advanced Filtering**: The product catalog could benefit from more advanced filtering options.
   
4. **Email Notifications**: The application doesn't include email notifications for order confirmations, shipping updates, etc.
   
5. **Search Functionality**: The application lacks a robust search feature for finding products.

## 9. Recommendations

### 9.1 Immediate Improvements

1. **Database Implementation**: Replace the in-memory storage with a PostgreSQL database implementation.
   
2. **Comprehensive Testing**: Implement unit and integration tests for critical functionality.
   
3. **Enhanced Error Handling**: Improve error handling throughout the application with more descriptive error messages and recovery options.
   
4. **Order Management**: Complete the order history and management functionality.
   
5. **Search Implementation**: Add search functionality to make finding products easier.

### 9.2 Medium-Term Enhancements

1. **Admin Dashboard**: Develop an admin interface for managing products, orders, and users.
   
2. **Email Integration**: Add email notifications for order confirmations, shipping updates, and marketing communications.
   
3. **Advanced Analytics**: Implement analytics to track user behavior and optimize the shopping experience.
   
4. **Performance Optimization**: Audit and optimize performance, including code splitting, lazy loading, and caching strategies.
   
5. **Enhanced SEO**: Improve SEO with structured data, optimized meta tags, and sitemap generation.

### 9.3 Long-Term Vision

1. **Internationalization**: Add support for multiple languages and currencies.
   
2. **Progressive Web App**: Transform the application into a Progressive Web App for offline capabilities and mobile installation.
   
3. **Personalization Engine**: Enhance the recommendation system with machine learning to provide better personalized recommendations.
   
4. **Subscription Model**: Implement a subscription model for recurring orders of aromatherapy products.
   
5. **Mobile Application**: Develop native mobile applications for iOS and Android.

## 10. Conclusion

"The Scent" e-commerce platform represents a well-structured, modern web application that effectively addresses the specialized needs of an aromatherapy products business. The application successfully implements core e-commerce functionality, including product catalog, cart management, and checkout with Stripe integration. It also includes specialized features such as the scent finder quiz for personalized product recommendations.

The architecture follows modern best practices, leveraging React, Express, TypeScript, and a range of supporting technologies. The storage interface pattern provides flexibility for future expansion, while the comprehensive data model captures the domain requirements effectively.

While the current implementation provides a solid foundation, there are several areas for improvement and expansion. By following the recommendations outlined in this document, the application can evolve into a more comprehensive, robust, and feature-rich e-commerce platform.

The strong focus on user experience, combined with the specialized domain features, positions "The Scent" as a unique and compelling e-commerce solution in the aromatherapy market. With the planned enhancements, it has the potential to provide an exceptional shopping experience that specifically addresses the unique needs of aromatherapy enthusiasts.