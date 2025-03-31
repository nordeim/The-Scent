import { users, products, categories, carts, cartItems, orders, orderItems, 
  wishlists, addresses, reviews, newsletterSubscriptions, enquiries, 
  scentProfiles, moods, productScentProfiles, productMoods, productIngredients, 
  productBenefits, productImages, lifestyleItems, User, InsertUser, Product, 
  InsertProduct, Category, InsertCategory, Cart, InsertCart, CartItem, 
  InsertCartItem, Order, InsertOrder, OrderItem, InsertOrderItem, Wishlist, 
  InsertWishlist, Address, InsertAddress, Review, InsertReview, 
  NewsletterSubscription, InsertNewsletterSubscription, Enquiry, InsertEnquiry } from "@shared/schema";
import session from "express-session";
import { Store } from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product methods
  getProducts(limit?: number, offset?: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  getProductIngredients(productId: number): Promise<string[]>;
  getProductBenefits(productId: number): Promise<string[]>;
  getProductImages(productId: number): Promise<string[]>;
  getProductScentProfiles(productId: number): Promise<any[]>;
  getProductMoods(productId: number): Promise<any[]>;
  
  // Cart methods
  getCartByUserId(userId: number): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  getCartItems(cartId: number): Promise<CartItem[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<void>;
  
  // Wishlist methods
  getWishlistByUserId(userId: number): Promise<Wishlist[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: number, productId: number): Promise<void>;
  isInWishlist(userId: number, productId: number): Promise<boolean>;
  
  // Address methods
  getUserAddresses(userId: number): Promise<Address[]>;
  getAddress(id: number): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<Address>): Promise<Address | undefined>;
  deleteAddress(id: number): Promise<void>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getUserOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Review methods
  createReview(review: InsertReview): Promise<Review>;
  getProductReviews(productId: number): Promise<Review[]>;
  
  // Newsletter methods
  subscribeToNewsletter(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  
  // Contact methods
  createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry>;
  
  // Misc
  getScentProfiles(): Promise<any[]>;
  getMoods(): Promise<any[]>;
  getLifestyleItems(): Promise<any[]>;
  
  // Session store
  sessionStore: Store;
}

export class MemStorage implements IStorage {
  private userMap: Map<number, User> = new Map();
  private productMap: Map<number, Product> = new Map();
  private categoryMap: Map<number, Category> = new Map();
  private cartMap: Map<number, Cart> = new Map();
  private cartItemMap: Map<number, CartItem> = new Map();
  private orderMap: Map<number, Order> = new Map();
  private orderItemMap: Map<number, OrderItem> = new Map();
  private wishlistMap: Map<number, Wishlist> = new Map();
  private addressMap: Map<number, Address> = new Map();
  private reviewMap: Map<number, Review> = new Map();
  private newsletterMap: Map<number, NewsletterSubscription> = new Map();
  private enquiryMap: Map<number, Enquiry> = new Map();
  private scentProfileMap: Map<number, any> = new Map();
  private moodMap: Map<number, any> = new Map();
  private productIngredientMap: Map<number, string[]> = new Map();
  private productBenefitMap: Map<number, string[]> = new Map();
  private productImageMap: Map<number, string[]> = new Map();
  private productScentProfileMap: Map<number, any[]> = new Map();
  private productMoodMap: Map<number, any[]> = new Map();
  private lifestyleItemMap: Map<number, any> = new Map();
  
  private userIdCounter = 1;
  private productIdCounter = 1;
  private categoryIdCounter = 1;
  private cartIdCounter = 1;
  private cartItemIdCounter = 1;
  private orderIdCounter = 1;
  private orderItemIdCounter = 1;
  private wishlistIdCounter = 1;
  private addressIdCounter = 1;
  private reviewIdCounter = 1;
  private newsletterIdCounter = 1;
  private enquiryIdCounter = 1;
  private scentProfileIdCounter = 1;
  private moodIdCounter = 1;
  
  sessionStore: Store;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Initialize categories
    const essentialOils = this.createCategory({
      name: "Essential Oils",
      slug: "essential-oils", 
      description: "Pure, therapeutic-grade oils to elevate your mood and environment.",
      imageUrl: "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent2.jpg"
    });
    
    const naturalSoaps = this.createCategory({
      name: "Natural Soaps",
      slug: "natural-soaps", 
      description: "Handcrafted soaps made with premium natural ingredients.",
      imageUrl: "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/soap2.jpg"
    });
    
    const giftSets = this.createCategory({
      name: "Gift Sets",
      slug: "gift-sets", 
      description: "Curated collections perfect for gifting or treating yourself.",
      imageUrl: "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent6.jpg"
    });
    
    // Initialize scent profiles
    const floral = {
      id: this.scentProfileIdCounter++,
      name: "Floral",
      description: "Delicate, sweet floral notes",
      iconClass: "fa-flower"
    };
    this.scentProfileMap.set(floral.id, floral);
    
    const citrus = {
      id: this.scentProfileIdCounter++,
      name: "Citrus",
      description: "Fresh, zesty citrus scents",
      iconClass: "fa-lemon"
    };
    this.scentProfileMap.set(citrus.id, citrus);
    
    const woody = {
      id: this.scentProfileIdCounter++,
      name: "Woody",
      description: "Deep, earthy woody undertones",
      iconClass: "fa-tree"
    };
    this.scentProfileMap.set(woody.id, woody);
    
    const spicy = {
      id: this.scentProfileIdCounter++,
      name: "Spicy",
      description: "Warm, piquant spicy notes",
      iconClass: "fa-pepper-hot"
    };
    this.scentProfileMap.set(spicy.id, spicy);
    
    // Initialize moods
    const relaxation = {
      id: this.moodIdCounter++,
      name: "Relaxation",
      description: "Find products to help you unwind and destress after a long day.",
      iconClass: "fa-moon"
    };
    this.moodMap.set(relaxation.id, relaxation);
    
    const energy = {
      id: this.moodIdCounter++,
      name: "Energy",
      description: "Discover scents that invigorate and boost your energy levels.",
      iconClass: "fa-bolt"
    };
    this.moodMap.set(energy.id, energy);
    
    const focus = {
      id: this.moodIdCounter++,
      name: "Focus",
      description: "Enhance your concentration and mental clarity with targeted scents.",
      iconClass: "fa-brain"
    };
    this.moodMap.set(focus.id, focus);
    
    const balance = {
      id: this.moodIdCounter++,
      name: "Balance",
      description: "Find harmony with blends designed to center and ground your emotions.",
      iconClass: "fa-heart"
    };
    this.moodMap.set(balance.id, balance);
    
    // Initialize products
    const lavenderOil = this.createProduct({
      name: "Lavender Essential Oil",
      slug: "lavender-essential-oil",
      price: "24.99",
      description: "Our pure lavender essential oil is sourced from high-altitude lavender fields, ensuring the highest quality oil with a rich, floral scent. Known for its calming properties, this versatile essential oil can help reduce anxiety, improve sleep quality, and promote relaxation.",
      shortDescription: "Pure, calming lavender for relaxation",
      imageUrl: "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent4.jpg",
      featured: true,
      reviewCount: 48,
      averageRating: "4.5",
      categoryId: essentialOils.id,
      stock: 100,
      sku: "EO-LAV-001"
    });
    
    // Add product ingredients
    this.productIngredientMap.set(lavenderOil.id, [
      "100% Pure Lavandula angustifolia (Lavender) Oil",
      "No fillers, additives, bases, or carriers"
    ]);
    
    // Add product benefits
    this.productBenefitMap.set(lavenderOil.id, [
      "Promotes relaxation and mental calm",
      "Helps improve sleep quality",
      "Soothes minor skin irritations",
      "Creates a peaceful atmosphere"
    ]);
    
    // Add product scent profiles
    this.productScentProfileMap.set(lavenderOil.id, [
      { scentProfileId: floral.id, intensity: 8 },
      { scentProfileId: woody.id, intensity: 3 }
    ]);
    
    // Add product moods
    this.productMoodMap.set(lavenderOil.id, [
      { moodId: relaxation.id, effectiveness: 9 },
      { moodId: balance.id, effectiveness: 7 }
    ]);
    
    // Initialize more products
    const eucalyptusOil = this.createProduct({
      name: "Eucalyptus Essential Oil",
      slug: "eucalyptus-essential-oil",
      price: "22.99",
      description: "Our eucalyptus essential oil is steam-distilled from eucalyptus leaves to preserve its fresh, invigorating scent and therapeutic properties. This refreshing oil is known for its ability to clear the mind, support respiratory health, and provide a revitalizing effect on the senses.",
      shortDescription: "Refreshing and clearing for the mind",
      imageUrl: "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent5.jpg",
      featured: true,
      reviewCount: 36,
      averageRating: "4.0",
      categoryId: essentialOils.id,
      stock: 85,
      sku: "EO-EUC-001"
    });
    
    const lavenderSoap = this.createProduct({
      name: "Lavender Infused Soap",
      slug: "lavender-infused-soap",
      price: "12.99",
      description: "Our lavender infused soap combines our premium lavender essential oil with nourishing ingredients to create a gentle cleansing experience. Handcrafted in small batches to ensure quality, this soap leaves your skin feeling soft and subtly scented with calming lavender.",
      shortDescription: "Gentle cleansing with calming scent",
      imageUrl: "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/soap4.jpg",
      featured: true,
      reviewCount: 52,
      averageRating: "5.0",
      categoryId: naturalSoaps.id,
      stock: 120,
      sku: "NS-LAV-001"
    });
    
    const citrusSoap = this.createProduct({
      name: "Citrus Fresh Soap",
      slug: "citrus-fresh-soap",
      price: "14.99",
      description: "Invigorate your morning routine with our Citrus Fresh Soap. This energizing blend combines sweet orange, lemon, and grapefruit essential oils to awaken your senses, while coconut oil and shea butter gently cleanse and moisturize your skin.",
      shortDescription: "Uplifting blend for energy and focus",
      imageUrl: "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/soap5.jpg",
      featured: true,
      reviewCount: 41,
      averageRating: "4.5",
      categoryId: naturalSoaps.id,
      stock: 95,
      sku: "NS-CIT-001"
    });
    
    const signatureBlend = this.createProduct({
      name: "Signature Blend Essential Oil",
      slug: "signature-blend-essential-oil",
      price: "29.99",
      description: "Our signature essential oil blend is carefully crafted to promote relaxation and mental clarity. This unique formulation combines lavender, bergamot, and sandalwood to create a harmonious balance that soothes the mind and rejuvenates the spirit.",
      shortDescription: "Our exclusive blend for relaxation and clarity",
      imageUrl: "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent2.jpg",
      featured: true,
      reviewCount: 63,
      averageRating: "4.8",
      categoryId: essentialOils.id,
      stock: 75,
      sku: "EO-SIG-001"
    });
    
    // Add product ingredients for signature blend
    this.productIngredientMap.set(signatureBlend.id, [
      "Lavandula angustifolia (Lavender) Oil",
      "Citrus bergamia (Bergamot) Oil",
      "Santalum album (Sandalwood) Oil",
      "No fillers, additives, bases, or carriers"
    ]);
    
    // Add product benefits for signature blend
    this.productBenefitMap.set(signatureBlend.id, [
      "Reduces stress and anxiety",
      "Promotes deep and restful sleep",
      "Improves focus and mental clarity",
      "Creates a calming atmosphere in any space"
    ]);
    
    // Add product images for signature blend
    this.productImageMap.set(signatureBlend.id, [
      "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent2.jpg",
      "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent4.jpg",
      "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent5.jpg",
      "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent6.jpg"
    ]);
    
    // Add product scent profiles for signature blend
    this.productScentProfileMap.set(signatureBlend.id, [
      { scentProfileId: floral.id, intensity: 7, position: { top: 30, left: 25 } },
      { scentProfileId: citrus.id, intensity: 6, position: { top: 20, left: 70 } },
      { scentProfileId: woody.id, intensity: 8, position: { top: 75, left: 35 } }
    ]);
    
    // Add product moods for signature blend
    this.productMoodMap.set(signatureBlend.id, [
      { moodId: relaxation.id, effectiveness: 9 },
      { moodId: focus.id, effectiveness: 7 },
      { moodId: balance.id, effectiveness: 8 }
    ]);
    
    // Initialize lifestyle items
    this.lifestyleItemMap.set(1, {
      id: 1,
      title: "Essential Oil Diffusers: A Buyer's Guide",
      description: "Learn how to choose the perfect diffuser for your home and lifestyle.",
      imageUrl: "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent2.jpg",
      link: "/blog/essential-oil-diffusers-guide",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    this.lifestyleItemMap.set(2, {
      id: 2,
      title: "5 Aromatherapy Recipes for Better Sleep",
      description: "Discover custom blends that can help you achieve a more restful night.",
      imageUrl: "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent4.jpg",
      link: "/blog/aromatherapy-for-sleep",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.userMap.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.userMap.values()).find(user => user.email === email);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.userMap.values()).find(user => user.username === username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const newUser: User = {
      ...user,
      id,
      createdAt: now,
      updatedAt: now,
      loginAttempts: 0,
      lockUntil: null
    };
    this.userMap.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.userMap.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...userData,
      updatedAt: new Date()
    };
    this.userMap.set(id, updatedUser);
    return updatedUser;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categoryMap.values());
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categoryMap.values()).find(cat => cat.slug === slug);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const now = new Date();
    const newCategory: Category = {
      ...category,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.categoryMap.set(id, newCategory);
    return newCategory;
  }
  
  // Product methods
  async getProducts(limit = 20, offset = 0): Promise<Product[]> {
    const products = Array.from(this.productMap.values());
    return products.slice(offset, offset + limit);
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.productMap.values()).filter(p => p.featured);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.productMap.values()).filter(p => p.categoryId === categoryId);
  }
  
  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.productMap.values()).find(p => p.sku === sku);
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.productMap.get(id);
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.productMap.values()).find(p => p.slug === slug);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const newProduct: Product = {
      ...product,
      id,
      createdAt: now,
      updatedAt: now,
      reviewCount: 0,
      averageRating: "0"
    };
    this.productMap.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = this.productMap.get(id);
    if (!product) return undefined;
    
    const updatedProduct: Product = {
      ...product,
      ...productData,
      updatedAt: new Date()
    };
    this.productMap.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async getProductIngredients(productId: number): Promise<string[]> {
    return this.productIngredientMap.get(productId) || [];
  }
  
  async getProductBenefits(productId: number): Promise<string[]> {
    return this.productBenefitMap.get(productId) || [];
  }
  
  async getProductImages(productId: number): Promise<string[]> {
    return this.productImageMap.get(productId) || [];
  }
  
  async getProductScentProfiles(productId: number): Promise<any[]> {
    const profileLinks = this.productScentProfileMap.get(productId) || [];
    return Promise.all(profileLinks.map(async link => {
      const profile = this.scentProfileMap.get(link.scentProfileId);
      return {
        ...profile,
        intensity: link.intensity,
        position: link.position
      };
    }));
  }
  
  async getProductMoods(productId: number): Promise<any[]> {
    const moodLinks = this.productMoodMap.get(productId) || [];
    return Promise.all(moodLinks.map(async link => {
      const mood = this.moodMap.get(link.moodId);
      return {
        ...mood,
        effectiveness: link.effectiveness
      };
    }));
  }
  
  // Cart methods
  async getCartByUserId(userId: number): Promise<Cart | undefined> {
    return Array.from(this.cartMap.values()).find(cart => cart.userId === userId);
  }
  
  async createCart(cart: InsertCart): Promise<Cart> {
    const id = this.cartIdCounter++;
    const now = new Date();
    const newCart: Cart = {
      ...cart,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.cartMap.set(id, newCart);
    return newCart;
  }
  
  async getCartItems(cartId: number): Promise<CartItem[]> {
    return Array.from(this.cartItemMap.values()).filter(item => item.cartId === cartId);
  }
  
  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    const id = this.cartItemIdCounter++;
    const now = new Date();
    const newCartItem: CartItem = {
      ...cartItem,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.cartItemMap.set(id, newCartItem);
    return newCartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItemMap.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem: CartItem = {
      ...cartItem,
      quantity,
      updatedAt: new Date()
    };
    this.cartItemMap.set(id, updatedCartItem);
    return updatedCartItem;
  }
  
  async removeCartItem(id: number): Promise<void> {
    this.cartItemMap.delete(id);
  }
  
  // Wishlist methods
  async getWishlistByUserId(userId: number): Promise<Wishlist[]> {
    return Array.from(this.wishlistMap.values()).filter(w => w.userId === userId);
  }
  
  async addToWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    const id = this.wishlistIdCounter++;
    const now = new Date();
    const newWishlist: Wishlist = {
      ...wishlist,
      id,
      createdAt: now
    };
    this.wishlistMap.set(id, newWishlist);
    return newWishlist;
  }
  
  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    const wishlistItem = Array.from(this.wishlistMap.values()).find(
      w => w.userId === userId && w.productId === productId
    );
    if (wishlistItem) {
      this.wishlistMap.delete(wishlistItem.id);
    }
  }
  
  async isInWishlist(userId: number, productId: number): Promise<boolean> {
    return Array.from(this.wishlistMap.values()).some(
      w => w.userId === userId && w.productId === productId
    );
  }
  
  // Address methods
  async getUserAddresses(userId: number): Promise<Address[]> {
    return Array.from(this.addressMap.values()).filter(a => a.userId === userId);
  }
  
  async getAddress(id: number): Promise<Address | undefined> {
    return this.addressMap.get(id);
  }
  
  async createAddress(address: InsertAddress): Promise<Address> {
    const id = this.addressIdCounter++;
    const now = new Date();
    const newAddress: Address = {
      ...address,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.addressMap.set(id, newAddress);
    return newAddress;
  }
  
  async updateAddress(id: number, addressData: Partial<Address>): Promise<Address | undefined> {
    const address = this.addressMap.get(id);
    if (!address) return undefined;
    
    const updatedAddress: Address = {
      ...address,
      ...addressData,
      updatedAt: new Date()
    };
    this.addressMap.set(id, updatedAddress);
    return updatedAddress;
  }
  
  async deleteAddress(id: number): Promise<void> {
    this.addressMap.delete(id);
  }
  
  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const newOrder: Order = {
      ...order,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.orderMap.set(id, newOrder);
    return newOrder;
  }
  
  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const now = new Date();
    const newOrderItem: OrderItem = {
      ...orderItem,
      id,
      createdAt: now
    };
    this.orderItemMap.set(id, newOrderItem);
    return newOrderItem;
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orderMap.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orderMap.get(id);
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orderMap.get(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = {
      ...order,
      // @ts-ignore - we know status is one of the enum values
      status,
      updatedAt: new Date()
    };
    this.orderMap.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Review methods
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const newReview: Review = {
      ...review,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.reviewMap.set(id, newReview);
    
    // Update product review count and average rating
    const product = this.productMap.get(review.productId);
    if (product) {
      const productReviews = await this.getProductReviews(product.id);
      const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = (totalRating / productReviews.length).toFixed(2);
      
      await this.updateProduct(product.id, {
        reviewCount: productReviews.length,
        averageRating
      });
    }
    
    return newReview;
  }
  
  async getProductReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviewMap.values())
      .filter(r => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  // Newsletter methods
  async subscribeToNewsletter(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const id = this.newsletterIdCounter++;
    const now = new Date();
    const newSubscription: NewsletterSubscription = {
      ...subscription,
      id,
      createdAt: now
    };
    this.newsletterMap.set(id, newSubscription);
    return newSubscription;
  }
  
  // Contact methods
  async createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry> {
    const id = this.enquiryIdCounter++;
    const now = new Date();
    const newEnquiry: Enquiry = {
      ...enquiry,
      id,
      isResolved: false,
      createdAt: now
    };
    this.enquiryMap.set(id, newEnquiry);
    return newEnquiry;
  }
  
  // Misc methods
  async getScentProfiles(): Promise<any[]> {
    return Array.from(this.scentProfileMap.values());
  }
  
  async getMoods(): Promise<any[]> {
    return Array.from(this.moodMap.values());
  }
  
  async getLifestyleItems(): Promise<any[]> {
    return Array.from(this.lifestyleItemMap.values());
  }
}

// Import the DbStorage implementation
import { DbStorage } from './db-storage';

// Use DbStorage instead of MemStorage for database persistence
export const storage = new DbStorage();
