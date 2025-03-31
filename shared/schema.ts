import { pgTable, text, serial, decimal, integer, boolean, timestamp, pgEnum, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums as tables
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed', 'refunded']);

// Users
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

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Products
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

// Product ingredients
export const productIngredients = pgTable("product_ingredients", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  ingredient: text("ingredient").notNull(),
});

// Product benefits
export const productBenefits = pgTable("product_benefits", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  benefit: text("benefit").notNull(),
});

// Product additional images
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").default(0),
});

// Scent profiles
export const scentProfiles = pgTable("scent_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconClass: text("icon_class"),
});

// Product scent profiles
export const productScentProfiles = pgTable("product_scent_profiles", {
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  scentProfileId: integer("scent_profile_id").notNull().references(() => scentProfiles.id, { onDelete: "cascade" }),
  intensity: integer("intensity").default(5),
});

// Moods
export const moods = pgTable("moods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  iconClass: text("icon_class"),
});

// Product moods
export const productMoods = pgTable("product_moods", {
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  moodId: integer("mood_id").notNull().references(() => moods.id, { onDelete: "cascade" }),
  effectiveness: integer("effectiveness").default(5),
});

// Addresses
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wishlists
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Carts
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cart items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders
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

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Newsletter subscriptions
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enquiries/Contact messages
export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// LifestyleItems
export const lifestyleItems = pgTable("lifestyle_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  link: text("link").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod Schemas for Insert
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, loginAttempts: true, lockUntil: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true, reviewCount: true, averageRating: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCartSchema = createInsertSchema(carts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWishlistSchema = createInsertSchema(wishlists).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAddressSchema = createInsertSchema(addresses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true });
export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({ id: true, createdAt: true });
export const insertEnquirySchema = createInsertSchema(enquiries).omit({ id: true, createdAt: true });

// Export Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;

export type Enquiry = typeof enquiries.$inferSelect;
export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;

export type ScentProfile = typeof scentProfiles.$inferSelect;
export type Mood = typeof moods.$inferSelect;
