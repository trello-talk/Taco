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

class StringIterator {
  constructor(string) {
    this.string = string;
    this.index = 0;
    this.previous = 0;
    this.end = string.length;
  }

  get() {
    const nextChar = this.string[this.index];
    if (!nextChar)
      return nextChar;
    else {
      this.previous += this.index;
      this.index += 1;
      return nextChar;
    }
  }

  undo() {
    this.index = this.previous;
  }

  get prevChar() {
    return this.string[this.previous];
  }

  get inEOF() {
    return this.index >= this.end;
  }
}

class ArgumentInterpreter {
  constructor(string, { allowWhitespace = false } = {}) {
    this.string = string;
    this.allowWhitespace = allowWhitespace;
  }

  parseAsStrings() {
    const args = [];
    let currentWord = '';
    let quotedWord = '';
    const string = this.allowWhitespace ? this.string : this.string.trim();
    const iterator = new StringIterator(string);
    while (!iterator.inEOF) {
      const char = iterator.get();
      if (char === undefined) break;

      if (this.isOpeningQuote(char) && iterator.prevChar !== '\\') {
        currentWord += char;
        const closingQuote = ArgumentInterpreter.QUOTES[char];

        // Quote iteration
        while (!iterator.inEOF) {
          const quotedChar = iterator.get();

          // Unexpected EOF
          if (quotedChar === undefined) {
            args.push(...currentWord.split(' '));
            break;
          }

          if (quotedChar == '\\') {
            currentWord += quotedChar;
            const nextChar = iterator.get();

            if (nextChar === undefined) {
              args.push(...currentWord.split(' '));
              break;
            }

            currentWord += nextChar;
            // Escaped quote
            if (ArgumentInterpreter.ALL_QUOTES.includes(nextChar)) {
              quotedWord += nextChar;
            } else {
              // Ignore escape
              quotedWord += quotedChar + nextChar;
            }
            continue;
          }

          // Closing quote
          if (quotedChar == closingQuote) {
            currentWord = '';
            args.push(quotedWord);
            quotedWord = '';
            break;
          }
 
          currentWord += quotedChar;
          quotedWord += quotedChar;
        }
        continue;
      }

      if (/^\s$/.test(char)) {
        if (currentWord)
          args.push(currentWord);
        currentWord = '';
        continue;
      }

      currentWord += char;
    }

    if (currentWord.length)
      args.push(...currentWord.split(' '));
    return args;
  }

  isOpeningQuote(char) {
    return Object.keys(ArgumentInterpreter.QUOTES).includes(char);
  }
}

// Opening / Closing
ArgumentInterpreter.QUOTES = {
  '"': '"',
  '‘': '’',
  '‚': '‛',
  '“': '”',
  '„': '‟',
  '⹂': '⹂',
  '「': '」',
  '『': '』',
  '〝': '〞',
  '﹁': '﹂',
  '﹃': '﹄',
  '＂': '＂',
  '｢': '｣',
  '«': '»',
  '‹': '›',
  '《': '》',
  '〈': '〉',
};

ArgumentInterpreter.ALL_QUOTES = Object.keys(ArgumentInterpreter.QUOTES)
  .map(i => ArgumentInterpreter.QUOTES[i])
  .concat(Object.keys(ArgumentInterpreter.QUOTES));

ArgumentInterpreter.StringIterator = StringIterator;

module.exports = ArgumentInterpreter;