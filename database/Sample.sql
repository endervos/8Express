USE `8Express`;


-- Admin
INSERT INTO `Admin` 
(phone, email, password, full_name, gender, date_of_birth, avatar)
VALUES
('0912345678', 'n22dcat057@student.ptithcm.edu.vn', 
 '$2a$12$dHMf86p/JXeLivuj1dqTC.u2iAhnd7YyAZCzKOZdkpbG43KTy9hxW', 
 'Trần Phúc Tiến', 'Nam', '2004-01-01', LOAD_FILE('/images/avatar-admin.jpg')),
('0912345671', 'n22dcpt097@student.ptithcm.edu.vn', 
 '$2a$12$Gb.At7eG9IndyGN7hxc97eovkqeO0HuHJizrxmjkn2BEKcOefnP8G', 
 'Huỳnh Thanh Trà', 'Nữ', '2004-02-02', LOAD_FILE('/images/avatar-admin.jpg')),
('0912345677', 'n22dcpt025@student.ptithcm.edu.vn', 
 '$2a$12$3fM5IZXMlZcS/jp6v2zt5OZaSVmNjpJeXp/2yDKrhh984/JhyY/cS', 
 'Tô Duy Hào', 'Nam', '2004-03-03', LOAD_FILE('/images/avatar-admin.jpg'));


-- User
INSERT INTO `User` 
(phone, email, password, full_name, gender, date_of_birth, is_banned, avatar)
VALUES
('0901111222', 'user1@gmail.com', 
 '$2a$12$XQKr9BOjQPcyUiEmPRM7/emAK2XwPoRsj3hf3PeFdyoDx5SDtNFE.', 
 'Nguyễn Văn An', 'Nam', '2000-05-12', FALSE, LOAD_FILE('/images/avatar1.jpeg')),
('0913333444', 'user2@gmail.com', 
 '$2a$12$ISIzevER3grbhjsL4Y06ruMxbWS.enXXYRzsTTqy6ZSkOG.kNF7OG', 
 'Trần Thị Bình', 'Nữ', '1999-08-09', FALSE, LOAD_FILE('/images/avatar2.jpg')),
('0925555666', 'user3@gmail.com', 
 '$2a$12$FucC42mpk90nO6zg86sJt.fEB6EIxMv0fPPz044cuaj8mng/nVu.a', 
 'Lê Văn Cường', 'Nam', '2001-03-20', FALSE, LOAD_FILE('/images/avatar3.jpg'));


-- Topic
INSERT INTO `Topic` (name)
VALUES 
('Công nghệ'), ('Y tế'), ('Giải trí'), ('Giáo dục'), 
('Chính trị'), ('Thể thao'), ('Quân sự'), ('Văn hóa');


-- Reaction
INSERT INTO `Reaction` (name, icon)
VALUES
('Like', '👍'), ('Love', '❤️'), ('Haha', '😆'),
('Wow', '😮'), ('Sad', '😢'), ('Angry', '😡');


-- Post
INSERT INTO `Post` 
(user_id, admin_id, topic_id, title, body, image, audio, video,
 like_count, love_count, haha_count, wow_count, sad_count, angry_count, status, created_at)
VALUES
(1, 1, 1, 
 'Công nghệ blockchain mới', 
 'Blockchain đang là xu hướng trong lĩnh vực công nghệ. Hôm nay, tôi sẽ giới thiệu về công nghệ Blockchain cho bạn hiểu rõ hơn nhé!',
 NULL, LOAD_FILE('/images/post1.mp3'), NULL,
 1, 1, 0, 0, 0, 0, 'Approved', NOW()),

(2, NULL, 2, 
 'Ứng dụng AI trong y tế', 
 'AI thực sự đang thay đổi ngành y học theo cách không ngờ. Tôi nghĩ rằng AI sẽ là tương lai của y tế và là người bạn của chúng ta!',
 LOAD_FILE('/images/post2.jpg'), NULL, NULL,
 1, 1, 0, 1, 0, 0, 'Approved', NOW()),

(3, NULL, 3, 
 'Phim hay mới nhất', 
 'Arcane - Phim hot tháng 11! Bạn đã xem chưa?',
 NULL, NULL, LOAD_FILE('/images/post3.mp4'),
 1, 1, 1, 1, 1, 1, 'Approved', NOW()),

(NULL, 1, 3, 
 'Sử dụng công nghệ cho lập trình Web', 
 'Framework: frontend React, backend ExpressJS và database Sequelize',
 NULL, NULL, NULL,
 0, 0, 0, 0, 0, 0, 'Approved', NOW());


-- Share
INSERT INTO `Share` (post_id, user_id, admin_id, shared_at)
VALUES
(1, 2, NULL, NOW()),
(2, 1, NULL, NOW()),
(3, 1, NULL, NOW());


-- Comment
INSERT INTO `Comment` (post_id, user_id, admin_id, body, parent_id, created_at)
VALUES
(1, 2, NULL, 'Bài viết rất hay, cảm ơn bạn!', NULL, NOW()),
(1, 3, NULL, 'Mình cũng đang quan tâm blockchain nè.', NULL, NOW()),
(2, 1, NULL, 'AI thực sự đang thay đổi cuộc sống.', NULL, NOW()),
(3, NULL, 1, 'Phim này mình xem rồi, khá ổn!', NULL, NOW()),
(1, 1, NULL, 'Cảm ơn bạn đã góp ý!', 1, NOW());


-- PostReaction
INSERT INTO `PostReaction` (post_id, user_id, admin_id, reaction_id, reacted_at)
VALUES
(1, 1, NULL, 1, NOW()),
(1, 2, NULL, 2, NOW()),
(2, 3, NULL, 1, NOW()),
(2, 2, NULL, 2, NOW()),
(2, NULL, 2, 4, NOW()),
(3, 3, NULL, 1, NOW()),
(3, NULL, 1, 2, NOW()),
(3, 1, NULL, 3, NOW()),
(3, NULL, 2, 4, NOW()),
(3, NULL, 3, 5, NOW()),
(3, 2, NULL, 6, NOW());


-- Follow
INSERT INTO `Follow` 
(user_id, admin_id, following_user_id, following_admin_id, created_at)
VALUES
(1, NULL, 2, NULL, NOW()),
(1, NULL, 3, NULL, NOW()),
(2, NULL, 1, NULL, NOW()),
(3, NULL, 1, NULL, NOW()),
(3, NULL, 2, NULL, NOW());