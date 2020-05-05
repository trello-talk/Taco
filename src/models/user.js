const Sequelize = require('sequelize');
const Model = require('../structures/PostgresModel');

class User extends Model {
  static init(client, sequelize) {
    return super.init(client, {
      sequelize,
      modelName: 'user',
      modelKey: 'userID'
    }, {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userID: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      bannedFromUse: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      banReason: Sequelize.STRING,
      trelloToken: Sequelize.STRING,
      trelloID: Sequelize.STRING,
      currentBoard: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      locale: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      prefixes: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: []
      }
    });
  }

  static _findObject(user) {
    return this.findOrCreate({
      where: {
        userID: user.id,
      }
    });
  }
}

module.exports = User;