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

const fetch = require('node-fetch');
const AbortController = require('abort-controller');

class Trello {
  constructor(client, token) {
    this.client = client;
    this.token = token;
  }

  _request(options = {}) {
    if (!options.url)
      throw new Error('No URL was provided!');

    if (!options.method)
      options.method = 'get';

    const url = new URL(options.noBase ? options.url : Trello.BASE_URL + options.url);
    let body = options.body;

    // Query params
    if (options.query && Object.keys(options.query).length)
      Object.keys(options.query).map(key =>
        url.searchParams.append(key, options.query[key]));
    if (!options.noBase) {
      url.searchParams.append('key', this.client.config.trello.key);
      if (!options.url.startsWith('/tokens'))
        url.searchParams.append('token', this.token);
    }

    // Body Format
    if (body && options.bodyType === 'json')
      body = JSON.stringify(body);
    else if (body && options.bodyType === 'form') {
      body = new URLSearchParams();
      Object.keys(options.body).forEach(key =>
        body.append(key, options.body[key]));
    }

    // Hash
    if (options.hash)
      url.hash = options.hash;

    // User Agent
    const userAgent = `TrelloBot (https://github.com/trello-talk/TrelloBot ${this.client.pkg.version}) Node.js/${process.version}`;
    if (!options.headers)
      options.headers = {
        'User-Agent': userAgent
      };
    else
      options.headers['User-Agent'] = userAgent;

    // Abort Controller
    const controller = new AbortController();
    const controllerTimeout = setTimeout(controller.abort, 5000);

    return new Promise((resolve, reject) => {
      fetch(url.href, {
        body,
        headers: options.headers,
        method: options.method,
        signal: controller.signal
      }).then(r => {
        clearTimeout(controllerTimeout);
        resolve(r);
      }).catch(e => {
        clearTimeout(controllerTimeout);
        reject(e);
      });
    });
  }

  // #region Get methods
  /**
   * Gets the info on a member
   * @param {string} id The member's ID
   */
  getMember(id) {
    return this._request({
      url: `/members/${id}`,
      query: {
        boards: 'open',
        board_fields: [
          'subscribed', 'starred', 'pinned',
          'name', 'shortLink', 'shortUrl'
        ]
      }
    });
  }

  /**
   * Gets the information on a board
   * @param {string} id The board's ID
   */
  getBoard(id) {
    return this._request({
      url: `/boards/${id}`,
      query: {
        fields: [
          'subscribed', 'starred', 'pinned',
          'name', 'desc', 'prefs', 'shortLink',
          'shortUrl', 'powerUps'
        ],
        members: 'all',
        member_fields: ['username', 'fullName', 'id'],
        lists: 'all',
        list_fields: ['name'],
        cards: 'all',
        card_fields: [
          'name', 'idList', 'shortLink', 'subscribed'
        ],
        organization: true
      }
    });
  }

  /**
   * Gets the open cards on a board
   * @param {string} id The board's ID
   */
  getLists(id) {
    return this._request({
      url: `/boards/${id}/lists`,
      query: {
        cards: 'open',
        card_fields: [
          'name', 'subscribed', 'shortLink',
          'shortUrl', 'labels'
        ],
        fields: [
          'id', 'name', 'subscribed',
          'dateLastActivity'
        ]
      }
    });
  }

  /**
   * Gets the archived lists on a board
   * @param {string} id The board's ID
   */
  getListsArchived(id) {
    return this._request({
      url: `/boards/${id}/lists`,
      query: {
        filter: 'closed',
        cards: 'open',
        card_fields: [
          'name', 'subscribed', 'shortLink',
          'shortUrl', 'labels'
        ]
      }
    });
  }

  /**
   * Gets a card's info
   * @param {string} id The card's ID
   */
  getCard(id) {
    return this._request({
      url: `/cards/${id}`,
      query: {
        members: 'true',
        member_fields: ['fullName', 'username'],
        membersVoted: 'true',
        memberVoted_fields: ['fullName', 'username'],
        board: 'true',
        board_fields: ['subscribed', 'name', 'shortLink','shortUrl'],
        stickers: 'true',
        sticker_fields: ['image'],
        attachments: 'true',
        attachment_fields: ['url'],
        checklists: 'all',
        checklist_fields: ['name'],
        fields: [
          'name', 'subscribed', 'desc', 'labels',
          'shortLink', 'shortUrl', 'due'
        ]
      }
    });
  }

  /**
   * Gets the open cards on a board
   * @param {string} id The board's ID
   */
  getCards(id) {
    return this._request({
      url: `/boards/${id}/cards`,
      query: {
        card_fields: [
          'name', 'subscribed', 'shortLink',
          'shortUrl', 'labels'
        ]
      }
    });
  }

