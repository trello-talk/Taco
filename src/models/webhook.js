const Sequelize = require('sequelize');
const Model = require('../structures/PostgresModel');

class Webhook extends Model {
  static init(client, sequelize) {
    return super.init(client, {
      sequelize,
      modelName: 'webhook',
      modelKey: 'id'
    }, {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      memberID: Sequelize.STRING,
      modelID: {
        type: Sequelize.STRING,
        allowNull: false
      },
      trelloWebhookID: Sequelize.STRING,
      filters: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '0'
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      locale: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      style: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'default'
      },
      guildID: {
        type: Sequelize.STRING,
        allowNull: false
      },
      webhookID: Sequelize.STRING,
      webhookToken: Sequelize.STRING,
      whitelist: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      lists: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: []
      },
      cards: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: []
      },
    });
  }
}

module.exports = Webhook;