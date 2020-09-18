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

    return this.client.limiter.schedule(() => new Promise((resolve, reject) => {
      // Abort Controller
      const controller = new AbortController();
      const controllerTimeout = setTimeout(controller.abort.bind(controller), 5000);

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
        if (e && e.type === 'aborted')
          resolve(e); else reject(e);
      });
    }));
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
        boards: 'all',
        board_fields: [
          'subscribed', 'starred', 'pinned',
          'name', 'shortLink', 'shortUrl',
          'closed'
        ]
      }
    });
  }

  /**
   * Gets the member's board stars
   * @param {string} id The member's ID
   */
  getBoardStars(id) {
    return this._request({
      url: `/members/${id}/boardStars`
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
          'shortUrl', 'powerUps', 'dateLastActivity',
          'closed', 'memberships'
        ],
        members: 'all',
        member_fields: ['username', 'fullName', 'id'],
        lists: 'all',
        list_fields: ['name', 'closed'],
        cards: 'all',
        card_fields: [
          'name', 'idList', 'shortLink', 'subscribed',
          'closed'
        ],
        labels: 'all',
        label_fields: ['name', 'color'],
        organization: true
      }
    });
  }

  /**
   * Gets the information on a board, optimized for card search
   * @param {string} id The board's ID
   */
  getSlimBoard(id) {
    return this._request({
      url: `/boards/${id}`,
      query: {
        fields: ['name'],
        lists: 'all',
        list_fields: ['name', 'closed'],
        cards: 'all',
        card_fields: [
          'name', 'idList', 'shortLink', 'subscribed',
          'closed'
        ]
      }
    });
  }

  /**
   * Gets the open lists on a board
   * @param {string} id The board's ID
   */
  getLists(id) {
    return this._request({
      url: `/boards/${id}/lists`,
      query: {
        cards: 'open',
        card_fields: [],
        fields: [
          'id', 'name', 'subscribed',
          'dateLastActivity'
        ]
      }
    });
  }

  /**
   * Gets all cards on a board
   * @param {string} id The board's ID
   */
  getAllLists(id) {
    return this._request({
      url: `/boards/${id}/lists/all`,
      query: {
        cards: 'open',
        card_fields: [
          'name', 'subscribed', 'shortLink',
          'closed'
        ],
        fields: [
          'id', 'name', 'subscribed',
          'dateLastActivity', 'closed'
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
        attachment_fields: ['url', 'name'],
        checklists: 'all',
        checklist_fields: ['name'],
        fields: [
          'name', 'subscribed', 'desc', 'labels',
          'shortLink', 'shortUrl', 'due', 'dueComplete',
          'cover', 'dateLastActivity', 'closed', 'idList'
        ]
      }
    });
  }

  /**
   * Gets the open cards on a board
   * @param {string} id The board's ID
   * @deprecated
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
      url: `/boards/${id}/cards/closed`,
      query: {
        fields: [
          'name', 'subscribed', 'shortLink',
          'shortUrl'
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
        fields: ['name', 'color', 'uses']
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
      bodyType: 'form',
      body: { name }
    });
  }

  /**
   * Creates a webhook for Trello.
   * @param {string} id The board's ID
   * @param {Object} payload The webhook to add
   */
  addWebhook(id, payload) {
    return this._request({
      method: 'post',
      url: `/tokens/${this.token}/webhooks`,
      bodyType: 'form',
      body: {
        idModel: id,
        description: `[${new Date()}] TrelloBot (https://github.com/trello-talk/TrelloBot)`,
        ...payload
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
      url: '/cards',
      bodyType: 'form',
      body: { ...payload, idList: id }
    });
  }

  /**
   * Creates a label on the board
   * @param {string} id The board's ID
   * @param {Object} payload The card to add
   */
  addLabel(id, payload) {
    return this._request({
      method: 'post',
      url: '/labels',
      bodyType: 'form',
      body: { ...payload, idBoard: id }
    });
  }

  /**
   * Creates a comment on a card
   * @param {string} id The card's ID
   * @param {string} text The text to post
   */
  addComment(id, text) {
    return this._request({
      method: 'post',
      url: `/cards/${id}/actions/comments`,
      bodyType: 'form',
      body: { text }
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
      bodyType: 'form',
      body: { url }
    });
  }

  /**
   * Creates a star for a board
   * @param {string} id The member's ID
   * @param {string} boardID The board's ID
   * @param {string} [pos='top'] The position of the star
   */
  starBoard(id, boardID, pos = 'top') {
    return this._request({
      method: 'post',
      url: `/members/${id}/boardStars`,
      bodyType: 'form',
      body: { idBoard: boardID, pos }
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
      bodyType: 'form',
      body: payload
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
      bodyType: 'form',
      body: payload
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
      bodyType: 'form',
      body: payload
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
      bodyType: 'form',
      body: payload
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
      url: `/webhooks/${id}`,
      bodyType: 'form',
      body: payload
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

  /**
   * Removs a star for a board
   * @param {string} id The member's ID
   * @param {string} starID The board star's ID
   */
  unstarBoard(id, starID) {
    return this._request({
      method: 'delete',
      url: `/members/${id}/boardStars/${starID}`
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
    const body = response.text ? await this._parse(response) : null;
    if (response.type === 'aborted') {
      await client.createMessage(message.channel.id, _('trello_response.aborted'));
      return { body, response, stop: true };
    } else if (response.status === 401 && body === 'invalid token') {
      await client.pg.models.get('user').removeAuth(message.author);
      await client.createMessage(message.channel.id, _('trello_response.unauthorized'));
      return { body, response, stop: true };
    } else if (response === 419) {
      await client.createMessage(message.channel.id, _('trello_response.ratelimit'));
      return { body, response, stop: true };
    } else if (response >= 500) {
      await client.createMessage(message.channel.id, _('trello_response.internal'));
      return { body, response, stop: true };
    }

    return { body, response, stop: false };
  }

  /**
   * @private
   */
  async _parse(response) {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }
}

Trello.BASE_URL = 'https://api.trello.com/1';

module.exports = Trello;