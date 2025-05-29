ALTER TABLE users
ADD COLUMN ecdsa_public_key TEXT NOT NULL;

ALTER TABLE users
ADD COLUMN ecdsa_private_key TEXT NOT NULL;