import { db, pool } from './db';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

/**
 * Manually create all tables in the database
 */
async function createSchema() {
  try {
    console.log('Creating schema manually...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "firstName" TEXT,
        "lastName" TEXT,
        "phone" TEXT,
        "role" TEXT DEFAULT 'user',
        "loginAttempts" INTEGER DEFAULT 0,
        "lockUntil" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "imageUrl" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT NOT NULL,
        "shortDescription" TEXT,
        "price" TEXT NOT NULL,
        "imageUrl" TEXT NOT NULL,
        "sku" TEXT NOT NULL UNIQUE,
        "featured" BOOLEAN DEFAULT false,
        "stock" INTEGER DEFAULT 0,
        "reviewCount" INTEGER DEFAULT 0,
        "averageRating" TEXT DEFAULT '0',
        "categoryId" INTEGER REFERENCES "categories"("id"),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create scent profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "scentProfiles" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "iconClass" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create moods table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "moods" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "iconClass" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create product scent profiles join table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "productScentProfiles" (
        "id" SERIAL PRIMARY KEY,
        "productId" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "scentProfileId" INTEGER NOT NULL REFERENCES "scentProfiles"("id") ON DELETE CASCADE,
        "intensity" INTEGER NOT NULL DEFAULT 5,
        "position_top" INTEGER,
        "position_left" INTEGER,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE("productId", "scentProfileId")
      );
    `);
    
    // Create product moods join table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "productMoods" (
        "id" SERIAL PRIMARY KEY,
        "productId" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "moodId" INTEGER NOT NULL REFERENCES "moods"("id") ON DELETE CASCADE,
        "effectiveness" INTEGER NOT NULL DEFAULT 5,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE("productId", "moodId")
      );
    `);
    
    // Create product ingredients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "productIngredients" (
        "id" SERIAL PRIMARY KEY,
        "productId" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "ingredient" TEXT NOT NULL,
        "sortOrder" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create product benefits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "productBenefits" (
        "id" SERIAL PRIMARY KEY,
        "productId" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "benefit" TEXT NOT NULL,
        "sortOrder" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create product images table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "productImages" (
        "id" SERIAL PRIMARY KEY,
        "productId" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "imageUrl" TEXT NOT NULL,
        "sortOrder" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create carts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "carts" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE("userId")
      );
    `);
    
    // Create cart items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "cartItems" (
        "id" SERIAL PRIMARY KEY,
        "cartId" INTEGER NOT NULL REFERENCES "carts"("id") ON DELETE CASCADE,
        "productId" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE("cartId", "productId")
      );
    `);
    
    // Create wishlists table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "wishlists" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "productId" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE("userId", "productId")
      );
    `);
    
    // Create addresses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "addresses" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "addressLine1" TEXT NOT NULL,
        "addressLine2" TEXT,
        "city" TEXT NOT NULL,
        "state" TEXT NOT NULL,
        "postalCode" TEXT NOT NULL,
        "country" TEXT NOT NULL,
        "isDefault" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "orderNumber" TEXT NOT NULL UNIQUE,
        "status" TEXT DEFAULT 'pending',
        "total" TEXT NOT NULL,
        "shippingAddressId" INTEGER NOT NULL REFERENCES "addresses"("id"),
        "billingAddressId" INTEGER NOT NULL REFERENCES "addresses"("id"),
        "paymentStatus" TEXT DEFAULT 'pending',
        "stripePaymentIntentId" TEXT,
        "shippingMethod" TEXT,
        "shippingCost" TEXT,
        "notes" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create order items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "orderItems" (
        "id" SERIAL PRIMARY KEY,
        "orderId" INTEGER NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
        "productId" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE SET NULL,
        "quantity" INTEGER NOT NULL,
        "price" TEXT NOT NULL,
        "subtotal" TEXT NOT NULL,
        "productData" JSONB,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "productId" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "rating" INTEGER NOT NULL,
        "comment" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create newsletter subscriptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "newsletterSubscriptions" (
        "id" SERIAL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "firstName" TEXT,
        "lastName" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create enquiries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "enquiries" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "subject" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "userId" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
        "isResolved" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create lifestyle items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "lifestyleItems" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "imageUrl" TEXT NOT NULL,
        "link" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create session table for connect-pg-simple
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" VARCHAR NOT NULL COLLATE "default",
        "sess" JSON NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    
    console.log('Schema created successfully');
    return true;
  } catch (error) {
    console.error('Failed to create schema:', error);
    return false;
  }
}

// Execute the schema creation
createSchema().then((success) => {
  if (success) {
    console.log('Schema creation completed successfully');
    process.exit(0);
  } else {
    console.error('Schema creation failed');
    process.exit(1);
  }
});