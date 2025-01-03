-- Add new courses
-- INSERT INTO Course (name, fullPrice, discountPrice)
-- VALUES 
--     ('Course 1', 100, 80),
--     ('Course 2', 150, 120);


-- Update existing courses
-- INSERT INTO Course (name, fullPrice, discountPrice)
-- VALUES 
--     ('Course 1', 110, 85)  -- updates 'Course 1'
-- ON CONFLICT (name)
-- DO UPDATE SET
--     fullPrice = EXCLUDED.fullPrice,
--     discountPrice = EXCLUDED.discountPrice;


-- Delete courses
-- DELETE FROM Course
-- WHERE name = 'Course 1';

--Add New Courses and Skip Duplicates (Upsert)
INSERT INTO Course (name, fullPrice, discountPrice)
VALUES 
    ('trading', 70, 56),
    ('web3', 250, 175)
ON CONFLICT (name)
DO NOTHING;  -- Avoids inserting duplicates based on name
