-- Wall sticker the donor picks in the donate dialog (one of STICKERS in
-- src/validation.js). Nullable: older rows fall back to a hashed sticker.
ALTER TABLE donations ADD COLUMN sticker TEXT;
