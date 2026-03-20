-- Seed 5 Test Workers for GigShield
INSERT INTO Users (id, phone_number, platform_id, zone, current_gigscore)
VALUES
  ('a1b2c3d4-e5f6-7890-1234-56789abcdef0', '+919876543210', 'Zepto', 'Mumbai_Andheri', 850),
  ('b2c3d4e5-f678-9012-3456-789abcdef012', '+919876543211', 'Swiggy', 'Delhi_NCR', 650),
  ('c3d4e5f6-7890-1234-5678-9abcdef01234', '+919876543212', 'Zomato', 'Bangalore_Indiranagar', 450),
  ('d4e5f678-9012-3456-789a-bcdef0123456', '+919876543213', 'Zepto', 'Pune_Koregaon', 300),
  ('e5f67890-1234-5678-9abc-def012345678', '+919876543214', 'Swiggy', 'Chennai_Tnagar', 520);
