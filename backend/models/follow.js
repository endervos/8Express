"use strict";

module.exports = (sequelize, DataTypes) => {
    const Follow = sequelize.define(
        "Follow",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            admin_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            following_user_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            following_admin_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "Follow",
            timestamps: false,
        }
    );
    Follow.associate = (models) => {
        Follow.belongsTo(models.User, { foreignKey: "user_id", as: "FollowerUser" });
        Follow.belongsTo(models.Admin, { foreignKey: "admin_id", as: "FollowerAdmin" });
        Follow.belongsTo(models.User, { foreignKey: "following_user_id", as: "FollowingUser" });
        Follow.belongsTo(models.Admin, { foreignKey: "following_admin_id", as: "FollowingAdmin" });
    };
    return Follow;
};