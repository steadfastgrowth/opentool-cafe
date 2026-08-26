CREATE TABLE IF NOT EXISTS Follow (
  id TEXT PRIMARY KEY NOT NULL,
  followerId TEXT NOT NULL,
  followingId TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (followerId, followingId)
);
CREATE INDEX IF NOT EXISTS Follow_followerId_idx ON Follow(followerId);
CREATE INDEX IF NOT EXISTS Follow_followingId_idx ON Follow(followingId);
