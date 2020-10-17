const Util = require('../util');
const lodash = require('lodash');
const Bottleneck = require('bottleneck');

class WebhookData {
  constructor(request, webhook, webserver, filterFlag) {
    this.request = request;
    this.webhook = webhook;
    this.webserver = webserver;
    this.client = webserver.client;

    /**
     * The filter flag this is representing
     * @type {BigInt}
     */
    this.filterFlag = filterFlag;
  }

  /**
   * The webhook URL the data is parsing to
   * @deprecated
   * @type {string}
   */
  get webhookURL() {
    return `https://discord.com/api/webhooks/${this.webhook.webhookID}/${this.webhook.webhookToken}`;
  }

  /**
   * The locale module the request is using
   * @type {LocaleModule}
   */
  get localeModule() {
    return this.webserver.client.locale.createModule(this.webhook.locale);
  }

  /**
   * Whether the request is representing a child action
   * @returns {boolean}
   */
  isChildAction() {
    return this.action.type
      .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).toUpperCase() !== this.filterFlag;
  }

  /**
   * The body of the request
   * @type {Object}
   */
  get body() {
    return this.request.body;
  }

  /**
   * The util module
   * @type {Object}
   */
  get util() {
    return Util;
  }

  /**
   * The model that this action is for
   * @type {Object}
   */
  get model() {
    return this.request.body.model;
  }

  /**
   * The action data
   * @type {Object}
   */
  get action() {
    return this.request.body.action;
  }

  /**
   * The user who started the event
   * @type {Object}
   */
  get invoker() {
    const member = this.request.body.action.memberCreator;
    return {
      avatar: member.avatarUrl ? member.avatarUrl + '/170.png' : null,
      webhookSafeName: member.fullName ?
        Util.cutoffText(member.fullName, 50) : member.username,
      titleSafeName: member.fullName ?
        Util.cutoffText(member.fullName, 256) : member.username,
      ...member
    };
  }

  // #region action data shorthands
  /**
   * The old data from the action
   * @type {Object}
   */
  get oldData() {
    return this.request.body.action.data.old;
  }

  /**
   * The board represented from the action
   * @type {?Object}
   */
  get board() {
    return this.request.body.action.data.board;
  }

  /**
   * The target board represented from the action
   * @type {?Object}
   */
  get targetBoard() {
    return this.request.body.action.data.boardTarget;
  }

  /**
   * The source board represented from the action
   * @type {?Object}
   */
  get sourceBoard() {
    return this.request.body.action.data.boardSource;
  }

  /**
   * The label represented from the action
   * @type {?Object}
   */
  get label() {
    return this.request.body.action.data.label;
  }

  /**
   * The attachment represented from the action
   * @type {?Object}
   */
  get attachment() {
    return this.request.body.action.data.attachment;
  }

  /**
   * The member represented from the action
   * @type {?Object}
   */
  get member() {
    const member = this.request.body.action.member;
    return member ? {
      avatar: member.avatarUrl ? member.avatarUrl + '/170.png' : null,
      webhookSafeName: member.fullName ?
        Util.cutoffText(member.fullName, 50) : member.username,
      ...member
    } : member;
  }

  /**
   * The card represented from the action
   * @type {?Object}
   */
  get card() {
    return this.request.body.action.data.card;
  }

  /**
   * The source card represented from the action
   * @type {?Object}
   */
  get sourceCard() {
    return this.request.body.action.data.cardSource;
  }

  /**
   * The list represented from the action
   * @type {?Object}
   */
  get list() {
    return this.request.body.action.data.list;
  }

  /**
   * The list before represented from the action
   * @type {?Object}
   */
  get listBefore() {
    return this.request.body.action.data.listBefore;
  }

  /**
   * The list after represented from the action
   * @type {?Object}
   */
  get listAfter() {
    return this.request.body.action.data.listAfter;
  }

  /**
   * The checklist represented from the action
   * @type {?Object}
   */
  get checklist() {
    return this.request.body.action.data.checklist;
  }

  /**
   * The source checklist represented from the action
   * @type {?Object}
   */
  get sourceChecklist() {
    return this.request.body.action.data.checklistSource;
  }

  /**
   * The checklist item represented from the action
   * @type {?Object}
   */
  get checklistItem() {
    return this.request.body.action.data.checkItem;
  }

  /**
   * The custom field represented from the action
   * @type {?Object}
   */
  get customField() {
    return this.request.body.action.data.customField;
  }

  /**
   * The custom field item represented from the action
   * @type {?Object}
   */
  get customFieldItem() {
    return this.request.body.action.data.customFieldItem;
  }
  // #endregion

  embedDescription(fields = null) {
    const _ = this.localeModule;
    const lines = {
      invoker: `**${_('words.member.one')}:** ${this.invoker.fullName ?
        `${Util.cutoffText(this.invoker.fullName, 50)} (${this.invoker.username})` : this.invoker.username}`,
      member: (this.member ? `**${_('words.member.one')}:** ${this.member.fullName ?
        `${Util.cutoffText(this.member.fullName, 50)} (${this.member.username})` :
        this.action.member.username}` : ''),
      card: (this.card && this.card.name ? `**${_('words.card.one')}:** [${Util.cutoffText(Util.Escape.markdown(this.card.name), 50)}](https://trello.com/c/${this.card.shortLink})` : ''),
      list: (this.list && this.list.name ? 
        `**${_('words.list.one')}:** ${
          Util.cutoffText(Util.Escape.markdown(this.list.name), 50)}` : ''),
      listBefore: (this.listBefore ? `**${_('trello.prev_list')}:** ${
        Util.cutoffText(Util.Escape.markdown(this.listBefore.name), 50)}` : ''),
      listAfter: (this.listAfter ? `**${_('trello.curr_list')}:** ${
        Util.cutoffText(Util.Escape.markdown(this.listAfter.name), 50)}` : ''),
      checklist: (this.checklist && this.checklist.name ? `**${_('words.checklist.one')}:** ${
        Util.cutoffText(Util.Escape.markdown(this.checklist.name), 50)}` : ''),
      checklistItem: (this.checklistItem && this.checklistItem.name ?
        `**${_('words.checklist_item.one')}:** ${
          Util.cutoffText(Util.Escape.markdown(this.checklistItem.name, 50))}` : ''),
      customField: (this.customField && this.customField.type ?
        `**${_('trello.custom_field')} (${_(`custom_field_types.${this.customField.type}`)}):** ${
          Util.cutoffText(Util.Escape.markdown(this.customField.name, 50))}` : ''),
      label: (this.label && this.label.name ?
        `**${_('words.label.one')}${this.label.color ? ` (${_(`trello.label_color.${this.label.color}`)})` :
          ''}:** ${Util.cutoffText(Util.Escape.markdown(this.label.name), 50)}` : ''),
      attachment: (this.attachment && this.attachment.name ?
        `**${_('words.attachment.one')}:** ${this.attachment.url ?
          `[${Util.cutoffText(Util.Escape.markdown(this.attachment.name), 50)}](${this.attachment.url})` :
          Util.cutoffText(Util.Escape.markdown(this.attachment.name), 50)}` : ''),
    };
    if (!fields)
      fields = Object.keys(lines);
    return fields.map(f => lines[f]).filter(v => !!v).join('\n');
  }

  /**
   * Sends the embed to the webhook
   * @param {Object<string, Object>} embedStyles The embeds for each style
   */
  async send(embedStyles) {
    // Update card-list pairing cache
    if (this.card && (this.list || this.listAfter))
      this.webserver.cardListMapCache.set(this.card.id,
        [Date.now(), this.list ? this.list.id : this.listAfter.id]);

    const EMBED_DEFAULTS = {
      default: {
        color: this.isChildAction() ? WebhookData.DEFAULT_COLORS.CHILD :
          WebhookData.DEFAULT_COLORS[this.filterFlag.split('_')[0]],
        author: {
          icon_url: this.webserver.client.config.iconURL,
          name: 'Trello: ' + Util.cutoffText(this.model.name, 248),
          url: this.model.url
        },
        description: embedStyles.default.description || this.embedDescription(),
        ...(this.invoker.avatar ? {
          thumbnail: { url: this.invoker.avatar }
        } : {}),
        timestamp: this.action.date,
        footer: {
          icon_url: 'https://tacobot.app/logo_happy.png',
          text: 'tacobot.app'
        }
      },
      small: {
        color: this.isChildAction() ? WebhookData.DEFAULT_COLORS.CHILD :
          WebhookData.DEFAULT_COLORS[this.filterFlag.split('_')[0]],
        author: {
          ...(this.invoker.avatar ? {
            icon_url: this.invoker.avatar
          } : {}),
          name: this.invoker.titleSafeName,
          url: this.model.url
        },
        url: this.model.url,
        title: Util.cutoffText(this.model.name, 256),
        timestamp: this.action.date,
        footer: {
          icon_url: 'https://tacobot.app/logo_happy.png',
          text: 'tacobot.app'
        }
      },
      compact: {
        color: 3092790,
        author: {
          icon_url: this.webserver.client.config.iconURL,
          name: 'Trello: ' + Util.cutoffText(this.model.name, 248),
          url: this.model.url
        },
        timestamp: this.action.date,
        footer: {
          icon_url: 'https://tacobot.app/logo_happy.png',
          text: 'tacobot.app'
        }
      },
    };

    if (this.webhook.style === 'compact') {
      const batchKey = `compact:${this.model.id}:${this.webhook.webhookID}`;
      const compactLine = `\`${this.isChildAction() ? WebhookData.COMPACT_EMOJIS.CHILD :
        WebhookData.COMPACT_EMOJIS[this.filterFlag.split('_')[0]]}\` ${embedStyles.small.description}`;

      if (this.webserver.batches.has(batchKey))
        return (() => {
          this.webserver.batches.get(batchKey).add(compactLine);
        })();
  
      const batcher = new Bottleneck.Batcher({
        maxTime: 2000,
        maxSize: 10
      });
      this.webserver.batches.set(batchKey, batcher);
  
      batcher.on('batch', lines => {
        this.webserver.batches.delete(batchKey);
        this._send(lodash.defaultsDeep({
          description: lines.join('\n')
        }, EMBED_DEFAULTS.compact));
      });
  
      batcher.add(compactLine);
      return;
    }

    return this._send(lodash.defaultsDeep(embedStyles[this.webhook.style],
      EMBED_DEFAULTS[this.webhook.style]));
  }

  /**
   * batches and sends the raw embed
   * @private
   */
  async _send(embed) {
    if (this.webserver.batches.has(this.webhook.webhookID))
      // Since Batcher#add returns a promise that resolves after a flush, this won't return the promise and
      // therefore won't halt the request until flushed.
      return (() => {
        this.webserver.batches.get(this.webhook.webhookID).add(embed);
      })();

    const batcher = new Bottleneck.Batcher({
      maxTime: 1000,
      maxSize: 10
    });
    this.webserver.batches.set(this.webhook.webhookID, batcher);

    batcher.on('batch', async embeds => {
      this.webserver.batches.delete(this.webhook.webhookID);
      try {
        this.client.stats.onWebhookSend(this.webhook.webhookID);
        console.info('Posting webhook %d (guild=%s)', this.webhook.webhookID, this.webhook.guildID);
        return await this.webserver.client.executeWebhook(this.webhook.webhookID,
          this.webhook.webhookToken, { embeds });
      } catch (e) {
        if (e.name.startsWith('DiscordRESTError')) {
          if (e.code === 10015) //  Unknown Webhook
            return await this.webserver.client.pg.models.get('webhook').update({
              webhookID: null,
              webhookToken: null
            }, { where: { id: this.webhook.id } });
          console.webserv(
            `Discord webhook execution failed @ ${this.webhook.webhookID}:${this.webhook.id}`, e);
        } else {
          if (this.client.airbrake) {
            await this.client.airbrake.notify({
              error: e,
              params: {
                type: 'webhook',
                webhook: {
                  errName: e.name,
                  errCode: e.code,
                  id: this.webhook.webhookID,
                  modelID: this.webhook.modelID,
                  memberID: this.webhook.memberID,
                  event: this.filterFlag
                }
              }
            });
          } else if (this.client.config.debug) {
            console.error(`Webhook execution failed @ ${this.webhook.webhookID}:${this.webhook.id}`);
            console.log(e);
          }
        }
      }
    });

    batcher.add(embed);
  }
}

