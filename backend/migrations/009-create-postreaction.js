"use strict";
module.exports = {
  async up(q, S) {
    await q.createTable("PostReaction", {
      id: { type: S.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      post_id: { type: S.INTEGER.UNSIGNED, allowNull: false },
      user_id: { type: S.INTEGER.UNSIGNED, allowNull: false },
      reaction_id: { type: S.INTEGER.UNSIGNED, allowNull: false },
      reacted_at: { type: S.DATE, allowNull: false, defaultValue: S.literal("CURRENT_TIMESTAMP") }
    }, { charset: "utf8mb4", collate: "utf8mb4_unicode_ci" });

    await q.addConstraint("PostReaction", {
      fields: ["post_id"], type: "foreign key", name: "fk_postreaction_post",
      references: { table: "Post", field: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE"
    });
    await q.addConstraint("PostReaction", {
      fields: ["user_id"], type: "foreign key", name: "fk_postreaction_user",
      references: { table: "User", field: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE"
    });
    await q.addConstraint("PostReaction", {
      fields: ["reaction_id"], type: "foreign key", name: "fk_postreaction_reaction",
      references: { table: "Reaction", field: "id" }, onDelete: "RESTRICT", onUpdate: "CASCADE"
    });
    await q.addConstraint("PostReaction", {
      fields: ["post_id","user_id"], type: "unique", name: "uq_post_user"
    });

    await q.addIndex("PostReaction", ["post_id", "reaction_id"]);
  },
  async down(q) { await q.dropTable("PostReaction"); }
};