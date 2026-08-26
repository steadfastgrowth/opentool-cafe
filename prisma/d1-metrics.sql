ALTER TABLE Event ADD COLUMN ref TEXT;
ALTER TABLE Event ADD COLUMN visitorId TEXT;
CREATE INDEX IF NOT EXISTS Event_name_createdAt_idx ON Event(name, createdAt);
CREATE INDEX IF NOT EXISTS Event_visitorId_idx ON Event(visitorId);
