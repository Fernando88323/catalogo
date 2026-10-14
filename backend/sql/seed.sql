INSERT IGNORE INTO categories (id, name, slug) VALUES
  (1, 'Ropa', 'ropa'), (2, 'Calzado', 'calzado'), (3, 'Accesorios', 'accesorios');

INSERT IGNORE INTO products (id, category_id, name, description, price, image_url, stock) VALUES
  (1, 1, 'Camiseta básica', 'Camiseta de algodón, varias tallas.', 15.00, NULL, 50),
  (2, 1, 'Sudadera con capucha', 'Sudadera cómoda para todo el año.', 35.50, NULL, 20),
  (3, 2, 'Zapatillas urbanas', 'Zapatillas ligeras para uso diario.', 59.90, NULL, 15),
  (4, 3, 'Gorra deportiva', 'Gorra ajustable.', 12.00, NULL, 40);
