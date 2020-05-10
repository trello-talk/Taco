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

const BigBitField = require('./BigBitField');

/**
 * The bitfield that determines what gets through a webhook
 * @extends {BigBitField}
 */
class WebhookFilters extends BigBitField {}

/**
 * Numeric permission flags.
 * @type {Object}
 */
WebhookFilters.FLAGS = {
  // #region All action types, disabling any organization and enterprise-related types
  // https://developer.atlassian.com/cloud/trello/guides/rest-api/action-types/

  // ACCEPT_ENTERPRISE_JOIN_REQUEST: 1n << 0n,
  ADD_ATTACHMENT_TO_CARD: 1n << 1n,
  ADD_CHECKLIST_TO_CARD: 1n << 2n,
  ADD_LABEL_TO_CARD: 1n << 3n,
  ADD_MEMBER_TO_BOARD: 1n << 4n,
  ADD_MEMBER_TO_CARD: 1n << 5n,
  // ADD_MEMBER_TO_ORGANIZATION: 1n << 6,
  // ADD_ORGANIZATION_TO_ENTERPRISE: 1n << 7n,
  // ADD_TO_ENTERPRISE_PLUGIN_WHITELIST: 1n << 8n,
  // ADD_TO_ORGANIZATION_BOARD: 1n << 9n,
  COMMENT_CARD: 1n << 10n,
  CONVERT_TO_CARD_FROM_CHECK_ITEM: 1n << 11n,
  // COPY_BOARD: 1n << 12n,
  COPY_CARD: 1n << 13n,
  COPY_CHECKLIST: 1n << 14n,
  CREATE_LABEL: 1n << 15n,
  // COPY_COMMENT_CARD: 1n << 16n,
  // CREATE_BOARD: 1n << 17n,
  // CREATE_BOARD_INVITATION: 1n << 18n,
  // CREATE_BOARD_PREFERENCE: 1n << 19n,
  CREATE_CARD: 1n << 20n,
  CREATE_LIST: 1n << 21n,
  // CREATE_ORGANIZATION: 1n << 22n,
  // CREATE_ORGANIZATION_INVITATION: 1n << 23n,
  DELETE_ATTACHMENT_FROM_CARD: 1n << 24n,
  // DELETE_BOARD_INVITATION: 1n << 25n,
  DELETE_CARD: 1n << 26n,
  DELETE_CHECK_ITEM: 1n << 27n,
  DELETE_LABEL: 1n << 28n,
  // DELETE_ORGANIZATION_INVITATION: 1n << 29n,
  // DISABLE_ENTERPRISE_PLUGIN_WHITELIST: 1n << 30n,
  // DISABLE_PLUGIN: 1n << 31n,
  // DISABLE_POWER_UP: 1n << 32n,
  // EMAIL_CARD: 1n << 33n,
  // ENABLE_ENTERPRISE_PLUGIN_WHITELIST: 1n << 34n,
  // ENABLE_PLUGIN: 1n << 35n,
  // ENABLE_POWER_UP: 1n << 36n,
  MAKE_ADMIN_OF_BOARD: 1n << 37n,
  // MAKE_ADMIN_OF_ORGANIZATION: 1n << 38n,
  MAKE_NORMAL_MEMBER_OF_BOARD: 1n << 39n,
  // MAKE_NORMAL_MEMBER_OF_ORGANIZATION: 1n << 40n,
  // MAKE_OBSERVER_OF_BOARD: 1n << 41n,
  // MEMBER_JOINED_TRELLO: 1n << 42n,
  MOVE_CARD_FROM_BOARD: 1n << 43n,
  MOVE_CARD_TO_BOARD: 1n << 44n,
  MOVE_LIST_FROM_BOARD: 1n << 45n,
  MOVE_LIST_TO_BOARD: 1n << 46n,
  REMOVE_CHECKLIST_FROM_CARD: 1n << 47n,
  // REMOVE_FROM_ENTERPRISE_PLUGIN_WHITELIST: 1n << 48n,
  // REMOVE_FROM_ORGANIZATION_BOARD: 1n << 49n,
  REMOVE_LABEL_FROM_CARD: 1n << 50n,
  REMOVE_MEMBER_FROM_BOARD: 1n << 51n,
  REMOVE_MEMBER_FROM_CARD: 1n << 52n,
  // REMOVE_MEMBER_FROM_ORGANIZATION: 1n << 53n,
  // REMOVE_ORGANIZATION_FROM_ENTERPRISE: 1n << 54n,
  // UNCONFIRMED_BOARD_INVITATION: 1n << 55n,
  // UNCONFIRMED_ORGANIZATION_INVITATION: 1n << 56n,
  // UPDATE_BOARD: 1n << 57n,
  // UPDATE_CARD: 1n << 58n,
  // UPDATE_CHECK_ITEM: 1n << 59n,
  UPDATE_CHECK_ITEM_STATE_ON_CARD: 1n << 60n,
  // UPDATE_CHECKLIST: 1n << 61n,
  // UPDATE_LABEL: 1n << 62n,
  // UPDATE_LIST: 1n << 63n,
  // UPDATE_MEMBER: 1n << 64n,
  // UPDATE_ORGANIZATION: 1n << 65n,
  VOTE_ON_CARD: 1n << 66n,

  // Undocumented types
  CREATE_CHECK_ITEM: 1n << 67n,
  DELETE_COMMENT: 1n << 68n,
  UPDATE_COMMENT: 1n << 69n,
  // #endregion

  // #region UPDATE_BOARD subtypes [100]
  UPDATE_BOARD_NAME: 1n << 100n,
  UPDATE_BOARD_DESC: 1n << 101n,
  UPDATE_BOARD_PREFS: 1n << 102n,
  UPDATE_BOARD_CLOSED: 1n << 103n,
  // #endregion

  // #region UPDATE_CARD subtypes [110, 120]
  UPDATE_CARD_NAME: 1n << 200n,
  UPDATE_CARD_DESC: 1n << 201n,
  UPDATE_CARD_LIST: 1n << 202n,
  UPDATE_CARD_POS: 1n << 203n,
  UPDATE_CARD_CLOSED: 1n << 204n,
  UPDATE_CARD_DUE: 1n << 205n,
  // #endregion

  // #region UPDATE_CHECK_ITEM subtypes [300]
  UPDATE_CHECK_ITEM_NAME: 1n << 300n,
  UPDATE_CHECK_ITEM_POS: 1n << 301n,
  // #endregion

  // #region UPDATE_CHECKLIST subtypes [400]
  UPDATE_CHECKLIST_NAME: 1n << 400n,
  UPDATE_CHECKLIST_POS: 1n << 401n,
  // #endregion

  // #region UPDATE_LABEL subtypes [500]
  UPDATE_LABEL_NAME: 1n << 500n,
  UPDATE_LABEL_COLOR: 1n << 501n,
  // #endregion

  // #region UPDATE_LIST subtypes [600]
  UPDATE_LIST_NAME: 1n << 600n,
  UPDATE_LIST_POS: 1n << 602n,
  UPDATE_LIST_CLOSED: 1n << 603n,
  // #endregion
};

