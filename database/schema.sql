-- Healthy Bites basic schema (only the Products part added/updated here)

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category ENUM('Veg','Non-Veg','Vegan','Lactose-Free') NOT NULL,
  tags VARCHAR(255) NULL,
  image VARCHAR(255) NULL,          -- stored as '/uploads/<file>'
  stock_qty INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
