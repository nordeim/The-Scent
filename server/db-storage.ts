import { eq, and, asc, desc, inArray, sql } from 'drizzle-orm';
import { db, pool } from './db';
import {
  users, products, categories, carts, cartItems, orders, orderItems,
  wishlists, addresses, reviews, newsletterSubscriptions, enquiries,
  scentProfiles, moods, productScentProfiles, productMoods, productIngredients,
  productBenefits, productImages, lifestyleItems, User, InsertUser, Product,
  InsertProduct, Category, InsertCategory, Cart, InsertCart, CartItem,
  InsertCartItem, Order, InsertOrder, OrderItem, InsertOrderItem, Wishlist,
  InsertWishlist, Address, InsertAddress, Review, InsertReview,
  NewsletterSubscription, InsertNewsletterSubscription, Enquiry, InsertEnquiry
} from '@shared/schema';
import { IStorage } from './storage';
import session from 'express-session';
import { Store } from 'express-session';
import connectPgSimple from 'connect-pg-simple';

const PostgresStore = connectPgSimple(session);

/**
 * PostgreSQL implementation of the storage interface
 */
export class DbStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    // Initialize PostgreSQL session store
    this.sessionStore = new PostgresStore({
      pool: pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    return result;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    return result;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [result] = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    const result = await db.query.categories.findMany();
    return result;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.query.categories.findFirst({
      where: eq(categories.slug, slug)
    });
    return result;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [result] = await db.insert(categories).values(category).returning();
    return result;
  }

  // Product methods
  async getProducts(limit: number = 20, offset: number = 0): Promise<Product[]> {
    const result = await db.query.products.findMany({
      limit,
      offset,
      orderBy: [desc(products.createdAt)]
    });
    return result;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const result = await db.query.products.findMany({
      where: eq(products.featured, true),
      orderBy: [desc(products.createdAt)]
    });
    return result;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const result = await db.query.products.findMany({
      where: eq(products.categoryId, categoryId),
      orderBy: [desc(products.createdAt)]
    });
    return result;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const result = await db.query.products.findFirst({
      where: eq(products.sku, sku)
    });
    return result;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const result = await db.query.products.findFirst({
      where: eq(products.id, id)
    });
    return result;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const result = await db.query.products.findFirst({
      where: eq(products.slug, slug)
    });
    return result;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [result] = await db.insert(products).values(product).returning();
    return result;
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const [result] = await db.update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result;
  }

  async getProductIngredients(productId: number): Promise<string[]> {
    const result = await db.select({
      ingredient: productIngredients.ingredient
    })
    .from(productIngredients)
    .where(eq(productIngredients.productId, productId));
    
    return result.map(r => r.ingredient);
  }

  async getProductBenefits(productId: number): Promise<string[]> {
    const result = await db.select({
      benefit: productBenefits.benefit
    })
    .from(productBenefits)
    .where(eq(productBenefits.productId, productId));
    
    return result.map(r => r.benefit);
  }

  async getProductImages(productId: number): Promise<string[]> {
    const result = await db.select({
      imageUrl: productImages.imageUrl
    })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.sortOrder));
    
    return result.map(r => r.imageUrl);
  }

  async getProductScentProfiles(productId: number): Promise<any[]> {
    const result = await db.select({
      scentProfile: scentProfiles,
      intensity: productScentProfiles.intensity
    })
    .from(productScentProfiles)
    .innerJoin(scentProfiles, eq(scentProfiles.id, productScentProfiles.scentProfileId))
    .where(eq(productScentProfiles.productId, productId));
    
    return result.map(r => ({
      ...r.scentProfile,
      intensity: r.intensity
    }));
  }

  async getProductMoods(productId: number): Promise<any[]> {
    const result = await db.select({
      mood: moods,
      effectiveness: productMoods.effectiveness
    })
    .from(productMoods)
    .innerJoin(moods, eq(moods.id, productMoods.moodId))
    .where(eq(productMoods.productId, productId));
    
    return result.map(r => ({
      ...r.mood,
      effectiveness: r.effectiveness
    }));
  }

  // Cart methods
  async getCartByUserId(userId: number): Promise<Cart | undefined> {
    const result = await db.query.carts.findFirst({
      where: eq(carts.userId, userId)
    });
    return result;
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const [result] = await db.insert(carts).values(cart).returning();
    return result;
  }

  async getCartItems(cartId: number): Promise<CartItem[]> {
    const result = await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, cartId)
    });
    return result;
  }

  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.cartId, cartItem.cartId),
        eq(cartItems.productId, cartItem.productId)
      )
    });

    if (existingItem) {
      // Update quantity instead of adding new item
      const [result] = await db.update(cartItems)
        .set({ 
          quantity: existingItem.quantity + (cartItem.quantity || 1),
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return result;
    }

    // Add new item
    const [result] = await db.insert(cartItems).values(cartItem).returning();
    return result;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const [result] = await db.update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return result;
  }

  async removeCartItem(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  // Wishlist methods
  async getWishlistByUserId(userId: number): Promise<Wishlist[]> {
    const result = await db.query.wishlists.findMany({
      where: eq(wishlists.userId, userId)
    });
    return result;
  }

  async addToWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    const [result] = await db.insert(wishlists).values(wishlist).returning();
    return result;
  }

  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    await db.delete(wishlists).where(
      and(
        eq(wishlists.userId, userId),
        eq(wishlists.productId, productId)
      )
    );
  }

  async isInWishlist(userId: number, productId: number): Promise<boolean> {
    const result = await db.query.wishlists.findFirst({
      where: and(
        eq(wishlists.userId, userId),
        eq(wishlists.productId, productId)
      )
    });
    return !!result;
  }

  // Address methods
  async getUserAddresses(userId: number): Promise<Address[]> {
    const result = await db.query.addresses.findMany({
      where: eq(addresses.userId, userId)
    });
    return result;
  }

  async getAddress(id: number): Promise<Address | undefined> {
    const result = await db.query.addresses.findFirst({
      where: eq(addresses.id, id)
    });
    return result;
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    // If this is set as default, remove default flag from other addresses
    if (address.isDefault) {
      await db.update(addresses)
        .set({ isDefault: false })
        .where(and(
          eq(addresses.userId, address.userId),
          eq(addresses.isDefault, true)
        ));
    }

    const [result] = await db.insert(addresses).values(address).returning();
    return result;
  }

  async updateAddress(id: number, addressData: Partial<Address>): Promise<Address | undefined> {
    // If this is set as default, remove default flag from other addresses
    if (addressData.isDefault) {
      const existingAddress = await this.getAddress(id);
      if (existingAddress) {
        await db.update(addresses)
          .set({ isDefault: false })
          .where(and(
            eq(addresses.userId, existingAddress.userId),
            eq(addresses.isDefault, true),
            sql`${addresses.id} != ${id}`
          ));
      }
    }

    const [result] = await db.update(addresses)
      .set({ ...addressData, updatedAt: new Date() })
      .where(eq(addresses.id, id))
      .returning();
    return result;
  }

  async deleteAddress(id: number): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const [result] = await db.insert(orders).values(order).returning();
    return result;
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [result] = await db.insert(orderItems).values(orderItem).returning();
    return result;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    const result = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: [desc(orders.createdAt)]
    });
    return result;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.query.orders.findFirst({
      where: eq(orders.id, id)
    });
    return result;
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, orderId)
    });
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [result] = await db.update(orders)
      .set({ 
        status: status as any, // Cast to any to handle enum
        updatedAt: new Date() 
      })
      .where(eq(orders.id, id))
      .returning();
    return result;
  }

  // Review methods
  async createReview(review: InsertReview): Promise<Review> {
    // Begin a transaction to update product rating as well
    const [result] = await db.transaction(async (tx) => {
      // Insert the review
      const [newReview] = await tx.insert(reviews).values(review).returning();
      
      // Update the product's review count and average rating
      const allReviews = await tx.query.reviews.findMany({
        where: eq(reviews.productId, review.productId),
        columns: { rating: true }
      });
      
      const reviewCount = allReviews.length;
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;
      
      await tx.update(products)
        .set({ 
          reviewCount, 
          averageRating: avgRating.toFixed(2),
          updatedAt: new Date()
        })
        .where(eq(products.id, review.productId));
      
      return [newReview];
    });
    
    return result;
  }

  async getProductReviews(productId: number): Promise<Review[]> {
    const result = await db.query.reviews.findMany({
      where: eq(reviews.productId, productId),
      orderBy: [desc(reviews.createdAt)]
    });
    return result;
  }

  // Newsletter methods
  async subscribeToNewsletter(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    // Check if already subscribed
    const existing = await db.query.newsletterSubscriptions.findFirst({
      where: eq(newsletterSubscriptions.email, subscription.email)
    });
    
    if (existing) {
      return existing;
    }
    
    const [result] = await db.insert(newsletterSubscriptions).values(subscription).returning();
    return result;
  }

  // Contact methods
  async createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry> {
    const [result] = await db.insert(enquiries).values(enquiry).returning();
    return result;
  }

  // Misc methods
  async getScentProfiles(): Promise<any[]> {
    const result = await db.query.scentProfiles.findMany();
    return result;
  }

  async getMoods(): Promise<any[]> {
    const result = await db.query.moods.findMany();
    return result;
  }

  async getLifestyleItems(): Promise<any[]> {
    const result = await db.query.lifestyleItems.findMany();
    return result;
  }
}