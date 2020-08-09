const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class SetMaxWebhooks extends Command {
  get name() { return 'setmaxwebhooks'; }

  get _options() { return {
    aliases: ['smw', 'smwh'],
    permissions: ['elevated'],
    minimumArgs: 1,
    listed: false,
  }; }

  async exec(message, { args, _ }) {
    const idRegex = /^\d{17,18}$/;
    const targetID = args[0];
    
    if (!idRegex.test(targetID))
      return message.channel.createMessage(_('setmaxwebhooks.invalid'));

    const webhookLimit = parseInt(args[1]) || 5;
    // Create a row if there is none
    await this.client.pg.models.get('server').get({ id: targetID });
    const emojiFallback = Util.emojiFallback({ client: this.client, message });

    await this.client.pg.models.get('server').update({ maxWebhooks: webhookLimit },
      { where: { serverID: targetID } });

    const doneEmoji = emojiFallback('632444546684551183', '✅');
    return message.channel.createMessage(`${doneEmoji} ` +
      _('setmaxwebhooks.set', { serverID: targetID, value: webhookLimit }));
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
