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
        user_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
        },
        admin_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
        },
        following_user_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
        },
        following_admin_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
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
    await queryInterface.addConstraint("Follow", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_follow_user",
      references: { table: "User", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    await queryInterface.addConstraint("Follow", {
      fields: ["admin_id"],
      type: "foreign key",
      name: "fk_follow_admin",
      references: { table: "Admin", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    await queryInterface.addConstraint("Follow", {
      fields: ["following_user_id"],
      type: "foreign key",
      name: "fk_follow_following_user",
      references: { table: "User", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    await queryInterface.addConstraint("Follow", {
      fields: ["following_admin_id"],
      type: "foreign key",
      name: "fk_follow_following_admin",
      references: { table: "Admin", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    await queryInterface.addConstraint("Follow", {
      fields: ["user_id", "admin_id", "following_user_id", "following_admin_id"],
      type: "unique",
      name: "uq_follow_unique",
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Follow");
  },
};