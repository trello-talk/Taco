/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah 2016 - 2019
 Copyright (c) Yamboy1 (and contributors) 2019 - 2020
 
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

const fuzzy = require("fuzzy");
const StickerEmojis = {
  thumbsup: "<:trelloThumbsUp:245756307456524299>",
  thumbsdown: "<:trelloThumbsDown:245756307452329984>",
  heart: "<:trelloHeart:245752268312281109>",
  star: "<:trelloStar:245756307578028034>",
  clock: "<:trelloClock:245758457100238848>",
  huh: "<:trelloHuh:245756306936299521>",
  rocketship: "<:trelloRocketship:245756307309592576>",
  warning: "<:trelloWarning:245758457171410945>",
  smile: "<:trelloSmile:245756307334889472>",
  laugh: "<:trelloLaugh:245756307221643274>",
  frown: "<:trelloFrown:322123093424209921>",
  check: "<:trelloCheck:245758456814895105>",

  "pete-alert": "<:trellopeteAlert:245758456840060941>",
  "pete-award": "<:trellopeteAward:245758457272205312>",
  "pete-broken": "<:trellopeteBroken:322128049669668864>",
  "pete-busy": "<:trellopeteBusy:322128049715937280>",
  "pete-completed": "<:trellopeteComplete:245758456999575553>",
  "pete-confused": "<:trellopeteConfused:322128049686708224>",
  "pete-ghost": "<:trellopeteGhost:322128049707417610>",
  "pete-happy": "<:trellopeteHappy:322128049678319616>",
  "pete-love": "<:trellopeteLove:322128049795497994>",
  "pete-music": "<:trellopeteMusic:322128049774526465>",
  "pete-shipped": "<:trellopeteShipped:322128050148081674>",
  "pete-sketch": "<:trellopeteSketch:322128049837703178>",
  "pete-space": "<:trellopeteSpace:322128050185568276>",
  "pete-talk": "<:trellopeteTalk:322128050231967744>",
  "pete-vacation": "<:trellopeteVacation:322128050042961921>",

  "taco-active": "<:trellotacoActive:322130958868545536>",
  "taco-alert": "<:trellotacoAlert:322130958675607553>",
  "taco-angry": "<:trellotacoAngry:322130959023603712>",
  "taco-celebrate": "<:trellotacoCelebrate:322130958834860034>",
  "taco-clean": "<:trellotacoClean:322130958692384770>",
  "taco-confused": "<:trellotacoConfused:322130959342370818>",
  "taco-cool": "<:trellotacoCool:322130959191375873>",
  "taco-embarrassed": "<:trellotacoEmbarrassed:322130959325593600>",
  "taco-love": "<:trellotacoLove:322144522752753665>",
  "taco-money": "<:trellotacoMoney:322130959145107467>",
  "taco-pixel": "<:trellotacoPixel:322130959363342336>",
  "taco-proto": "<:trellotacoProto:322130959468331008>",
  "taco-reading": "<:trellotacoReading:322130959313141771>",
  "taco-robot": "<:trellotacoRobot:322130959510142976>",
  "taco-sleeping": "<:trellotacoSleeping:322130959585509376>",
  "taco-trophy": "<:trellotacoTrophy:322130959967453194>"
};

const TrelloEvents = {
  voteOnCard: "a card has been voted on",
  createCard: "a card has been created",
  updateCheckItemStateOnCard: "a checklist item has been changed",
  deleteCard: "a card has been deleted",
  commentCard: "a card has been commented on",
  removeChecklistFromCard: "a checklist has been added tn a card",
  addChecklistToCard: "a checklist has been removed from a card",
  addLabelToCard: "a label has been added to a card",
  removeLabelFromCard: "a label has been removed from a card",
  updateCard: "a card has been edited, such as it's name and description",
  createCheckItem: "a check item has been added to a checklist",
  deleteCheckItem: "a check item has been removed to a checklist",
  addMemberToBoard: "a member has been added to the board",
  makeAdminOfBoard: "a member has been made admin",
  makeNormalMemberOfBoard: "a member has been made normal member",
  createList: "a list has been created",
  addAttachmentToCard: "an attachment has been added to a card",
  copyChecklist: "contents of a checklist has been copied to another (will also fire the createChecklist event)",
  updateCustomFieldItem: "a custom field on a card has been updated",
  deleteComment: "a comment has been deleted",
  updateComment: "a comment has been updated",
  addMemberToCard: "a member has been added to a card",
  deleteAttachmentFromCard: "an attachment has been removed from a card",
  removeMemberFromCard: "a member has been removed from a card",
  enablePlugin: "a board plugin has been enabled",
  disablePlugin: "a board plugin has been disabled",
  enablePowerUp: "a board powerup has been enabled",
  disablePowerUp: "a board powerup has been disabled",
  createCustomField: "a custom field has been created",
  deleteCustomField: "a custom field has been deleted",
  updateCustomField: "a custom field has been updated",
  copyCard: "a card has been duplicated",
  updateChecklist: "a checklist has been renamed"
};

