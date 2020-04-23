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

const fs = require('fs');
const M = require('mustache');
const path = require('path');
const logger = require('./logger')('[LOCALE]');
const reload = require('require-reload')(require);
const lodash = require('lodash');

class LocaleHandler {
  constructor(client, cPath, debug) {
    this.locales = new Map();
    this.path = path.resolve(cPath);
    this.debug = debug;
    this.logger = logger;
    this.config = client.config;
  }

  iterateFolder(folderPath) {
    const files = fs.readdirSync(folderPath);
    files.map(file => {
      const filePath = path.join(folderPath, file);
      const stat = fs.lstatSync(filePath);
      if (stat.isSymbolicLink()) {
        const realPath = fs.readlinkSync(filePath);
        if (stat.isFile() && file.endsWith('.json')) {
          this.load(realPath);
        } else if (stat.isDirectory()) {
          this.iterateFolder(realPath);
        }
      } else if (stat.isFile() && file.endsWith('.json'))
        this.load(filePath);
      else if (stat.isDirectory())
        this.iterateFolder(filePath);
    });
  }

  load(filePath) {
    logger.info('Loading locale', filePath);
    const json = reload(filePath);
    this.locales.set(path.parse(filePath).name, json);
  }

  reload() {
    this.locales.clear();
    this.iterateFolder(this.path);
  }

  createModule(locale, prefix){
    const _ = (string, params = {}) => {
      const localeJSON = this.locales.get(locale);
      const source = this.locales.get(this.config.sourceLocale);
      const localeBase = localeJSON ? lodash.defaultsDeep(localeJSON, source) : source;
      const localeString = lodash.get(localeBase, string);
      if (!params.prefix) params.prefix = prefix;
      if (!localeString)
        throw new Error(`No string named '${string}' was found in the source translation.`);
      return M.render(localeString, params);
    };

    _.valid = string => {
      const localeJSON = this.locales.get(locale);
      const source = this.locales.get(this.config.sourceLocale);
      const localeBase = localeJSON ? lodash.defaultsDeep(localeJSON, source) : source;
      const localeString = lodash.get(localeBase, string);
      return !!localeString;
    };

    _.toLocaleString = number =>
      number.toLocaleString((locale || this.config.sourceLocale).replace('_', '-'));

    _.locale = locale;

    return _;
  }
}

module.exports = LocaleHandler;