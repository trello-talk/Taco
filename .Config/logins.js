module.exports = {
  // [Object] Trello config
  trello: {
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
  // [Object] InfluxDB config
  influx: {
    // [boolean] Whether or not to post statistics to influx
    enabled: false,
    // [boolean] Whether or not to post system information on this process
    sendSysInfo: true,
    // [string] the bot tag to add to all measurements
    botTag: 'taco',
    // [string] the cluster tag to add to all measurements
    clusterTag: 'main',
    // [Object] InfluxDB options (https://node-influx.github.io/class/src/index.js~InfluxDB.html#instance-constructor-constructor)
    options: {
      database: 'trello',
      host: 'localhost',
      port: 8086,
      username: 'root',
      password: '',
    }
  },
};
