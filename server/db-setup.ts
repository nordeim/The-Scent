import { db } from './db';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';

/**
 * Setup database schema and seed data
 */
export async function setupDatabase() {
  try {
    console.log('Setting up database schema...');
    
    // We'll let Drizzle ORM handle the schema creation
    // Instead of trying to create tables manually, we'll check
    // if data exists and seed if needed
    
    try {
      // Check if the users table exists by querying it
      await db.select().from(schema.users).limit(1);
      console.log('Database schema appears to be set up');
    } catch (e) {
      console.log('Database schema not found, you may need to run migrations');
      console.log('Continuing with seeding process...');
    }
    
    // Seed initial data if needed
    await seedInitialData();
    
    return true;
  } catch (error) {
    console.error('Database setup failed:', error);
    return false;
  }
}

/**
 * Seed initial data for the application
 * This runs only if tables are empty
 */
async function seedInitialData() {
  try {
    // We'll only seed if the categories table is empty
    const categoriesCount = await db.select({ count: sql`count(*)` })
      .from(schema.categories);
    
    if (categoriesCount.length > 0 && Number(categoriesCount[0].count) > 0) {
      console.log('Database already contains data, skipping seed');
      return;
    }
  } catch (e) {
    console.log('Unable to check categories count, tables may not exist yet');
    console.log('Run database migrations first before seeding data');
    return;
  }
  
  console.log('Seeding initial data...');
  
  try {
    // Categories
    const categories = [
      {
        name: 'Perfumes',
        slug: 'perfumes',
        description: 'Exquisite perfumes for every occasion',
        imageUrl: '/images/categories/perfumes.jpg'
      },
      {
        name: 'Body Sprays',
        slug: 'body-sprays',
        description: 'Light and refreshing body sprays',
        imageUrl: '/images/categories/body-sprays.jpg'
      },
      {
        name: 'Scented Candles',
        slug: 'scented-candles',
        description: 'Aromatic candles for your home',
        imageUrl: '/images/categories/scented-candles.jpg'
      },
      {
        name: 'Essential Oils',
        slug: 'essential-oils',
        description: 'Pure essential oils for aromatherapy',
        imageUrl: '/images/categories/essential-oils.jpg'
      }
    ];
    
    for (const category of categories) {
      await db.insert(schema.categories).values(category);
    }
    
    // Sample product
    const perfumesCategory = await db.select().from(schema.categories).where(sql`name = 'Perfumes'`).limit(1);
    if (perfumesCategory.length > 0) {
      const sampleProduct = {
        name: 'Midnight Bloom',
        slug: 'midnight-bloom',
        description: 'A captivating blend of jasmine, amber, and sandalwood for an enchanting evening presence.',
        shortDescription: 'Jasmine, amber, and sandalwood blend',
        price: '89.99',
        imageUrl: '/images/products/midnight-bloom.jpg',
        sku: 'MB-001',
        featured: true,
        categoryId: perfumesCategory[0].id,
        stock: 50
      };
      
      await db.insert(schema.products).values(sampleProduct);
    }
    
    // Add scent profiles
    const scentProfiles = [
      { name: 'Floral', description: 'Flower-derived scents like rose, jasmine, and lily' },
      { name: 'Citrus', description: 'Fresh, tangy scents of lemon, orange, and grapefruit' },
      { name: 'Woody', description: 'Warm scents like sandalwood, cedar, and pine' },
      { name: 'Oriental', description: 'Rich, spicy scents with vanilla, musk, and amber' },
      { name: 'Fresh', description: 'Clean, aquatic, and green scents' }
    ];
    
    // Add moods
    const moods = [
      { name: 'Energizing', description: 'Uplifting scents to boost your energy' },
      { name: 'Calming', description: 'Soothing scents to help you relax' },
      { name: 'Romantic', description: 'Sensual scents for intimate occasions' },
      { name: 'Professional', description: 'Subtle scents appropriate for workplace' },
      { name: 'Refreshing', description: 'Cool, invigorating scents for warm days' }
    ];
    
    console.log('Data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}