-- Numbered retro badges. @steadfast is house (blank). Count starts after him.
ALTER TABLE User ADD COLUMN memberNumber INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS User_memberNumber_key ON User(memberNumber);

UPDATE User SET founding = 0, memberNumber = NULL;

UPDATE User SET founding = 1 WHERE slug = 'steadfast';

UPDATE User
SET memberNumber = (
  SELECT rn FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY datetime(createdAt) ASC, id ASC) AS rn
    FROM User
    WHERE slug != 'steadfast'
  ) ranked
  WHERE ranked.id = User.id
)
WHERE slug != 'steadfast';

UPDATE User SET founding = 1 WHERE memberNumber IS NOT NULL AND memberNumber <= 100;
UPDATE User SET founding = 1 WHERE slug = 'steadfast';
