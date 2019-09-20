const redis = require("./redis.js");
const rethink = require("./rethink.js");
const links = require("./links.js");
const settings = require("./settings.js");

module.exports = {
    redis,
    rethink,
    ...settings,
    ...links

}
