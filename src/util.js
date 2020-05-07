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

/**
 * Represents the utilities for the bot
 * @typedef {Object} Util
 */
const Util = module.exports = {};

/**
 * Iterates through each key of an object
 * @memberof Util.
 */
Util.keyValueForEach = (obj, func) => Object.keys(obj).map(key => func(key, obj[key]));

/**
 * @memberof Util.
 * @deprecated
 */
Util.sliceKeys = (obj, f) => {
  const newObject = {};
  Util.keyValueForEach(obj, (k, v) => {
    if (f(k, v)) newObject[k] = v;
  });
  return newObject;
};

/**
 * Converts a number into a 00:00:00 format
 * @memberof Util.
 */
Util.toHHMMSS = string => {
  const sec_num = parseInt(string, 10);
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  let seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours < 10) {hours = '0' + hours;}
  if (minutes < 10) {minutes = '0' + minutes;}
  if (seconds < 10) {seconds = '0' + seconds;}
  const time = hours + ':' + minutes + ':' + seconds;
  return time;
};

/**
 * @memberof Util.
 * @deprecated
 */
Util.formatNumber = num => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

/**
 * Flattens a JSON object
 * @memberof Util.
 * @see https://stackoverflow.com/a/19101235/6467130
 */
Util.flattenObject = (data) => {
  const result = {};
  function recurse (cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      const l = cur.length;
      for (let i = 0; i < l; i++)
        recurse(cur[i], prop + '[' + i + ']');
      if (l == 0)
        result[prop] = [];
    } else {
      let isEmpty = true;
      for (const p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + '.' + p : p);
      }
      if (isEmpty && prop)
        result[prop] = {};
    }
  }
  recurse(data, '');
  return result;
};

/**
 * Randomness generator
 * @memberof Util.
 */
Util.Random = {
  int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  bool() {
    return Util.Random.int(0, 1) === 1;
  },
  array(array) {
    return array[Util.Random.int(0, array.length - 1)];
  },
  shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  },
};

/**
 * Prefix-related functions
 * @memberof Util.
 */
Util.Prefix = {
  regex(client, prefixes = null) {
    if (!prefixes)
      prefixes = client.config.prefixes;
    return new RegExp(`^((?:<@!?${client.user.id}>|${
      prefixes.map(prefix => Util.Escape.regex(prefix)).join('|')})\\s?)(\\n|.)`, 'i');
  },
  strip(message, client, prefixes) {
    return message.content.replace(
      Util.Prefix.regex(client, prefixes), '$2').replace(/\s\s+/g, ' ').trim();
  },
};

/**
 * Commonly used regex patterns
 * @memberof Util.
 * @deprecated
 */
