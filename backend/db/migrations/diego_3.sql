CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    origin_user_id INT NOT NULL,
    target_user_id INT NOT NULL,
    FOREIGN KEY (origin_user_id) REFERENCES users(id),
    FOREIGN KEY (target_user_id) REFERENCES users(id)
);

ALTER TABLE users
ADD COLUMN username VARCHAR(256) NOT NULL UNIQUE;