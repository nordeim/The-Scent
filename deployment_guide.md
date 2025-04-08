# The-Scent E-Commerce Platform: Deployment Guide

## Database Schema

The database schema for "The-Scent" e-commerce platform is defined below. This schema includes all tables needed for the application, including specialized tables for fragrance-specific features.

### Core Tables

#### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Products Table

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT,
  price TEXT NOT NULL,
  image_url TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  category_id INTEGER REFERENCES categories(id),
  stock INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  average_rating TEXT DEFAULT '0',
  sku TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Categories Table

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Orders Table

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  order_number TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  total TEXT NOT NULL,
  shipping_address_id INTEGER NOT NULL REFERENCES addresses(id),
  billing_address_id INTEGER NOT NULL REFERENCES addresses(id),
  payment_status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Order Items Table

```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Carts Table

```sql
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Cart Items Table

```sql
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES carts(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Wishlists Table

```sql
CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

#### Addresses Table

```sql
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Reviews Table

```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Specialized Fragrance Tables

#### Scent Profiles Table

```sql
CREATE TABLE scent_profiles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_class TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Moods Table

```sql
CREATE TABLE moods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_class TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Product Scent Profiles Table

```sql
CREATE TABLE product_scent_profiles (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  scent_profile_id INTEGER NOT NULL REFERENCES scent_profiles(id),
  intensity INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, scent_profile_id)
);
```

#### Product Moods Table

```sql
CREATE TABLE product_moods (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  mood_id INTEGER NOT NULL REFERENCES moods(id),
  effectiveness INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, mood_id)
);
```

#### Product Ingredients Table

```sql
CREATE TABLE product_ingredients (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  ingredient TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Product Benefits Table

```sql
CREATE TABLE product_benefits (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  benefit TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Additional Images Table

```sql
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Miscellaneous Tables

#### Newsletter Subscriptions Table

```sql
CREATE TABLE newsletter_subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Enquiries Table

```sql
CREATE TABLE enquiries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Session Store Table

```sql
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
```

## Database Initialization and Seeding

The application requires some initial data to function properly. Here's a script to seed essential data like categories, scent profiles, and moods:

```sql
-- Insert categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Essential Oils', 'essential-oils', 'Pure essential oils for aromatherapy and wellness.', '/images/scent1.jpg'),
('Diffusers', 'diffusers', 'Stylish diffusers to disperse your favorite scents.', '/images/scent3.jpg'),
('Natural Soaps', 'natural-soaps', 'Handcrafted soaps made with premium natural ingredients.', '/images/soap2.jpg'),
('Gift Sets', 'gift-sets', 'Curated collections perfect for gifting or treating yourself.', '/images/scent6.jpg'),
('Herbal Blends', 'herbal-blends', 'Natural herbal blends for various wellness purposes.', '/images/scent7.jpg');

-- Insert scent profiles
INSERT INTO scent_profiles (name, description, icon_class) VALUES
('Floral', 'Delicate, sweet floral notes', 'fa-flower'),
('Citrus', 'Fresh, zesty citrus scents', 'fa-lemon'),
('Woody', 'Warm, earthy woody notes', 'fa-tree'),
('Spicy', 'Bold, warming spice notes', 'fa-pepper-hot'),
('Herbal', 'Fresh, green herbal notes', 'fa-leaf'),
('Oriental', 'Rich, exotic oriental blends', 'fa-moon');

-- Insert moods
INSERT INTO moods (name, description, icon_class) VALUES
('Relaxation', 'Calming scents to help you unwind', 'fa-spa'),
('Energy', 'Invigorating scents to boost your vitality', 'fa-bolt'),
('Focus', 'Clarifying scents to improve concentration', 'fa-brain'),
('Sleep', 'Soothing scents to promote restful sleep', 'fa-moon'),
('Balance', 'Harmonizing scents to center your mind', 'fa-balance-scale');

-- Insert a sample admin user (change password before deployment)
INSERT INTO users (email, username, password, role, first_name, last_name) VALUES
('admin@thescent.com', 'admin', 'password-hash-here', 'admin', 'Admin', 'User');
```

Note: The password should be properly hashed before inserting into the database. The application uses a custom hashing function in `server/auth.ts`.

## Database Maintenance

### Regular Backups

Set up regular database backups to prevent data loss:

```bash
# Create a backup script
sudo nano /usr/local/bin/backup-thescent-db.sh
```

Add the following content:

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U your_username -d the_scent -F c -f "$BACKUP_DIR/the_scent_$TIMESTAMP.backup"
find $BACKUP_DIR -name "the_scent_*.backup" -mtime +7 -delete
```

Make it executable and schedule with cron:

```bash
sudo chmod +x /usr/local/bin/backup-thescent-db.sh
sudo crontab -e
```

Add this line for daily backups at 2 AM:

```
0 2 * * * /usr/local/bin/backup-thescent-db.sh
```

### Database Migrations

The application uses Drizzle ORM for database migrations. When making schema changes:

1. Update the schema in `shared/schema.ts`
2. Run the migration command:
   ```bash
   npm run db:push
   ```

For complex migrations that require data transformation, create custom scripts.

## Conclusion

This deployment guide covers the installation, configuration, and deployment of "The-Scent" e-commerce platform. Follow these steps to set up a fully functional instance with all the specialized fragrance discovery features.

The platform's modular architecture allows for easy maintenance and extension. Pay particular attention to the database configuration and Stripe integration, as these are critical for the application's functionality.

For any issues during deployment, refer to the troubleshooting section or consult the project documentation.
