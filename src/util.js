const mustache = require('mustache');
const config = require('config');

exports.keyValueForEach = (obj, func) => Object.keys(obj).map(key => func(key, obj[key]));

exports.sliceKeys = (obj, f) => {
  const newObject = {};
  exports.keyValueForEach(obj, (k, v) => {
    if(f(k, v)) newObject[k] = v;
  });
  return newObject;
};

exports.formatNumber = num => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

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
  prompt(prompts, context) {
    return mustache.render(exports.Random.array(prompts), context);
  },
  id() {
    return Math.random().toString(36).substring(2, 15);
  },
};

exports.Prefix = {
  regex(client, prefixes = config.get('prefixes')) {
    return new RegExp(`^((?:<@!?${client.user.id}>|${prefixes.map(prefix => exports.Escape.regex(prefix)).join('|')})\\s?)(\\n|.)`, 'i');
  },
  strip(message, client, prefixes) {
    return message.content.replace(exports.Prefix.regex(client, prefixes), '$2').replace(/\s\s+/g, ' ').trim();
  },
};

exports.Regex = {
  escape: /[-/\\^$*+?.()|[\]{}]/g,
  url: /https?:\/\/(-\.)?([^\s/?.#-]+\.?)+(\/[^\s]*)?/gi,
  spoiler: /\|\|\s*?([^|]+)\s*?\|\|/gi,
  twitter: /https?:\/\/twitter\.com\/\w+\/status\/(\d{17,19})(?:\/(?:video\/(\d))?)?/,
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