INSERT INTO categories (name, type, color, icon, is_system)
VALUES
  ('Salario', 'income', '#15803d', 'wallet', TRUE),
  ('Freelance', 'income', '#0f766e', 'briefcase', TRUE),
  ('Investimentos', 'income', '#1d4ed8', 'chart-line', TRUE),
  ('Reembolso', 'income', '#7c3aed', 'receipt', TRUE),
  ('Presentes', 'income', '#c2410c', 'gift', TRUE),
  ('Outras entradas', 'income', '#475569', 'plus-circle', TRUE),
  ('Moradia', 'expense', '#b91c1c', 'home', TRUE),
  ('Alimentacao', 'expense', '#ea580c', 'utensils', TRUE),
  ('Transporte', 'expense', '#2563eb', 'car', TRUE),
  ('Saude', 'expense', '#dc2626', 'heart-pulse', TRUE),
  ('Educacao', 'expense', '#7c3aed', 'graduation-cap', TRUE),
  ('Lazer', 'expense', '#0891b2', 'party-popper', TRUE),
  ('Assinaturas', 'expense', '#4f46e5', 'badge-dollar-sign', TRUE),
  ('Compras', 'expense', '#db2777', 'shopping-bag', TRUE),
  ('Impostos', 'expense', '#92400e', 'landmark', TRUE),
  ('Outras saidas', 'expense', '#475569', 'minus-circle', TRUE)
ON CONFLICT DO NOTHING;