WebhookData.DEFAULT_COLORS = {
  ADD: 0x2ecc71,
  CREATE: 0x16a085,
  UPDATE: 0xe67e22,
  CHILD: 0xf1c40f,
  UNCONFIRMED: 0xf1c40f,
  REMOVE: 0xe74c3c,
  DELETE: 0xc0392b,
  ENABLE: 0x95a5a6,
  DISABLE: 0x34495e,
  MAKE: 0x3498db,
  MEMBER: 0x3498db,
  VOTE: 0x2980b9,
  EMAIL: 0xecf0f1,
  COMMENT: 0xff9f43,
  CONVERT: 0x9b59b6,
  COPY: 0xf19066,
  MOVE: 0xB53471
};

WebhookData.COMPACT_EMOJIS = {
  ADD: '🟢',
  CREATE: '🟩',
  UPDATE: '🟧',
  CHILD: '🟡',
  UNCONFIRMED: '🟠',
  REMOVE: '🔴',
  DELETE: '🟥',
  ENABLE: '✅',
  DISABLE: '❎',
  MAKE: '🟦',
  MEMBER: '🔵',
  VOTE: '🗳️',
  EMAIL: '📧',
  COMMENT: '💬',
  CONVERT: '📇',
  COPY: '📋',
  MOVE: '📦'
};

module.exports = WebhookData;