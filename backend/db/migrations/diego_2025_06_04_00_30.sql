CREATE TABLE `groups`(
	id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    creator_id INT NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES users(id),
    UNIQUE(name)
);

CREATE TABLE group_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    group_id INT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES `groups`(id),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    `key` VARCHAR(500) NOT NULL
);

CREATE TABLE group_members(
	group_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES `groups`(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    PRIMARY KEY (group_id, user_id)
);
