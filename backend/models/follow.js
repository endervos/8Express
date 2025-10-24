"use strict";
module.exports = (sequelize, DataTypes) => {
    const Follow = sequelize.define("Follow", {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        follower_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        following_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: "Follow",
        timestamps: false,
    });

    Follow.associate = (models) => {
        // Người theo dõi
        Follow.belongsTo(models.User, {
            foreignKey: "follower_id",
            as: "Follower",
        });
        // Người được theo dõi
        Follow.belongsTo(models.User, {
            foreignKey: "following_id",
            as: "Following",
        });
    };

    return Follow;
};