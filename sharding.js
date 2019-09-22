const Discord = require('discord.js')
const chalk = require('chalk')
const config = require('./Config')
const pkg = require('./package.json')

const manager = new Discord.ShardingManager(`${__dirname}/${pkg.main}`, {
  token: config.token,
  totalShards: config.sharding.totalShards
})

const logPrefix = `${chalk.gray('[')}${chalk.yellow('SHARD MASTER')}${chalk.gray(']')}`

manager.on('launch', shard =>  console.log(`${logPrefix} ${shard.id} (${shard.id + 1}/${manager.totalShards}) launched`))
process.on('exit', code => console.log(`${logPrefix} ${chalk.red('Process is forcing a shut down!')} Exit code:`, code))

console.log(`${logPrefix} Starting to spawn shards...`)
manager.spawn(config.sharding.totalShards, config.sharding.delay).then(() => {
  console.log(`${logPrefix} ${chalk.green('Finished launching shards!')}`)
});
