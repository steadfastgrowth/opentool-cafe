-- First 100 regulars. INTEGER 0/1 matches other User booleans on D1.
ALTER TABLE User ADD COLUMN founding INTEGER NOT NULL DEFAULT 0;

UPDATE User
SET founding = 1
WHERE id IN (
  SELECT id FROM User ORDER BY datetime(createdAt) ASC, id ASC LIMIT 100
);
