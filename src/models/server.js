const Sequelize = require('sequelize');
const Model = require('../structures/PostgresModel');

class Server extends Model {
  static init(client, sequelize) {
    return super.init(client, {
      sequelize,
      modelName: 'server',
      modelKey: 'serverID'
    }, {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      serverID: {
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
      locale: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: client.config.sourceLocale
      },
      prefix: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: client.config.prefix
      },
      maxWebhooks: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
    });
  }

  static _findObject(guild) {
    return this.findOrCreate({
      where: {
        serverID: guild.id,
      }
    });
  }
}

module.exports = Server;