/**
 * Bitfield representing every permission combined
 * @type {BigInt}
 */
WebhookFilters.ALL = Object.values(WebhookFilters.FLAGS).reduce((all, p) => all | p, 0n);

/**
 * Bitfield representing default permissions
 * @type {BigInt}
 */
WebhookFilters.DEFAULT = new WebhookFilters([
  'ADD_CHECKLIST_TO_CARD', 'ADD_LABEL_TO_CARD', 'ADD_MEMBER_TO_BOARD', 'ADD_MEMBER_TO_CARD', 'COMMENT_CARD',
  'CREATE_LABEL', 'DELETE_CARD', 'DELETE_CHECK_ITEM', 'DELETE_LABEL', 'MAKE_ADMIN_OF_BOARD',
  'MAKE_NORMAL_MEMBER_OF_BOARD', 'REMOVE_CHECKLIST_FROM_CARD', 'REMOVE_LABEL_FROM_CARD',
  'REMOVE_MEMBER_FROM_BOARD','REMOVE_MEMBER_FROM_CARD', 'UPDATE_CHECK_ITEM_STATE_ON_CARD', 'VOTE_ON_CARD',
  'CREATE_CHECK_ITEM', 'DELETE_COMMENT', 'UPDATE_COMMENT', 'UPDATE_BOARD_NAME', 'UPDATE_BOARD_CLOSED',
  'UPDATE_CARD_NAME', 'UPDATE_CARD_LIST', 'UPDATE_CARD_CLOSED', 'UPDATE_CHECK_ITEM_NAME',
  'UPDATE_CHECKLIST_NAME', 'UPDATE_LIST_NAME', 'UPDATE_LIST_CLOSED']).bitfield;

module.exports = WebhookFilters;