const util = require("util");
const { Faux } = require('faux-core')

const faux = new Faux({ mainDir: __dirname })
faux.start()

process.on("unhandledRejection", e => {
  console.log(util.inspect(e));
});
