"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Follow",
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        follower_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
        },
        following_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      }
    );

    // ===== Foreign Keys =====
    await queryInterface.addConstraint("Follow", {
      fields: ["follower_id"],
      type: "foreign key",
      name: "fk_follow_follower",
      references: { table: "User", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("Follow", {
      fields: ["following_id"],
      type: "foreign key",
      name: "fk_follow_following",
      references: { table: "User", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // ===== Không cho trùng follow (1 người chỉ theo dõi 1 người duy nhất) =====
    await queryInterface.addConstraint("Follow", {
      fields: ["follower_id", "following_id"],
      type: "unique",
      name: "uq_follower_following_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Follow");
  },
};