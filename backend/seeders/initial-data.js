"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ======== Admin ========
    await queryInterface.bulkInsert("Admin", [
      {
        phone: "0912345678",
        email: "n22dcat057@student.ptithcm.edu.vn",
        password:
          "$2a$12$dHMf86p/JXeLivuj1dqTC.u2iAhnd7YyAZCzKOZdkpbG43KTy9hxW",
        full_name: "Trần Phúc Tiến",
        gender: "Nam",
        date_of_birth: "2004-01-01",
      },
      {
        phone: "0912345677",
        email: "n22dcpt025@student.ptithcm.edu.vn",
        password:
          "$2a$12$3fM5IZXMlZcS/jp6v2zt5OZaSVmNjpJeXp/2yDKrhh984/JhyY/cS",
        full_name: "Tô Duy Hào",
        gender: "Nam",
        date_of_birth: "2004-02-02",
      },
      {
        phone: "0912345671",
        email: "n22dcpt097@student.ptithcm.edu.vn",
        password:
          "$2a$12$Gb.At7eG9IndyGN7hxc97eovkqeO0HuHJizrxmjkn2BEKcOefnP8G",
        full_name: "Huỳnh Thanh Trà",
        gender: "Nữ",
        date_of_birth: "2004-03-03",
      },
    ]);

    // ======== User ========
    await queryInterface.bulkInsert("User", [
      {
        phone: "0901111222",
        email: "user1@gmail.com",
        password:
          "$2a$12$XQKr9BOjQPcyUiEmPRM7/emAK2XwPoRsj3hf3PeFdyoDx5SDtNFE.",
        full_name: "Nguyễn Văn A",
        gender: "Nam",
        date_of_birth: "2000-05-12",
        is_banned: false,
      },
      {
        phone: "0913333444",
        email: "user2@gmail.com",
        password:
          "$2a$12$ISIzevER3grbhjsL4Y06ruMxbWS.enXXYRzsTTqy6ZSkOG.kNF7OG",
        full_name: "Trần Thị B",
        gender: "Nữ",
        date_of_birth: "1999-08-09",
        is_banned: false,
      },
      {
        phone: "0925555666",
        email: "user3@gmail.com",
        password:
          "$2a$12$FucC42mpk90nO6zg86sJt.fEB6EIxMv0fPPz044cuaj8mng/nVu.a",
        full_name: "Lê Văn C",
        gender: "Nam",
        date_of_birth: "2001-03-20",
        is_banned: false,
      },
    ]);

    // ======== Topic ========
    await queryInterface.bulkInsert("Topic", [
      {
        name: "Công nghệ",
        sub_topic_id: null,
        parent_thumbnail: Buffer.from("FFD8FFE000104A4649460001", "hex"),
      },
      {
        name: "AI & Machine Learning",
        sub_topic_id: 1,
        parent_thumbnail: Buffer.from("FFD8FFE000104A4649460002", "hex"),
      },
      {
        name: "Giải trí",
        sub_topic_id: null,
        parent_thumbnail: Buffer.from("FFD8FFE000104A4649460003", "hex"),
      },
    ]);

    // ======== Reaction ========
    await queryInterface.bulkInsert("Reaction", [
      { name: "Like", icon: Buffer.from("FFD8FFE000104A46494600034", "hex") },
      { name: "Love", icon: Buffer.from("FFD8FFE000104A46494600035", "hex") },
      { name: "Haha", icon: Buffer.from("FFD8FFE000104A46494600036", "hex") },
      { name: "Sad", icon: Buffer.from("FFD8FFE000104A46494600037", "hex") },
      { name: "Wow", icon: Buffer.from("FFD8FFE000104A46494600038", "hex") },
      { name: "Care", icon: Buffer.from("FFD8FFE000104A46494600039", "hex") },
      { name: "Angry", icon: Buffer.from("FFD8FFE000104A46494600040", "hex") },
    ]);

    // ======== Post ========
    await queryInterface.bulkInsert("Post", [
      {
        user_id: 1,
        admin_id: 1,
        topic_id: 1,
        title: "Công nghệ blockchain mới",
        body: "Bài viết về công nghệ blockchain trong đời sống.",
        image: null,
        like_count: 5,
        love_count: 3,
        created_at: new Date(),
      },
      {
        user_id: 2,
        admin_id: null,
        topic_id: 2,
        title: "Ứng dụng AI trong y tế",
        body: "AI đang thay đổi ngành y học theo cách không ngờ.",
        image: null,
        like_count: 10,
        love_count: 2,
        created_at: new Date(),
      },
      {
        user_id: 3,
        admin_id: null,
        topic_id: 3,
        title: "Phim hay tháng 10",
        body: "Danh sách phim hot tháng 10 bạn nên xem!",
        image: null,
        like_count: 7,
        love_count: 1,
        created_at: new Date(),
      },
    ]);

    // ======== Share ========
    await queryInterface.bulkInsert("Share", [
      { post_id: 1, shared_by: 2 },
      { post_id: 2, shared_by: 1 },
      { post_id: 3, shared_by: 1 },
    ]);

    // ======== Comment ========
    await queryInterface.bulkInsert("Comment", [
      { post_id: 1, user_id: 2, body: "Bài viết rất hay, cảm ơn bạn!" },
      { post_id: 1, user_id: 3, body: "Mình cũng đang quan tâm blockchain nè." },
      { post_id: 2, user_id: 1, body: "AI thực sự đang thay đổi cuộc sống." },
      { post_id: 3, user_id: 2, body: "Phim này mình xem rồi, khá ổn!" },
    ]);

    await queryInterface.bulkInsert("Comment", [
      { post_id: 1, user_id: 1, body: "Cảm ơn bạn đã góp ý!", parent_id: 1 },
    ]);

    // ======== PostReaction ========
    await queryInterface.bulkInsert("PostReaction", [
      { post_id: 1, user_id: 1, reaction_id: 1 },
      { post_id: 1, user_id: 2, reaction_id: 2 },
      { post_id: 2, user_id: 3, reaction_id: 1 },
      { post_id: 3, user_id: 1, reaction_id: 3 },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("PostReaction", null, {});
    await queryInterface.bulkDelete("Comment", null, {});
    await queryInterface.bulkDelete("Share", null, {});
    await queryInterface.bulkDelete("Post", null, {});
    await queryInterface.bulkDelete("Reaction", null, {});
    await queryInterface.bulkDelete("Topic", null, {});
    await queryInterface.bulkDelete("User", null, {});
    await queryInterface.bulkDelete("Admin", null, {});
  },
};