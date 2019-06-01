const fs = require('fs')
const path = require('path')
const Util = require('./Util')

module.exports = class CommandLoader {
  constructor(client, cPath, debug){
    this.commands = new Map()
    this.path = path.resolve(cPath)
    this.debug = debug
    this.client = client
  }

  iterateFolder(folderPath){
    let files = fs.readdirSync(folderPath);
    files.map(file => {
      let filePath = path.join(folderPath, file)
      let stat = fs.lstatSync(filePath)
      if(stat.isSymbolicLink()){
        let realPath = fs.readlinkSync(filePath)
        if(stat.isFile() && file.endsWith('.js')) {
          this.load(realPath)
        }else if(stat.isDirectory()){
          this.iterateFolder(realPath)
        }
      }else if(stat.isFile() && file.endsWith('.js')){
        this.load(filePath)
      }else if(stat.isDirectory()){
        this.iterateFolder(filePath)
      }
    });
  }

  load(path){
    if(this.debug) this.client.log('Loading command', path)
    delete require.cache[require.resolve(path)]
    let cls = require(path)
    let cmd = new cls(this.client)
    cmd.path = path
    this.commands.set(cmd.name, cmd)
  }

  reload(){
    this.commands.clear()
    this.iterateFolder(this.path)
  }

  get(name){
    let cmd = this.getAbs(name) || null
    if(cmd) return cmd
    this.commands.forEach(c => {
      if(c.aliases.includes(name)) cmd = c
    })
    return cmd
  }

  getAbs(name){
    return this.commands.get(name)
  }

  has(name){
    return !!this.get(name)
  }

  preload(name){
    if(!this.has(name)) return
    this.get(name).preload()
  }

  preloadAll(){
    this.commands.forEach(c => c.preload())
  }

  async processCooldown(message, name) {
    if(this.client.elevated(message)) return true
    let command = this.get(name)
    let now = Date.now() - 1
    let cooldown = command.cooldownAbs
    let userCD = await this.client.db.hget(`cooldowns:${message.author.id}`, command.name) || 0
    if(userCD) userCD = parseInt(userCD)
    if(userCD + cooldown > now) return false
    await this.client.db.hset(`cooldowns:${message.author.id}`, command.name, now)
    return true
  }
}