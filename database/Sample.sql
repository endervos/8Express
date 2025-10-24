USE `8Express`;


--  Admin
INSERT INTO `Admin` (phone, email, password, full_name, gender, date_of_birth)
VALUES 
('0912345678', 'n22dcat057@student.ptithcm.edu.vn', '$2a$12$dHMf86p/JXeLivuj1dqTC.u2iAhnd7YyAZCzKOZdkpbG43KTy9hxW', 'Trần Phúc Tiến', 'Nam', '2004-01-01'),
('0912345677', 'n22dcpt025@student.ptithcm.edu.vn', '$2a$12$3fM5IZXMlZcS/jp6v2zt5OZaSVmNjpJeXp/2yDKrhh984/JhyY/cS', 'Tô Duy Hào', 'Nam', '2004-02-02'),
('0912345671', 'n22dcpt097@student.ptithcm.edu.vn', '$2a$12$Gb.At7eG9IndyGN7hxc97eovkqeO0HuHJizrxmjkn2BEKcOefnP8G', 'Huỳnh Thanh Trà', 'Nữ', '2004-03-03');


--  User
INSERT INTO `User` (phone, email, password, full_name, gender, date_of_birth)
VALUES
('0901111222', 'user1@gmail.com', '$2a$12$XQKr9BOjQPcyUiEmPRM7/emAK2XwPoRsj3hf3PeFdyoDx5SDtNFE.', 'Nguyễn Văn A', 'Nam', '2000-05-12'),
('0913333444', 'user2@gmail.com', '$2a$12$ISIzevER3grbhjsL4Y06ruMxbWS.enXXYRzsTTqy6ZSkOG.kNF7OG', 'Trần Thị B', 'Nữ', '1999-08-09'),
('0925555666', 'user3@gmail.com', '$2a$12$FucC42mpk90nO6zg86sJt.fEB6EIxMv0fPPz044cuaj8mng/nVu.a', 'Lê Văn C', 'Nam', '2001-03-20');


--  Topic
INSERT INTO `Topic` (name, sub_topic_id, parent_thumbnail)
VALUES
('Công nghệ', NULL, '0xFFD8FFE000104A4649460001'),
('AI & Machine Learning', 1, '0xFFD8FFE000104A4649460002'),
('Giải trí', NULL, '0xFFD8FFE000104A4649460003');


-- Reaction
INSERT INTO `Reaction` (name, icon)
VALUES
('Like', '0xFFD8FFE000104A46494600034'),
('Love', '0xFFD8FFE000104A46494600035'),
('Haha', '0xFFD8FFE000104A46494600036'),
('Sad', '0xFFD8FFE000104A46494600037'),
('Wow', '0xFFD8FFE000104A46494600038'),
('Care', '0xFFD8FFE000104A46494600039'),
('Angry', '0xFFD8FFE000104A46494600040');


--   Post
INSERT INTO `Post` (
    user_id, admin_id, topic_id, title, body, image, like_count, love_count, created_at
)
VALUES
(1, 1, 1, 'Công nghệ blockchain mới', 'Bài viết về công nghệ blockchain trong đời sống.', NULL, 5, 3, NOW()),
(2, NULL, 2, 'Ứng dụng AI trong y tế', 'AI đang thay đổi ngành y học theo cách không ngờ.', NULL, 10, 2, NOW()),
(3, NULL, 3, 'Phim hay tháng 10', 'Danh sách phim hot tháng 10 bạn nên xem!', NULL, 7, 1, NOW());


--   Share
INSERT INTO `Share` (post_id, shared_by)
VALUES
(1, 2),
(2, 1),
(3, 1);


--   Comment
INSERT INTO `Comment` (post_id, user_id, body)
VALUES
(1, 2, 'Bài viết rất hay, cảm ơn bạn!'),
(1, 3, 'Mình cũng đang quan tâm blockchain nè.'),
(2, 1, 'AI thực sự đang thay đổi cuộc sống.'),
(3, 2, 'Phim này mình xem rồi, khá ổn!');


-- Bình luận trả lời lồng nhau
INSERT INTO `Comment` (post_id, user_id, body, parent_id)
VALUES
(1, 1, 'Cảm ơn bạn đã góp ý!', 1);


-- PostReaction
INSERT INTO `PostReaction` (post_id, user_id, reaction_id)
VALUES
(1, 1, 1),
(1, 2, 2),
(2, 3, 1),
(3, 1, 3);