module.exports = (client) => {
  let Util = {
    StickerEmojis, TrelloEvents,
    layout: {
      cardLabels(labels) {
        return labels.map(label => "[" + (label.name || "Unnamed Label") + "][" + Util.capFirst(label.color || "No Color") + "]");
      },
      cardLabelsEmbed(labels) {
        return labels.map(label => (label.name || "Unnamed Lavel") + ", Color: " + Util.capFirst(label.color || "No Color"));
      },
      attachments(atchmts) {
        return atchmts.map(atchmt => atchmt.url);
      },
      members(members) {
        return members.map(member => member.fullName);
      },
      stickers(stickers) {
        var arr = [];
        for (var a in stickers) {
          if (!StickerEmojis[stickers[a].image]) return;
          arr.push(StickerEmojis[stickers[a].image]);
        }
        var obj = {};
        for (var i = 0, j = arr.length; i < j; i++) {
          obj[arr[i]] = (obj[arr[i]] || 0) + 1;
        }
        var obj2 = [];
        for (var emoji in obj) {
          amt = obj[emoji];
          obj2.push(emoji + " " + amt);
        }
        return obj2;
      }
    },
    filter(text) {
      return text.toString().replace(client.apiKey, "🔑").replace(client.apiToken, "🔶");
    },
    async filterStatus(res) {
      switch (res.status) {
        case 404:
          throw "Not Found";
        case 400:
          throw "Bad Request";
        case 401:
          throw "Unauthorized";
        case 422:
          throw "Unprocessable Entity";
        case 419:
          throw "Ratelimited";
        case 200:
          return;
        case 500:
          throw "Server Error";
        default:
          return "unknown";
      }
    },
    sendError(message, e) {
      message.channel.stopTyping();
      if (e.errorCode) return Util.sendWebError(message, e);
      client.log("Command Error:\n", e);
      message.channel.send(`Error! Report in the Support Server listed in \`${client.config.prefix}help\`!\n\`\`\`js\n${Util.filter(e.stack)}\`\`\``);
    },
    sendWebError(message, e) {
      switch (e.errorCode) {
        case "err":
          console.log("Web Error:\n", e);
          message.channel.send(`There was an error processing that command! Report in the Support Server listed in \`${client.config.prefix}help\`!\n\`${Util.filter(e.err.text)}\``);
          break;
        case "statusfail":
          console.log("Web Status Fail:\n", e);
          message.channel.send(`I could not do that! \`${e.response.status}: ${e.errorText}\``);
          break;
        default:
          if (e.stack) {
            message.channel.send(`Error! Report in the Support Server listed in \`${client.config.prefix}help\`!\n\`\`\`js\n${Util.filter(e.stack)}\`\`\``);
          } else {
            message.channel.send(`UNKNOWN ERR, CHECK CONSOLE`);
            console.log(e);
          }
          break;
      }
    },
    rInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    capFirst(str) {
      return str[0].toUpperCase() + str.slice(1);
    },
    checkPerm(user, server) {
      if (server.owner.user.id == user.id || client.config.elevated.includes(user.id)) return true;
      return server.member(user).roles.array().map(r => r.name.toLowerCase().startsWith("trello")).includes(true);
    },
    titleCase(str) {
      words = str.toLowerCase().split(" ");

      for (var i = 0; i < words.length; i++) {
        var letters = words[i].split("");
        letters[0] = letters[0].toUpperCase();
        words[i] = letters.join("");
      }
      return words.join(" ");
    },
    toHHMMSS(str) {
      var sec_num = parseInt(str, 10); // don't forget the second param
      var hours = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
      var seconds = sec_num - (hours * 3600) - (minutes * 60);

      if (hours < 10) {
        hours = "0" + hours;
      }
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      var time = hours + ":" + minutes + ":" + seconds;
      return time;
    },
    splitArray(array, chunk) {
      let finalarray = [];
      let i, j, temparray;
      for (i = 0, j = array.length; i < j; i += chunk) {
        temparray = array.slice(i, i + chunk);
        finalarray.push(temparray);
      }
      return finalarray;
    },
    pageNumber(ipp, count, page = 1) {
      let p = 1;
      let max = Math.ceil(count / ipp);
      if (Number(page)) {
        p = Number(page);
        if (p < 1) p = 1;
        if (p > max) p = max;
      }
      return [p, max];
    },
    qSearch(items, item, key = "name") {
      return fuzzy.filter(item, items, {
        extract: el => el[key]
      }).map(el => el.original);
    },
    keyValueForEach(obj, f) {
      Object.keys(obj).map(o => {
        f(o, obj[o]);
      });
    },
    async query(cxtMessage, items, query, key = undefined, displayItem = undefined, promptText = undefined) {
      let results = Util.qSearch(items, query, key);
      let result = null;
      if (results.length == 1)
        result = results[0];
      else if (results.length > 1) {
        let promptResult = await client.prompt(cxtMessage, results, displayItem, promptText);
        if (promptResult === null) return { quit: true };
        result = promptResult;
      }
      return { results, result };
    },
    linkList(array) {
      return array.reduce((acc, value) => `${acc}  • **<${value}>**\n`, "");
    },
    async getBoardId(user, input) {
      if (!input.startsWith) return null;

      let { boards = [] } = await client.trello.get.boards(user.trelloToken, user.trelloID);
      const board = boards.find(board => input.startsWith(board.shortLink) || input.startsWith(board.shortUrl));

      if (board === undefined) return null;
      return board.shortLink;
    },
    getCardId(...args) {
      return this.getBoardId(...args);
    }
  };
  return Util;
};
