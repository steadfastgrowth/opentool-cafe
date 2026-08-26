CREATE TABLE IF NOT EXISTS Notice (
  id TEXT PRIMARY KEY NOT NULL,
  toUserId TEXT NOT NULL,
  fromUserId TEXT NOT NULL,
  kind TEXT NOT NULL,
  postId TEXT,
  href TEXT NOT NULL,
  readAt DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS Notice_to_created_idx ON Notice(toUserId, createdAt);
CREATE INDEX IF NOT EXISTS Notice_to_unread_idx ON Notice(toUserId, readAt);
