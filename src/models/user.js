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
      currentBoard: Sequelize.STRING,
      discordToken: Sequelize.STRING,
      discordRefresh: Sequelize.STRING,
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

  static async removeAuth(obj) {
    const [model] = await this._findObject(obj);

    return await model.update({
      trelloID: null,
      trelloToken: null,
    }, {
      where: {
        [this._modelKey]: obj.id,
      },
    });
  }
}

module.exports = User;