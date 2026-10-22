-- Cities -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS cities (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(64)  NOT NULL UNIQUE,
  name        JSONB        NOT NULL,          -- { "az": "...", "ru": "...", "en": "..." }
  image_url   TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Properties -------------------------------------------------------
CREATE TABLE IF NOT EXISTS properties (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(128) NOT NULL UNIQUE,
  city_id       INTEGER      NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  type          VARCHAR(32)  NOT NULL,
  title         JSONB        NOT NULL,        -- localized
  description   JSONB        NOT NULL,        -- localized
  district      JSONB        NOT NULL,        -- localized
  address       TEXT,
  price         NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  currency      VARCHAR(3)   NOT NULL DEFAULT 'AZN',
  price_period  VARCHAR(16)  NOT NULL DEFAULT 'month',
  rooms         SMALLINT     NOT NULL CHECK (rooms >= 0),
  bathrooms     SMALLINT     NOT NULL DEFAULT 1,
  area          NUMERIC(8,2) NOT NULL CHECK (area > 0),  -- m²
  floor         SMALLINT,
  total_floors  SMALLINT,
  amenities     TEXT[]       NOT NULL DEFAULT '{}',      -- keys, translated on the client
  images        TEXT[]       NOT NULL DEFAULT '{}',
  latitude      NUMERIC(9,6),
  longitude     NUMERIC(9,6),
  is_featured   BOOLEAN      NOT NULL DEFAULT FALSE,
  is_available  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_city      ON properties(city_id);
CREATE INDEX IF NOT EXISTS idx_properties_type      ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_price     ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_featured  ON properties(is_featured) WHERE is_featured;

-- Inquiries (contact requests from the property page) --------------
CREATE TABLE IF NOT EXISTS inquiries (
  id           SERIAL PRIMARY KEY,
  property_id  INTEGER     NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name         VARCHAR(120) NOT NULL,
  phone        VARCHAR(40)  NOT NULL,
  email        VARCHAR(160),
  message      TEXT,
  lang         VARCHAR(2)  NOT NULL DEFAULT 'az',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id);
