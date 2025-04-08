import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
// Import from storage.ts which now uses MemStorage
import { storage } from "./storage";
import Stripe from "stripe";
import { insertNewsletterSubscriptionSchema, insertEnquirySchema, insertReviewSchema, insertCartItemSchema, insertWishlistSchema, insertAddressSchema } from "@shared/schema";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes
  setupAuth(app);

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const products = await storage.getProducts(limit, offset);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const featuredProducts = await storage.getFeaturedProducts();
      res.json(featuredProducts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const products = await storage.getProductsByCategory(categoryId);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get additional product data
      const ingredients = await storage.getProductIngredients(product.id);
      const benefits = await storage.getProductBenefits(product.id);
      const images = await storage.getProductImages(product.id);
      const scentProfiles = await storage.getProductScentProfiles(product.id);
      const moods = await storage.getProductMoods(product.id);
      
      res.json({
        ...product,
        ingredients,
        benefits,
        images,
        scentProfiles,
        moods
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Scent profiles and moods
  app.get("/api/scent-profiles", async (req, res) => {
    try {
      const profiles = await storage.getScentProfiles();
      res.json(profiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/moods", async (req, res) => {
    try {
      const moods = await storage.getMoods();
      res.json(moods);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user!.id;
      let cart = await storage.getCartByUserId(userId);
      
      // Create cart if it doesn't exist
      if (!cart) {
        cart = await storage.createCart({ userId });
      }
      
      // Get cart items with product details
      const cartItems = await storage.getCartItems(cart.id);
      const itemsWithDetails = await Promise.all(cartItems.map(async (item) => {
        // Fetch product by ID, not slug
        const product = await storage.getProductById(item.productId);
        if (!product) {
          console.error(`Product with ID ${item.productId} not found`);
          return null;
        }
        return {
          ...item,
          product
        };
      })).then(items => items.filter(item => item !== null));
      
      res.json({
        ...cart,
        items: itemsWithDetails
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cart/items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user!.id;
      let cart = await storage.getCartByUserId(userId);
      
      // Create cart if it doesn't exist
      if (!cart) {
        cart = await storage.createCart({ userId });
      }
      
      // Validate request body
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        cartId: cart.id
      });
      
      // Check if item already exists in cart
      const existingItems = await storage.getCartItems(cart.id);
      const existingItem = existingItems.find(item => item.productId === validatedData.productId);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedItem = await storage.updateCartItemQuantity(
          existingItem.id, 
          existingItem.quantity + validatedData.quantity
        );
        res.json(updatedItem);
      } else {
        // Add new item to cart
        const newItem = await storage.addCartItem(validatedData);
        res.status(201).json(newItem);
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/cart/items/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const itemId = parseInt(req.params.id);
      const quantity = req.body.quantity;
      
      if (quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
      
      const updatedItem = await storage.updateCartItemQuantity(itemId, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(updatedItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/cart/items/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const itemId = parseInt(req.params.id);
      await storage.removeCartItem(itemId);
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user!.id;
      const wishlistItems = await storage.getWishlistByUserId(userId);
      
      // Get product details for each item
      const itemsWithDetails = await Promise.all(wishlistItems.map(async (item) => {
        // Fetch product by ID, not slug
        const product = await storage.getProductById(item.productId);
        if (!product) {
          console.error(`Product with ID ${item.productId} not found`);
          return null;
        }
        return {
          ...item,
          product
        };
      })).then(items => items.filter(item => item !== null));
      
      res.json(itemsWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user!.id;
      
      // Validate request body
      const validatedData = insertWishlistSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if item already exists in wishlist
      const isInWishlist = await storage.isInWishlist(userId, validatedData.productId);
      if (isInWishlist) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }
      
      // Add to wishlist
      const newItem = await storage.addToWishlist(validatedData);
      res.status(201).json(newItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/wishlist/:productId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user!.id;
      const productId = parseInt(req.params.productId);
      
      await storage.removeFromWishlist(userId, productId);
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reviews
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user!.id;
      
      // Validate request body
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId
      });
      
      // Create review
      const newReview = await storage.createReview(validatedData);
      res.status(201).json(newReview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertNewsletterSubscriptionSchema.parse(req.body);
      
      // Create subscription
      const subscription = await storage.subscribeToNewsletter(validatedData);
      res.status(201).json({ message: "Subscription successful", subscription });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Contact/Enquiry
  app.post("/api/contact", async (req, res) => {
    try {
      // Add user ID if authenticated
      let userData = {};
      if (req.isAuthenticated()) {
        userData = { userId: req.user!.id };
      }
      
      // Validate request body
      const validatedData = insertEnquirySchema.parse({
        ...req.body,
        ...userData
      });
      
      // Create enquiry
      const enquiry = await storage.createEnquiry(validatedData);
      res.status(201).json({ 
        message: "Thank you for your message. We will get back to you soon.", 
        enquiry 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Lifestyle items
  app.get("/api/lifestyle-items", async (req, res) => {
    try {
      const items = await storage.getLifestyleItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Orders routes
  // Create a new order
  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user!.id;
      
      // Validate the order data
      const orderData = {
        ...req.body,
        userId
      };
      
      // Create the order
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create order items
  app.post("/api/order-items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const orderItem = await storage.addOrderItem(req.body);
      res.status(201).json(orderItem);
    } catch (error: any) {
      console.error("Error creating order item:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user!.id;
      const orders = await storage.getUserOrders(userId);
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await storage.getOrderItems(order.id);
        return {
          ...order,
          items
        };
      }));
      
      res.json(ordersWithItems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Ensure the order belongs to the authenticated user
      if (order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const items = await storage.getOrderItems(orderId);
      
      res.json({
        ...order,
        items
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment intent creation
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      // Get the cart total and currency from the client
      const { amount = 100, currency = "usd" } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          error: "Invalid amount. Amount must be greater than 0." 
        });
      }
      
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          // Add metadata to track the payment in Stripe dashboard
          integration_check: 'the_scent_payment',
          amount_original: amount.toString()
        }
      });
      
      // Return the client secret to the client
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        error: "Failed to process payment",
        details: error.message 
      });
    }
  });

  // Addresses routes
  app.get("/api/addresses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user!.id;
      const addresses = await storage.getUserAddresses(userId);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/addresses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.user!.id;
      
      // Validate request body
      const validatedData = insertAddressSchema.parse({
        ...req.body,
        userId
      });
      
      // Create address
      const newAddress = await storage.createAddress(validatedData);
      res.status(201).json(newAddress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/addresses/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const addressId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Get the address to check ownership
      const address = await storage.getAddress(addressId);
      
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      
      // Ensure the address belongs to the authenticated user
      if (address.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Update address
      const updatedAddress = await storage.updateAddress(addressId, req.body);
      res.json(updatedAddress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/addresses/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const addressId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Get the address to check ownership
      const address = await storage.getAddress(addressId);
      
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      
      // Ensure the address belongs to the authenticated user
      if (address.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Delete address
      await storage.deleteAddress(addressId);
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
