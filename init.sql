-- Auth tables (created by better-auth)
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMP NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  scope TEXT,
  password TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- App tables
CREATE TABLE IF NOT EXISTS category (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  "categoryId" INTEGER NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  "zipCode" TEXT,
  image TEXT,
  "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
  "isApproved" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "businessId" INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inquiry (
  id SERIAL PRIMARY KEY,
  "businessId" INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  "jobType" TEXT NOT NULL DEFAULT 'full-time',
  location TEXT,
  salary TEXT,
  "contactEmail" TEXT NOT NULL,
  image TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed categories
INSERT INTO category (name, slug, icon) VALUES
  ('Home Services', 'home-services', 'Home'),
  ('Professional Services', 'professional-services', 'Briefcase'),
  ('Food & Dining', 'food-dining', 'UtensilsCrossed'),
  ('Health & Wellness', 'health-wellness', 'Heart'),
  ('Education', 'education', 'GraduationCap'),
  ('Beauty & Personal Care', 'beauty-personal-care', 'Sparkles'),
  ('Automotive', 'automotive', 'Car'),
  ('Technology', 'technology', 'Laptop'),
  ('Arts & Crafts', 'arts-crafts', 'Palette'),
  ('Other', 'other', 'MoreHorizontal')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS service_provider (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  rate TEXT,
  location TEXT,
  phone TEXT,
  email TEXT,
  availability TEXT,
  image TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
