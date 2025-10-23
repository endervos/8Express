CREATE DATABASE IF NOT EXISTS `8Express`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `8Express`;

-- Bảng User
CREATE TABLE `User` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(10) NOT NULL,
    email VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    gender ENUM('Nam', 'Nữ', 'Khác') NOT NULL,
    date_of_birth DATE NOT NULL,
    city VARCHAR(100) NOT NULL,
    is_banned BOOLEAN DEFAULT FALSE,
    CHECK (CHAR_LENGTH(phone) = 10 AND phone REGEXP '^[0-9]{10}$'),
    CHECK (email LIKE '%@%.com'),
    CHECK (CHAR_LENGTH(full_name) >= 2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Admin
CREATE TABLE `Admin` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(10) NOT NULL,
    email VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    gender ENUM('Nam', 'Nữ', 'Khác') NOT NULL,
    date_of_birth DATE NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    CHECK (CHAR_LENGTH(phone) = 10 AND phone REGEXP '^[0-9]{10}$'),
    CHECK (email LIKE '%@%.com'),
    CHECK (CHAR_LENGTH(full_name) >= 2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Topic
CREATE TABLE `Topic` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sub_topic_id INT DEFAULT NULL,
    parent_thumbnail LONGBLOB NOT NULL,
    FOREIGN KEY (sub_topic_id) REFERENCES `Topic`(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Reaction (các loại cảm xúc)
CREATE TABLE `Reaction` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon LONGBLOB NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Post
CREATE TABLE `Post` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    admin_id INT,
    topic_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    image LONGBLOB,
    audio LONGBLOB,
    video LONGBLOB,
    like_count INT DEFAULT 0,
    haha_count INT DEFAULT 0,
    love_count INT DEFAULT 0,
    sad_count INT DEFAULT 0,
    wow_count INT DEFAULT 0,
    care_count INT DEFAULT 0,
    angry_count INT DEFAULT 0,
    is_disabled BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (title <> ''),
    CHECK (
        body IS NOT NULL OR
        image IS NOT NULL OR
        audio IS NOT NULL OR
        video IS NOT NULL
    ),
    FOREIGN KEY (user_id) REFERENCES `User`(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES `Admin`(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES `Topic`(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Share
CREATE TABLE `Share` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    shared_by INT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES `Post`(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES `User`(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Comment
CREATE TABLE `Comment` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    body TEXT NOT NULL,
    parent_id INT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES `Post`(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES `User`(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES `Comment`(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng PostReaction
CREATE TABLE `PostReaction` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction_id INT NOT NULL,
    reacted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES `Post`(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES `User`(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (reaction_id) REFERENCES `Reaction`(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY uq_post_user (post_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
