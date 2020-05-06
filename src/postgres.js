/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah (and contributors) 2016-2020

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { EventEmitter } = require('eventemitter3');
const logger = require('./logger')('[POSTGRES]');
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
    logger.info('Initialized');
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
    logger.info('Loading model', modelPath);
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
    logger.info('Connecting...');
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
          logger.info('Connection has been established successfully.');

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
          logger.error('Unable to connect to the database', err);
          reject(err);
        });
    });
  }
};