  /**
   * Gets the archived cards on a board
   * @param {string} id The board's ID
   */
  getCardsArchived(id) {
    return this._request({
      url: `/boards/${id}/cards`,
      query: {
        filter: 'closed',
        card_fields: [
          'name', 'subscribed', 'shortLink',
          'shortUrl', 'labels'
        ]
      }
    });
  }

  /**
   * Gets the labels on a board
   * @param {string} id The board's ID
   */
  getLabels(id) {
    return this._request({
      url: `/boards/${id}/labels`,
      query: {
        fields: ['name', 'color']
      }
    });
  }

  /**
   * Gets the information based on the token
   */
  getToken() {
    return this._request({
      url: `/tokens/${this.token}`
    });
  }

  /**
   * Gets all webhooks for the token
   */
  getWebhooks() {
    return this._request({
      url: `/tokens/${this.token}/webhooks`
    });
  }
  // #endregion

  // #region Post methods
  /**
   * Creates a list on the board.
   * @param {string} id The board's ID
   * @param {string} name The name of the list
   */
  addList(id, name) {
    return this._request({
      method: 'post',
      url: `/boards/${id}/lists`,
      query: { name }
    });
  }

  /**
   * Creates a webhook for Trello.
   * @param {string} id The board's ID
   */
  addWebhook(id) {
    return this._request({
      method: 'post',
      url: `/tokens/${this.token}/webhooks`,
      query: {
        idModel: id,
        callbackURL: this.client.config.webhookURL,
        description: `[${new Date()}] TrelloBot (https://github.com/trello-talk/TrelloBot)`
      }
    });
  }

  /**
   * Creates a card in the list
   * @param {string} id The list's ID
   * @param {Object} payload The card to add
   */
  addCard(id, payload) {
    return this._request({
      method: 'post',
      url: `/lists/${id}/cards`,
      query: payload
    });
  }

  /**
   * Creates an attachment to a card
   * @param {string} id The card's ID
   * @param {string} url The attachment's URL
   */
  addAttachment(id, url) {
    return this._request({
      method: 'post',
      url: `/cards/${id}/attachments`,
      query: { url }
    });
  }
  // #endregion

  // #region Put methods
  /**
   * Updates a label.
   * @param {string} id The label's ID
   * @param {Object} payload The data to use
   */
  updateLabel(id, payload) {
    return this._request({
      method: 'put',
      url: `/labels/${id}`,
      query: payload
    });
  }

  /**
   * Updates a board
   * @param {string} id The board's ID
   * @param {Object} payload The data to use
   */
  updateBoard(id, payload) {
    return this._request({
      method: 'put',
      url: `/boards/${id}`,
      query: payload
    });
  }

  /**
   * Updates a list.
   * @param {string} id The list's ID
   * @param {Object} payload The data to use
   */
  updateList(id, payload) {
    return this._request({
      method: 'put',
      url: `/lists/${id}`,
      query: payload
    });
  }

  /**
   * Updates a card.
   * @param {string} id The card's ID
   * @param {Object} payload The data to use
   */
  updateCard(id, payload) {
    return this._request({
      method: 'put',
      url: `/cards/${id}`,
      query: payload
    });
  }

  /**
   * Updates a webhook.
   * @param {string} id The webhook's ID
   * @param {Object} payload The data to use
   */
  updateWebhook(id, payload) {
    return this._request({
      method: 'put',
      url: `/tokens/${this.token}/webhooks/${id}`,
      query: payload
    });
  }
  // #endregion

  // #region Delete methods
  /**
   * Deletes a label.
   * @param {string} id The label's ID
   */
  deleteLabel(id) {
    return this._request({
      method: 'delete',
      url: `/labels/${id}`
    });
  }

  /**
   * Deletes a card.
   * @param {string} id The card's ID
   */
  deleteCard(id) {
    return this._request({
      method: 'delete',
      url: `/cards/${id}`
    });
  }

  /**
   * Deletes a webhook.
   * @param {string} id The webhook's ID
   */
  deleteWebhook(id) {
    return this._request({
      method: 'delete',
      url: `/tokens/${this.token}/webhooks/${id}`
    });
  }
  // #endregion

  /**
   * Invalidates the token given.
   */
  invalidate() {
    return this._request({
      method: 'delete',
      url: `/tokens/${this.token}`
    });
  }

  /**
   * Handles a response given by Trello.
   */
  async handleResponse({ response, message, client, _ }) {
    if (response.status == 401) {
      await client.pg.models.get('user').removeAuth(message.author);
      await client.createMessage(message.channel.id, _('trello_response.unauthorized'));
      return true;
    } else if (response == 419) {
      await client.createMessage(message.channel.id, _('trello_response.ratelimit'));
      return true;
    } else if (response >= 500) {
      await client.createMessage(message.channel.id, _('trello_response.internal'));
      return true;
    } else if (response >= 400 && response !== 404)
      // TODO: Make a custom error class for this
      throw response;

    return false;
  }
}

Trello.BASE_URL = 'https://api.trello.com/1';

module.exports = Trello;