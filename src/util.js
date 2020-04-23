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

exports.keyValueForEach = (obj, func) => Object.keys(obj).map(key => func(key, obj[key]));

exports.sliceKeys = (obj, f) => {
  const newObject = {};
  exports.keyValueForEach(obj, (k, v) => {
    if (f(k, v)) newObject[k] = v;
  });
  return newObject;
};

exports.toHHMMSS = string => {
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

exports.formatNumber = num => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

// https://stackoverflow.com/a/19101235/6467130
exports.flattenObject = (data) => {
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

exports.Random = {
  int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  bool() {
    return exports.Random.int(0, 1) === 1;
  },
  array(array) {
    return array[exports.Random.int(0, array.length - 1)];
  },
  shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  },
};

exports.Prefix = {
  regex(client, prefixes = null) {
    if (!prefixes)
      prefixes = client.config.prefixes;
    return new RegExp(`^((?:<@!?${client.user.id}>|${
      prefixes.map(prefix => exports.Escape.regex(prefix)).join('|')})\\s?)(\\n|.)`, 'i');
  },
  strip(message, client, prefixes) {
    return message.content.replace(
      exports.Prefix.regex(client, prefixes), '$2').replace(/\s\s+/g, ' ').trim();
  },
};

exports.Regex = {
  escape: /[-/\\^$*+?.()|[\]{}]/g,
  url: /https?:\/\/(-\.)?([^\s/?.#-]+\.?)+(\/[^\s]*)?/gi,
};

exports.Escape = {
  regex(s) {
    return s.replace(exports.Regex.escape, '\\$&');
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
          return exports.Escape.markdown(subString, {
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
          return exports.Escape.markdown(subString, {
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
    if (inlineCode) text = exports.Escape.inlineCode(text);
    if (codeBlock) text = exports.Escape.codeBlock(text);
    if (italic) text = exports.Escape.italic(text);
    if (bold) text = exports.Escape.bold(text);
    if (underline) text = exports.Escape.underline(text);
    if (strikethrough) text = exports.Escape.strikethrough(text);
    if (spoiler) text = exports.Escape.spoiler(text);
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