const fs = require("fs");
const M = require("./mustache.js");

class LocaleHandler {
  constructor(client, path) {
    this._f = [];
    this._path = path;
    this.client = client;
  }
  get f() {
    return this._f;
  }
  get path() {
    return this._path;
  }
  load(debug) {
    return new Promise((resolve, reject) => {
      this._f = [];
      try {
        let files = fs.readdirSync(this._path);
        files.map(file => {
          if (file.endsWith(".json")) {
            try {
              if (debug) {
                console.log(require.cache[require.resolve(this._path + "/" + file)]);
              }
              delete require.cache[require.resolve(this._path + "/" + file)];
              this._f[file.slice(0, -5).replace("_", "-")] = require(this._path + "/" + file);
              this._f[file.slice(0, -5).replace("_", "-")].Name = file.slice(0, -5);
            } catch (e) {
              reject(e);
            }
          }
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
  createModule(locale = "en-US", prefix = this.client.config.prefix) {
    if (!locale) locale = "en-US";
    let _ = (string, params) => {
      let lobj = this._f[locale];
      let backup = this._f["en-US"];
      if (!lobj) lobj = backup;
      if (!params) params = {};
      if (!params.prefix) params.prefix = prefix;
      if (!backup[string]) throw new Error(`No string named '${string}' was found in the source translation.`);
      return M.render(lobj[string] || backup[string], params);
    };
    _.locale = locale;
    _.valid = string => {
      let lobj = this._f[locale];
      let backup = this._f["en-US"];
      if (!lobj) lobj = backup;
      if (!backup[string]) return false;
      return lobj[string] || backup[string];
    };

    return _;
  }

  render(locale, string, params) {
    let lobj = this._f[locale];
    let backup = this._f["en-US"];
    if (!lobj) lobj = backup;
    if (!params) params = {};
    if (!backup[string]) throw new Error(`No string named '${string}' was found in the source translation.`);
    return M.render(lobj[string] || backup[string], params);
  }
}

module.exports = LocaleHandler;