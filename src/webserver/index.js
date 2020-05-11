/* global BigInt */
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

const express = require('express');
const logger = require('../logger')('[WEBSERVER]');
const webhookLogger = require('../logger')('[WEBHOOK]');
const gracefulExit = require('express-graceful-exit');
const reload = require('require-reload')(require);
const WebhookData = require('./WebhookData');
const WebhookFilters = require('../structures/WebhookFilters');
const findFilter = require('./findFilter');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Webserver class that listens to webhook events
 */
class WebServer {
  /**
   * @param {TrelloBot} client The client that loaded the webserver
   * @author Snazzah
   */
  constructor(client) {
    /**
     * The express application being used
     * @type {Express}
     */
    this.app = express();

    /**
     * Whether or not middleware has been added
     * @type {boolean}
     */
    this.middlewareAdded = false;

    /**
     * The client that initialized the webserver
     * @type {BotBoy}
     */
    this.client = client;

    this.events = new Map();

    logger.info('Webserver initialized');
  }

  /**
   * Loads locales from a folder
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
          this.loadEvent(realPath);
        } else if (stat.isDirectory()) {
          this.iterateFolder(realPath);
        }
      } else if (stat.isFile() && file.endsWith('.js'))
        this.loadEvent(filePath);
      else if (stat.isDirectory())
        this.iterateFolder(filePath);
    });
  }

  loadEvent(filePath) {
    logger.info('Loading event', filePath);
    const file = reload(filePath);
    this.events.set(file.name, file.exec);
  }

  /**
   * Loads middleware into application
   */
  addMiddleware() {
    if (this.middlewareAdded) return;
    this.app.use(gracefulExit.middleware(this.app));
    this.app.use(express.json());
    this.app.get('/:id', (_, res) => res.status(200).send('Ready to recieve.'));
    this.app.post('/:id', this.webhookRequest.bind(this));
    this.iterateFolder(path.resolve(__dirname, 'events'));
    this.middlewareAdded = true;
  }

  /**
   * @private
   */
  validateRequest(request) {
    const content = JSON.stringify(request.body) + this.client.config.webserver.base + request.params.id;
    const hash = crypto.createHmac('sha1', this.client.config.trello.secret).update(content).digest('base64');
    return hash === request.get('x-trello-webhook');
  }

  // https://website.com/{id}

  /**
   * @private
   */
  async webhookRequest(request, response) {
    if (!/^[0-9a-f]{24}$/.test(request.params.id))
      return response.status(400).send('Bad request');
    
    const ip = request.get('x-forwarded-for') || request.ip;

    if (this.client.config.webserver.whitelistedIPs.length &&
      !this.client.config.webserver.whitelistedIPs.includes(ip))
      return response.status(401).send('Unauthorized');

    if (!this.validateRequest(request)) {
      webhookLogger.info(`Failed validation from request @ ${request.params.id}`, ip);
      return response.status(401).send('Validation failed');
    }

    const filter = findFilter(request, this);
    if (!filter) return response.status(200).send('Recieved');

    try {
      const webhooks = await this.client.pg.models.get('webhook').findAll({ where: {
        modelID: request.body.model.id,
        memberID: request.params.id,
        active: true
      }});
  
      await Promise.all(webhooks.map(webhook => {
        const data = new WebhookData(request, webhook, this, filter);
        const filters = new WebhookFilters(BigInt(webhook.filters));
        let allowed = true;
        
        if (request.body.action.data.card || request.body.action.data.list) {
          if (webhook.cards.length && request.body.action.data.card)
            allowed = webhook.cards.includes(request.body.action.data.cards.id);
          if (webhook.lists.length && request.body.action.data.list)
            allowed = webhook.lists.includes(request.body.action.data.list.id);
        }

        if (!webhook.whitelist && (webhook.cards.length || webhook.lists.length))
          allowed = !allowed;

        if (allowed && filters.has(filter))
          return this.events.get(filter)(data);
      }));
  
      response.status(200).send('Recieved');
    } catch (e) {
      if (this.client.airbrake)
        await this.client.airbrake.notify({
          error: e,
          params: {
            webserver: {
              ip,
              memberID: request.params.id,
              modelID: request.body.model.id
            }
          }
        });
      if (!this.client.airbrake || this.client.config.debug)
        console.log(e);
      response.status(500).send('Internal error');
    }
  }

  /**
   * Starts the webserver and listens to port
   * @returns {Promise}
   */
  start() {
    return new Promise(resolve => {
      this.addMiddleware();
      this.server = this.app.listen(this.client.config.webserver.port, () => {
        logger.info(`Running on port ${this.client.config.webserver.port}`);
        resolve();
      });
    });
  }

  /**
   * Kills the webserver
   * @returns {Promise}
   */
  stop() {
    return new Promise(resolve => {
      gracefulExit.gracefulExitHandler(this.app, this.server, {
        exitProcess: false,
        logger: logger.info,
        callback: () => {
          logger.info('Killed Webserver');
          resolve();
        }
      });
    });
  }
}

module.exports = WebServer;