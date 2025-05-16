CREATE TABLE blockchain (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  block_index  INT          NOT NULL,
  timestamp    DATETIME     NOT NULL,
  prev_hash    CHAR(64),              -- hash SHA‑256 anterior
  hash         CHAR(64)      NOT NULL, -- hash del bloque actual
  data         JSON          NOT NULL  -- { from, to, msgHash, sig }
);
