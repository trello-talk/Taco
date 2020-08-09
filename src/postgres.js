const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { EventEmitter } = require('eventemitter3');
const reload = require('require-reload')(require);

/**
 * The Postgres database handler
 */
module.exports = class Postgres extends EventEmitter {
  constructor(client, modelsPath) {
    super();
    this.client = client;
    this.path = path.resolve(modelsPath);
    this.models = new Map();
    console.init('Postgres initialized');
  }

  /**
   * Loads models from a folder
   * @param {String} folderPath
   */
  iterateFolder(folderPath) {
    const files = fs.readdirSync(folderPath);
    files.map(file => {
      const filePath = path.join(folderPath, file);
      const stat = fs.lstatSync(filePath);
      if (stat.isSymbolicLink()) {
        const realPath = fs.readlinkSync(filePath);
        if (stat.isFile() && file.endsWith('.js')) {
          this.load(realPath);
        } else if (stat.isDirectory()) {
          this.iterateFolder(realPath);
        }
      } else if (stat.isFile() && file.endsWith('.js'))
        this.load(filePath);
      else if (stat.isDirectory())
        this.iterateFolder(filePath);
    });
  }

  /**
   * Loads a model
   * @param {string} modelPath
   */
  load(modelPath) {
    console.fileload('Loading model', modelPath);
    const model = reload(modelPath);
    model.init(this.client, this.sequelize);
    model.sync();
    model.path = modelPath;
    this.models.set(path.parse(modelPath).name, model);
  }

  /**
   * Connects the postgres instance and syncs all models
   * @param {Object} options
   */
  connect({ host = 'localhost', database, user, password }) {
    console.info('Connecting to postgres...');
    return new Promise((resolve, reject) => {
      this.sequelize = new Sequelize(
        database, user, password,
        {
          host,
          dialect: 'postgres',
          logging: false,
          define: { timestamps: true }
        },
      );
      this.sequelize.authenticate()
        .then(() => {
          console.info('Postgres connection has been established successfully.');

          // array_append_distinct function
          this.sequelize.query(`
            CREATE OR REPLACE FUNCTION array_append_distinct(anyarray, anyelement) 
            RETURNS anyarray AS $$ 
            SELECT ARRAY(SELECT unnest($1) union SELECT $2) 
            $$ LANGUAGE sql;
          `);

          // Load models
          this.iterateFolder(this.path);
          resolve();
        }).catch(err => {
          console.error('Unable to connect to the postgres database', err);
          reject(err);
        });
    });
  }
};
