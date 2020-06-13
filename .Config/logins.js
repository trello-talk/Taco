module.exports = {
  // [Object] Trello config
  trello: {
    // [string] The trello OAuth secret (https://trello.com/app-key#secret)
    secret: "",
    // [string] The trello API key (https://trello.com/app-key#key)
    key: ""
  },
  // [Object] Redis config
  redis: {
    host: "localhost",
    port: 6379,
    password: "",
    prefix: "trello:"
  },
  // [Object] Postgres config
  pg: {
    user: "postgres",
    host: "127.0.0.1",
    database: "trello",
    password: ""
  },
};
