// The config for the webserver
module.exports = {
  // [number] The port the webserver will be on
  port: 6781,
  // [string] The URL the webserver is hosted on (e.g. https://webhooks.example.com/)
  // The base MUST END WITH A SLASH
  base: "",
  // [boolean] Whether to start the webserver on this instance
  enabled: true,
  // [Array<string>] The whitelisted IPs able to post to the webhook
  // Note: Express often prefixes these IPs with "::ffff:"
  whitelistedIPs: []
};