Util.Regex = {
  escape: /[-/\\^$*+?.()|[\]{}]/g,
  url: /https?:\/\/(-\.)?([^\s/?.#-]+\.?)+(\/[^\s]*)?/gi,
};
  
/**
 * Discord.JS's method of escaping characters
 * @memberof Util.
 * @see https://github.com/discordjs/discord.js/blob/12.0.0/src/util/Util.js#L97
 */
Util.Escape = {
  regex(s) {
    return s.replace(Util.Regex.escape, '\\$&');
  },
  markdown(
    text,
    {
      codeBlock = true,
      inlineCode = true,
      bold = true,
      italic = true,
      underline = true,
      strikethrough = true,
      spoiler = true,
      codeBlockContent = true,
      inlineCodeContent = true,
    } = {},
  ) {
    if (!codeBlockContent) {
      return text
        .split('```')
        .map((subString, index, array) => {
          if (index % 2 && index !== array.length - 1) return subString;
          return Util.Escape.markdown(subString, {
            inlineCode,
            bold,
            italic,
            underline,
            strikethrough,
            spoiler,
            inlineCodeContent,
          });
        })
        .join(codeBlock ? '\\`\\`\\`' : '```');
    }
    if (!inlineCodeContent) {
      return text
        .split(/(?<=^|[^`])`(?=[^`]|$)/g)
        .map((subString, index, array) => {
          if (index % 2 && index !== array.length - 1) return subString;
          return Util.Escape.markdown(subString, {
            codeBlock,
            bold,
            italic,
            underline,
            strikethrough,
            spoiler,
          });
        })
        .join(inlineCode ? '\\`' : '`');
    }
    if (inlineCode) text = Util.Escape.inlineCode(text);
    if (codeBlock) text = Util.Escape.codeBlock(text);
    if (italic) text = Util.Escape.italic(text);
    if (bold) text = Util.Escape.bold(text);
    if (underline) text = Util.Escape.underline(text);
    if (strikethrough) text = Util.Escape.strikethrough(text);
    if (spoiler) text = Util.Escape.spoiler(text);
    return text;
  },
  codeBlock(text) {
    return text.replace(/```/g, '\\`\\`\\`');
  },
  inlineCode(text) {
    return text.replace(/(?<=^|[^`])`(?=[^`]|$)/g, '\\`');
  },
  italic(text) {
    let i = 0;
    text = text.replace(/(?<=^|[^*])\*([^*]|\*\*|$)/g, (_, match) => {
      if (match === '**') return ++i % 2 ? `\\*${match}` : `${match}\\*`;
      return `\\*${match}`;
    });
    i = 0;
    return text.replace(/(?<=^|[^_])_([^_]|__|$)/g, (_, match) => {
      if (match === '__') return ++i % 2 ? `\\_${match}` : `${match}\\_`;
      return `\\_${match}`;
    });
  },
  bold(text) {
    let i = 0;
    return text.replace(/\*\*(\*)?/g, (_, match) => {
      if (match) return ++i % 2 ? `${match}\\*\\*` : `\\*\\*${match}`;
      return '\\*\\*';
    });
  },
  underline(text) {
    let i = 0;
    return text.replace(/__(_)?/g, (_, match) => {
      if (match) return ++i % 2 ? `${match}\\_\\_` : `\\_\\_${match}`;
      return '\\_\\_';
    });
  },
  strikethrough(text) {
    return text.replace(/~~/g, '\\~\\~');
  },
  spoiler(text) {
    return text.replace(/\|\|/g, '\\|\\|');
  },
};

/**
 * Command permission parsers
 * @memberof Util.
 */
Util.CommandPermissions = {
  attach: (client, message) => message.channel.type === 1 ||
    message.channel.permissionsOf(client.user.id).has('attachFiles'),
  embed: (client, message) => message.channel.type === 1 ||
    message.channel.permissionsOf(client.user.id).has('embedLinks'),
  emoji: (client, message) => message.channel.type === 1 ||
    message.channel.permissionsOf(client.user.id).has('externalEmojis'),
  guild: (_, message) => !!message.guildID,
  elevated: (client, message) => client.config.elevated.includes(message.author.id),
  trelloRole: (_, message) => {
    if (!message.guildID) return true;
    
    // Server owner or elevated users
    if (message.channel.guild.ownerID == message.author.id ||
      Util.CommandPermissions.elevated(message.author.id)) return true;
    
    const memberRoles = message.member.roles.map(roleID => message.channel.guild.roles.get(roleID));
    return !!memberRoles.find(role => role.name.toLowerCase() === 'trello');
  },
  auth: (_, __, { userData }) => userData && userData.trelloToken && userData.trelloID,
  selectedBoard: (_, __, { userData }) => userData && userData.currentBoard,
  discordAuth: (_, __, { userData }) => userData && userData.discordToken
};

/**
 * Creates a module that makes emoji fallbacks
 * @memberof Util.
 */
Util.emojiFallback = ({ emojiGuildID = '617911034555924502', message, client }) => {
  return (id, fallback) => {
    if (Util.CommandPermissions.emoji(client, message) && client.guilds.has(emojiGuildID)) {
      const emoji = client.guilds.get(emojiGuildID).emojis.find(e => e.id == id);
      return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
    } else return fallback;
  };
};