import { IStorage } from './storage';
import memorystore from 'memorystore';
import session from 'express-session';
import type { Store } from 'express-session';

// Create memory store
const MemoryStore = memorystore(session);

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
  private wishlistMap: Map<number, any> = new Map();
  private addressMap: Map<number, any> = new Map();
  private reviewMap: Map<number, any> = new Map();
  private newsletterMap: Map<number, any> = new Map();
  private enquiryMap: Map<number, any> = new Map();
  private scentProfileMap: Map<number, any> = new Map();
  private moodMap: Map<number, any> = new Map();
  private productIngredientMap: Map<number, string[]> = new Map();
  private productBenefitMap: Map<number, string[]> = new Map();
  private productImageMap: Map<number, string[]> = new Map();
  private productScentProfileMap: Map<number, any[]> = new Map();
  private productMoodMap: Map<number, any[]> = new Map();
  private lifestyleItemMap: Map<number, any> = new Map();
  
  // Counters for auto-incrementing IDs
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
  private lifestyleItemIdCounter = 1;
  
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
    
    const diffusers = this.createCategory({
      name: "Diffusers",
      slug: "diffusers", 
      description: "Stylish diffusers to disperse your favorite scents.",
      imageUrl: "/images/scent3.jpg"
    });
    
    const naturalSoaps = this.createCategory({
      name: "Natural Soaps",
      slug: "natural-soaps", 
      description: "Handcrafted soaps made with premium natural ingredients.",
      imageUrl: "/images/soap2.jpg"
    });
    
    const giftSets = this.createCategory({
      name: "Gift Sets",
      slug: "gift-sets", 
      description: "Curated collections perfect for gifting or treating yourself.",
      imageUrl: "/images/scent6.jpg"
    });
    
    const herbalCategory = this.createCategory({
      name: "Herbal Blends",
      slug: "herbal-blends",
      description: "Natural herbal blends for various wellness purposes.",
      imageUrl: "/images/scent7.jpg"
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
      description: "Warm, earthy woody notes",
      iconClass: "fa-tree"
    };
    this.scentProfileMap.set(woody.id, woody);
    
    const spicy = {
      id: this.scentProfileIdCounter++,
      name: "Spicy",
      description: "Bold, warming spice notes",
      iconClass: "fa-pepper-hot"
    };
    this.scentProfileMap.set(spicy.id, spicy);
    
    const herbal = {
      id: this.scentProfileIdCounter++,
      name: "Herbal",
      description: "Fresh, green herbal notes",
      iconClass: "fa-leaf"
    };
    this.scentProfileMap.set(herbal.id, herbal);
    
    const oriental = {
      id: this.scentProfileIdCounter++,
      name: "Oriental",
      description: "Rich, exotic oriental blends",
      iconClass: "fa-moon"
    };
    this.scentProfileMap.set(oriental.id, oriental);
    
    // Initialize moods
    const relaxation = {
      id: this.moodIdCounter++,
      name: "Relaxation",
      description: "Calming scents to help you unwind",
      iconClass: "fa-spa"
    };
    this.moodMap.set(relaxation.id, relaxation);
    
    const energy = {
      id: this.moodIdCounter++,
      name: "Energy",
      description: "Invigorating scents to boost your vitality",
      iconClass: "fa-bolt"
    };
    this.moodMap.set(energy.id, energy);
    
    const focus = {
      id: this.moodIdCounter++,
      name: "Focus",
      description: "Clarifying scents to improve concentration",
      iconClass: "fa-brain"
    };
    this.moodMap.set(focus.id, focus);
    
    const sleep = {
      id: this.moodIdCounter++,
      name: "Sleep",
      description: "Soothing scents to promote restful sleep",
      iconClass: "fa-moon"
    };
    this.moodMap.set(sleep.id, sleep);
    
    const balance = {
      id: this.moodIdCounter++,
      name: "Balance",
      description: "Harmonizing scents to center your mind",
      iconClass: "fa-balance-scale"
    };
    this.moodMap.set(balance.id, balance);
    
    // Create 15 products using all the images in the images folder
    
    // 1. Lavender Essential Oil
    const lavenderOil = this.createProduct({
      name: "Lavender Essential Oil",
      slug: "lavender-essential-oil",
      price: "24.99",
      description: "Our pure lavender essential oil is sourced from high-altitude lavender fields, ensuring the highest quality oil with a rich, floral scent. Known for its calming properties, this versatile essential oil can help reduce anxiety, improve sleep quality, and promote relaxation.",
      shortDescription: "Pure, calming lavender for relaxation",
      imageUrl: "/images/scent1.jpg",
      featured: true,
      categoryId: essentialOils.id,
      stock: 100,
      sku: "EO-LAV-001"
    });
    
    // 2. Eucalyptus Essential Oil
    const eucalyptusOil = this.createProduct({
      name: "Eucalyptus Essential Oil",
      slug: "eucalyptus-essential-oil",
      price: "22.99",
      description: "Our eucalyptus essential oil is steam-distilled from eucalyptus leaves to preserve its fresh, invigorating scent and therapeutic properties. This refreshing oil is known for its ability to clear the mind, support respiratory health, and provide a revitalizing effect on the senses.",
      shortDescription: "Refreshing and clearing for the mind",
      imageUrl: "/images/scent2.jpg",
      featured: true,
      categoryId: essentialOils.id,
      stock: 85,
      sku: "EO-EUC-001"
    });
    
    // 3. Ceramic Ultrasonic Diffuser
    const ceramicDiffuser = this.createProduct({
      name: "Ceramic Ultrasonic Diffuser",
      slug: "ceramic-ultrasonic-diffuser",
      price: "59.99",
      description: "This elegant ceramic diffuser uses ultrasonic technology to disperse a fine mist of essential oils throughout your space. The soothing LED light creates a calming ambiance, while the whisper-quiet operation ensures it won't disturb your peaceful environment.",
      shortDescription: "Elegant ceramic design with ambient light",
      imageUrl: "/images/scent3.jpg",
      featured: true,
      categoryId: diffusers.id,
      stock: 30,
      sku: "DF-CER-001"
    });
    
    // 4. Signature Blend Essential Oil
    const signatureBlend = this.createProduct({
      name: "Signature Blend Essential Oil",
      slug: "signature-blend-essential-oil",
      price: "32.99",
      description: "Our signature blend combines lavender, bergamot, and sandalwood to create a harmonious scent profile that promotes relaxation while maintaining mental clarity. This exclusive blend is perfect for diffusing during meditation or when you need to create a calming yet focused atmosphere.",
      shortDescription: "Our exclusive relaxing blend for balance",
      imageUrl: "/images/scent4.jpg",
      featured: true,
      categoryId: essentialOils.id,
      stock: 50,
      sku: "EO-SIG-001"
    });
    
    // 5. Citrus Burst Essential Oil
    const citrusBurst = this.createProduct({
      name: "Citrus Burst Essential Oil",
      slug: "citrus-burst-essential-oil",
      price: "26.99",
      description: "This energizing blend combines sweet orange, grapefruit, and lemon essential oils to create an uplifting atmosphere that invigorates the senses. Perfect for diffusing in the morning or whenever you need an energy boost, this bright, zesty blend brings sunshine to any space.",
      shortDescription: "Energizing citrus blend to uplift your mood",
      imageUrl: "/images/scent5.jpg",
      featured: true,
      categoryId: essentialOils.id,
      stock: 65,
      sku: "EO-CIT-001"
    });
    
    // 6. Wooden Reed Diffuser
    const reedDiffuser = this.createProduct({
      name: "Wooden Reed Diffuser",
      slug: "wooden-reed-diffuser",
      price: "34.99",
      description: "Our wooden reed diffuser provides a natural, continuous scent experience without the need for electricity or heat. Each diffuser comes with premium rattan reeds and a hand-blown glass vessel filled with your choice of our signature essential oil blends. The natural wooden cap adds an elegant, organic touch to any decor.",
      shortDescription: "Continuous scent without electricity",
      imageUrl: "/images/scent6.jpg",
      featured: false,
      categoryId: diffusers.id,
      stock: 40,
      sku: "DF-WRD-001"
    });
    
    // 7. Herbal Mint Body Soap
    const herbalMintSoap = this.createProduct({
      name: "Herbal Mint Body Soap",
      slug: "herbal-mint-body-soap",
      price: "12.99",
      description: "Our refreshing herbal mint soap combines peppermint and spearmint essential oils with nourishing coconut and olive oils. This invigorating bar soap stimulates the senses while gently cleansing the skin, leaving you feeling refreshed and revitalized.",
      shortDescription: "Invigorating mint soap for refreshed skin",
      imageUrl: "/images/scent7.jpg",
      featured: false,
      categoryId: naturalSoaps.id,
      stock: 75,
      sku: "SP-HBM-001"
    });
    
    // 8. Lavender Oatmeal Soap
    const lavenderOatmealSoap = this.createProduct({
      name: "Lavender Oatmeal Soap",
      slug: "lavender-oatmeal-soap",
      price: "11.99",
      description: "This gentle lavender oatmeal soap combines the calming properties of lavender essential oil with the soothing effects of finely ground oatmeal. Perfect for sensitive skin, this bar provides light exfoliation while moisturizing and calming irritated skin.",
      shortDescription: "Soothing lavender with gentle exfoliation",
      imageUrl: "/images/soap1.jpg",
      featured: true,
      categoryId: naturalSoaps.id,
      stock: 60,
      sku: "SP-LVO-001"
    });
    
    // 9. Aromatherapy Gift Set
    const aromatherapyGiftSet = this.createProduct({
      name: "Aromatherapy Gift Set",
      slug: "aromatherapy-gift-set",
      price: "79.99",
      description: "Our aromatherapy gift set includes our mini ultrasonic diffuser and three of our most popular essential oil blends: Relax, Energize, and Breathe. Packaged in a beautiful gift box, this set makes the perfect introduction to the world of aromatherapy.",
      shortDescription: "Complete starter set for aromatherapy",
      imageUrl: "/images/soap2.jpg",
      featured: true,
      categoryId: giftSets.id,
      stock: 25,
      sku: "GS-ARO-001"
    });
    
    // 10. Honey Almond Soap
    const honeyAlmondSoap = this.createProduct({
      name: "Honey Almond Soap",
      slug: "honey-almond-soap",
      price: "12.99",
      description: "Our honey almond soap combines the moisturizing properties of raw honey with nourishing sweet almond oil. This luxurious soap creates a rich, creamy lather that cleanses without stripping the skin's natural oils, leaving your skin soft and hydrated.",
      shortDescription: "Moisturizing honey and almond for soft skin",
      imageUrl: "/images/soap3.jpg",
      featured: false,
      categoryId: naturalSoaps.id,
      stock: 55,
      sku: "SP-HAS-001"
    });
    
    // 11. Charcoal Detox Soap
    const charcoalSoap = this.createProduct({
      name: "Charcoal Detox Soap",
      slug: "charcoal-detox-soap",
      price: "13.99",
      description: "Our detoxifying charcoal soap is formulated with activated charcoal and tea tree essential oil to draw out impurities and balance oily skin. Perfect for deep cleansing, this soap helps clear congested pores while maintaining the skin's natural moisture balance.",
      shortDescription: "Deep cleansing and purifying for oily skin",
      imageUrl: "/images/soap4.jpg",
      featured: false,
      categoryId: naturalSoaps.id,
      stock: 45,
      sku: "SP-CDS-001"
    });
    
    // 12. Sleep & Relaxation Gift Set
    const sleepGiftSet = this.createProduct({
      name: "Sleep & Relaxation Gift Set",
      slug: "sleep-relaxation-gift-set",
      price: "89.99",
      description: "Our sleep and relaxation gift set is designed to transform your bedtime routine. This set includes our lavender essential oil, sleep-enhancing pillow mist, lavender-filled eye pillow, and our exclusive bedtime tea blend, all packaged in a beautiful keepsake box.",
      shortDescription: "Complete set for better sleep and relaxation",
      imageUrl: "/images/soap5.jpg",
      featured: true,
      categoryId: giftSets.id,
      stock: 20,
      sku: "GS-SLR-001"
    });
    
    // 13. Portable Car Diffuser
    const carDiffuser = this.createProduct({
      name: "Portable Car Diffuser",
      slug: "portable-car-diffuser",
      price: "29.99",
      description: "Take your aromatherapy on the road with our portable car diffuser. This compact device plugs into your car's USB port and uses ultrasonic technology to disperse essential oils throughout your vehicle. Choose from intermittent or continuous misting to create the perfect atmosphere during your commute.",
      shortDescription: "Aromatherapy for your commute",
      imageUrl: "/images/soap6.jpg",
      featured: false,
      categoryId: diffusers.id,
      stock: 35,
      sku: "DF-CAR-001"
    });
    
    // 14. Citrus Sunshine Soap
    const citrusSoap = this.createProduct({
      name: "Citrus Sunshine Soap",
      slug: "citrus-sunshine-soap",
      price: "11.99",
      description: "Wake up your senses with our energizing citrus soap. A blend of sweet orange, grapefruit, and lemongrass essential oils creates an uplifting experience while coconut and olive oils provide gentle cleansing. Start your day with a burst of sunshine!",
      shortDescription: "Energizing citrus blend for morning showers",
      imageUrl: "/images/soap7.jpg",
      featured: false,
      categoryId: naturalSoaps.id,
      stock: 50,
      sku: "SP-CSS-001"
    });
    
    // 15. Forest Bathing Essential Oil Blend
    const forestBlend = this.createProduct({
      name: "Forest Bathing Essential Oil Blend",
      slug: "forest-bathing-blend",
      price: "29.99",
      description: "Inspired by the Japanese practice of Shinrin-yoku (forest bathing), this grounding blend combines pine, cedar, cypress, and juniper berry essential oils. Diffuse this blend to bring the restorative experience of walking through a forest into your home.",
      shortDescription: "Experience the healing power of the forest",
      imageUrl: "/images/scent7.jpg",
      featured: false,
      categoryId: essentialOils.id,
      stock: 40,
      sku: "EO-FBB-001"
    });
    
    // Add scent profiles, benefits, and moods for each product
    
    // Lavender oil
    this.productScentProfileMap.set(lavenderOil.id, [
      { scentProfileId: floral.id, intensity: 8 },
      { scentProfileId: herbal.id, intensity: 5 }
    ]);
    this.productMoodMap.set(lavenderOil.id, [
      { moodId: relaxation.id, effectiveness: 9 },
      { moodId: sleep.id, effectiveness: 8 },
      { moodId: balance.id, effectiveness: 6 }
    ]);
    this.productBenefitMap.set(lavenderOil.id, [
      "Promotes relaxation and mental calm",
      "Helps improve sleep quality",
      "Soothes minor skin irritations",
      "Reduces stress and anxiety"
    ]);
    
    // More products with their details would be set up here
    
    console.log('Successfully initialized 15 sample products');
  }
  
  // Method implementations for all the interface methods
  
  async getUser(id: number) {
    return this.userMap.get(id);
  }
  
  async getUserByEmail(email: string) {
    return Array.from(this.userMap.values()).find(user => user.email === email);
  }
  
  async getUserByUsername(username: string) {
    return Array.from(this.userMap.values()).find(user => user.username === username);
  }
  
  async createUser(user: any) {
    const id = this.userIdCounter++;
    const now = new Date();
    const newUser = {
      id,
      createdAt: now,
      updatedAt: now,
      loginAttempts: 0,
      lockUntil: null,
      ...user,
    };
    this.userMap.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: any) {
    const user = this.userMap.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...userData,
      updatedAt: new Date(),
    };
    this.userMap.set(id, updatedUser);
    return updatedUser;
  }
  
  async getCategories() {
    return Array.from(this.categoryMap.values());
  }
  
  async getCategoryBySlug(slug: string) {
    return Array.from(this.categoryMap.values()).find(cat => cat.slug === slug);
  }
  
  async createCategory(category: any) {
    const id = this.categoryIdCounter++;
    const now = new Date();
    const newCategory = {
      id,
      createdAt: now,
      updatedAt: now,
      ...category,
    };
    this.categoryMap.set(id, newCategory);
    return newCategory;
  }
  
  async getProducts(limit = 20, offset = 0) {
    const products = Array.from(this.productMap.values());
    return products.slice(offset, offset + limit);
  }
  
  async getFeaturedProducts() {
    return Array.from(this.productMap.values()).filter(product => product.featured);
  }
  
  async getProductsByCategory(categoryId: number) {
    return Array.from(this.productMap.values()).filter(product => product.categoryId === categoryId);
  }
  
  async getProductById(id: number) {
    return this.productMap.get(id);
  }
  
  async getProductBySku(sku: string) {
    return Array.from(this.productMap.values()).find(product => product.sku === sku);
  }
  
  async getProductBySlug(slug: string) {
    return Array.from(this.productMap.values()).find(product => product.slug === slug);
  }
  
  async createProduct(product: any) {
    const id = this.productIdCounter++;
    const now = new Date();
    const newProduct = {
      id,
      createdAt: now,
      updatedAt: now,
      reviewCount: 0,
      averageRating: "0",
      ...product,
    };
    this.productMap.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, productData: any) {
    const product = this.productMap.get(id);
    if (!product) return undefined;
    
    const updatedProduct = {
      ...product,
      ...productData,
      updatedAt: new Date(),
    };
    this.productMap.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async getProductIngredients(productId: number) {
    return this.productIngredientMap.get(productId) || [];
  }
  
  async getProductBenefits(productId: number) {
    return this.productBenefitMap.get(productId) || [];
  }
  
  async getProductImages(productId: number) {
    return this.productImageMap.get(productId) || [];
  }
  
  async getProductScentProfiles(productId: number) {
    return this.productScentProfileMap.get(productId) || [];
  }
  
  async getProductMoods(productId: number) {
    return this.productMoodMap.get(productId) || [];
  }
  
  async getCartByUserId(userId: number) {
    return Array.from(this.cartMap.values()).find(cart => cart.userId === userId);
  }
  
  async createCart(cart: any) {
    const id = this.cartIdCounter++;
    const now = new Date();
    const newCart = {
      id,
      createdAt: now,
      updatedAt: now,
      ...cart,
    };
    this.cartMap.set(id, newCart);
    return newCart;
  }
  
  async getCartItems(cartId: number) {
    return Array.from(this.cartItemMap.values()).filter(item => item.cartId === cartId);
  }
  
  async addCartItem(cartItem: any) {
    const id = this.cartItemIdCounter++;
    const now = new Date();
    const newCartItem = {
      id,
      createdAt: now,
      updatedAt: now,
      quantity: 1,
      ...cartItem,
    };
    this.cartItemMap.set(id, newCartItem);
    return newCartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number) {
    const cartItem = this.cartItemMap.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = {
      ...cartItem,
      quantity,
      updatedAt: new Date(),
    };
    this.cartItemMap.set(id, updatedCartItem);
    return updatedCartItem;
  }
  
  async removeCartItem(id: number) {
    this.cartItemMap.delete(id);
  }
  
  async getWishlistByUserId(userId: number) {
    return Array.from(this.wishlistMap.values()).filter(wishlist => wishlist.userId === userId);
  }
  
  async addToWishlist(wishlist: any) {
    const id = this.wishlistIdCounter++;
    const now = new Date();
    const newWishlist = {
      id,
      createdAt: now,
      updatedAt: now,
      ...wishlist,
    };
    this.wishlistMap.set(id, newWishlist);
    return newWishlist;
  }
  
  async removeFromWishlist(userId: number, productId: number) {
    const wishlistItem = Array.from(this.wishlistMap.values()).find(
      item => item.userId === userId && item.productId === productId
    );
    if (wishlistItem) {
      this.wishlistMap.delete(wishlistItem.id);
    }
  }
  
  async isInWishlist(userId: number, productId: number) {
    return Array.from(this.wishlistMap.values()).some(
      item => item.userId === userId && item.productId === productId
    );
  }
  
  async getUserAddresses(userId: number) {
    return Array.from(this.addressMap.values()).filter(addr => addr.userId === userId);
  }
  
  async getAddress(id: number) {
    return this.addressMap.get(id);
  }
  
  async createAddress(address: any) {
    const id = this.addressIdCounter++;
    const now = new Date();
    const newAddress = {
      id,
      createdAt: now,
      updatedAt: now,
      isDefault: false,
      ...address,
    };
    this.addressMap.set(id, newAddress);
    return newAddress;
  }
  
  async updateAddress(id: number, addressData: any) {
    const address = this.addressMap.get(id);
    if (!address) return undefined;
    
    const updatedAddress = {
      ...address,
      ...addressData,
      updatedAt: new Date(),
    };
    this.addressMap.set(id, updatedAddress);
    return updatedAddress;
  }
  
  async deleteAddress(id: number) {
    this.addressMap.delete(id);
  }
  
  async createOrder(order: any) {
    const id = this.orderIdCounter++;
    const now = new Date();
    const newOrder = {
      id,
      createdAt: now,
      updatedAt: now,
      status: "pending",
      paymentStatus: "pending",
      ...order,
    };
    this.orderMap.set(id, newOrder);
    return newOrder;
  }
  
  async addOrderItem(orderItem: any) {
    const id = this.orderItemIdCounter++;
    const now = new Date();
    const newOrderItem = {
      id,
      createdAt: now,
      updatedAt: now,
      ...orderItem,
    };
    this.orderItemMap.set(id, newOrderItem);
    return newOrderItem;
  }
  
  async getUserOrders(userId: number) {
    return Array.from(this.orderMap.values()).filter(order => order.userId === userId);
  }
  
  async getOrder(id: number) {
    return this.orderMap.get(id);
  }
  
  async getOrderItems(orderId: number) {
    return Array.from(this.orderItemMap.values()).filter(item => item.orderId === orderId);
  }
  
  async updateOrderStatus(id: number, status: string) {
    const order = this.orderMap.get(id);
    if (!order) return undefined;
    
    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date(),
    };
    this.orderMap.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async createReview(review: any) {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const newReview = {
      id,
      createdAt: now,
      updatedAt: now,
      ...review,
    };
    this.reviewMap.set(id, newReview);
    
    // Update product's review count and average rating
    const product = this.productMap.get(review.productId);
    if (product) {
      const productReviews = Array.from(this.reviewMap.values()).filter(r => r.productId === review.productId);
      const newCount = productReviews.length;
      const newAvg = (productReviews.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1);
      
      this.updateProduct(product.id, {
        reviewCount: newCount,
        averageRating: newAvg
      });
    }
    
    return newReview;
  }
  
  async getProductReviews(productId: number) {
    return Array.from(this.reviewMap.values()).filter(review => review.productId === productId);
  }
  
  async subscribeToNewsletter(subscription: any) {
    const id = this.newsletterIdCounter++;
    const now = new Date();
    const newSubscription = {
      id,
      createdAt: now,
      updatedAt: now,
      ...subscription,
    };
    this.newsletterMap.set(id, newSubscription);
    return newSubscription;
  }
  
  async createEnquiry(enquiry: any) {
    const id = this.enquiryIdCounter++;
    const newEnquiry = {
      id,
      isResolved: false,
      createdAt: new Date(),
      ...enquiry,
    };
    this.enquiryMap.set(id, newEnquiry);
    return newEnquiry;
  }
  
  async getScentProfiles() {
    return Array.from(this.scentProfileMap.values());
  }
  
  async getMoods() {
    return Array.from(this.moodMap.values());
  }
  
  async getLifestyleItems() {
    return Array.from(this.lifestyleItemMap.values());
  }
}