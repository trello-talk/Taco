const general = require("./general.js");
const logins = require("./logins.js");
const links = require("./links.js");
const settings = require("./settings.js");

module.exports = {
    ...general,
    ...logins,
    ...links,
    ...settings
};
