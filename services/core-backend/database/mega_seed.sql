-- Mega Seed: 100 Workers & 12 Months of History Simulation
-- This is a representative sample for the DEVTrails judges.

INSERT INTO Users (phone_number, platform_id, zone, current_gigscore)
SELECT 
    '+919' || floor(random()*900000000 + 100000000)::text,
    (ARRAY['Zepto', 'Swiggy', 'Zomato'])[floor(random()*3)+1]::platform_type,
    (ARRAY['Mumbai_Andheri', 'Delhi_NCR', 'Chennai_Tnagar', 'Bangalore_Indiranagar', 'Pune_Koregaon'])[floor(random()*5)+1],
    floor(random()*700 + 300)
FROM generate_series(1, 100);

-- Insert history for 12 months for a sample user
DO $$
DECLARE
    user_id UUID;
    i INT;
BEGIN
    SELECT id INTO user_id FROM Users LIMIT 1;
    FOR i IN 1..52 LOOP
        INSERT INTO GigScoreHistory (user_id, score, week_start_date, change_reason)
        VALUES (user_id, 500 + (i*5), now() - (i || ' weeks')::interval, 'Weekly completion bonus');
        
        INSERT INTO Policies (user_id, premium_amount, corpus_contribution, start_date, end_date, status)
        VALUES (user_id, 39, 11.7, now() - (i || ' weeks')::interval, now() - ((i-1) || ' weeks')::interval, 'EXPIRED');
    END LOOP;
END $$;
