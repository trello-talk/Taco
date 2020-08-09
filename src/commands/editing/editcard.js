const Command = require('../../structures/Command');
const SubMenu = require('../../structures/SubMenu');
const Util = require('../../util');
require('datejs');

module.exports = class EditCard extends Command {
  get name() { return 'editcard'; }

  get _options() { return {
    aliases: ['ecard', 'ec'],
    cooldown: 10,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    // Get all cards for search
    const handle = await trello.handleResponse({
      response: await trello.getSlimBoard(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (Util.Trello.cannotUseBoard(handle)) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return message.channel.createMessage(_('boards.gone'));
    }

    const boardJson = handle.body;

    const card = await Util.Trello.findCard(args[0], boardJson, this.client, message, _);
    if (!card) return;

    // Get specific card data
    const cardHandle = await trello.handleResponse({
      response: await trello.getCard(card.id),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (handle.response.status === 404)
      return message.channel.createMessage(_('cards.error'));

    const json = cardHandle.body;
    const menu = new SubMenu(this.client, message, {
      header: `**${_('words.card.one')}:** ${
        Util.cutoffText(Util.Escape.markdown(json.name), 50)} (\`${json.shortLink}\`)\n\n` +
        _('cards.wywtd'), itemTitle: 'words.subcmd.many', _ });
    const menuOpts = [
      {
        // Name
        names: ['name', 'rename'],
        title: _('cards.menu.name'),
        async exec(client) {
          const input = args[2] || await client.messageAwaiter.getInput(message, _, {
            header: _('cards.input_name')
          });
          if (!input) return;
          if ((await trello.handleResponse({
            response: await trello.updateCard(json.id, { name: input }),
            client, message, _ })).stop) return;
          return message.channel.createMessage(_('cards.set_name', {
            old: Util.cutoffText(Util.Escape.markdown(json.name), 50),
            new: Util.cutoffText(Util.Escape.markdown(input), 50)
          }));
        }
      },
      {
        // Archive/Unarchive
        names: ['archive', 'unarchive', 'open', 'close'],
        title: _(json.closed ? 'cards.menu.archive_off' : 'cards.menu.archive_on'),
        async exec(client) {
          if ((await trello.handleResponse({
            response: await trello.updateCard(json.id, { closed: !json.closed }),
            client, message, _ })).stop) return;
          
          return message.channel.createMessage(
            _(json.closed ? 'cards.unarchived' : 'cards.archived', {
              name: Util.cutoffText(Util.Escape.markdown(json.name), 50)
            }));
        }
      },
      {
        // Description
        names: ['desc', 'description'],
        title: _('cards.menu.desc'),
        async exec(client) {
          const input = args[2] || await client.messageAwaiter.getInput(message, _, {
            header: _('cards.input_desc')
          });
          if (!input) return;
          if ((await trello.handleResponse({
            response: await trello.updateCard(json.id, { desc: input }),
            client, message, _ })).stop) return;
          return message.channel.createMessage(_('cards.set_desc', {
            name: Util.cutoffText(Util.Escape.markdown(json.name), 50)
          }));
        }
      },
      {
        // Set due date
        names: ['due'],
        title: _('cards.menu.due'),
        async exec(client) {
          const input = args[2] || await client.messageAwaiter.getInput(message, _, {
            header: _('cards.input_due')
          });
          if (!input) return;
          const newDue = _.dateJS(Date, input);

          if (!newDue)
            return message.channel.createMessage(_('cards.bad_due'));

          if ((await trello.handleResponse({
            response: await trello.updateCard(json.id, { due: newDue.toISOString() }),
            client, message, _ })).stop) return;
          return message.channel.createMessage(_('cards.set_due', {
            date: _.moment(newDue).format('LLLL')
          }));
        }
      }
    ];

    if (json.due) {
      menuOpts.push({
        // Remove due date
        names: ['removedue', 'rdue'],
        title: _('cards.menu.remove_due'),
        async exec(client) {
          if ((await trello.handleResponse({
            response: await trello.updateCard(json.id, { due: null }),
            client, message, _ })).stop) return;
          return message.channel.createMessage(_('cards.removed_due', {
            name: Util.cutoffText(Util.Escape.markdown(json.name), 50)
          }));
        }
      });
      menuOpts.push({
        // Toggle due complete
        names: ['duecomplete', 'duedone'],
        title: _(json.dueComplete ? 'cards.menu.due_off' : 'cards.menu.due_on'),
        async exec(client) {
          if ((await trello.handleResponse({
            response: await trello.updateCard(json.id, { dueComplete: !json.dueComplete }),
            client, message, _ })).stop) return;
          
          return message.channel.createMessage(
            _(json.dueComplete ? 'cards.due_off' : 'cards.due_on', {
              name: Util.cutoffText(Util.Escape.markdown(json.name), 50)
            }));
        }
      });
    }

    if (json.desc)
      menuOpts.push({
        // Remove Description
        names: ['removedesc', 'removedescription', 'rdesc'],
        title: _('cards.menu.remove_desc'),
        async exec(client) {
          if ((await trello.handleResponse({
            response: await trello.updateCard(json.id, { desc: '' }),
            client, message, _ })).stop) return;
          return message.channel.createMessage(_('cards.removed_desc', {
            name: Util.cutoffText(Util.Escape.markdown(json.name), 50)
          }));
        }
      });

    menuOpts.push({
      // Attach
      names: ['attach'],
      title: _('cards.menu.attach'),
      async exec(client) {
        const input = (message.attachments[0] ? message.attachments[0].url : args[2]) ||
          await client.messageAwaiter.getInputOrAttachment(message, _, {
            header: _('cards.input_attach')
          });
        if (!input) return;

        const match = input.match(Util.Regex.url);
        if (!match)
          return message.channel.createMessage(_('cards.bad_attach'));

        if ((await trello.handleResponse({
          response: await trello.addAttachment(json.id, match[0]),
          client, message, _ })).stop) return;
        return message.channel.createMessage(_('cards.add_attach', {
          name: Util.cutoffText(Util.Escape.markdown(json.name), 50)
        }));
      }
    });

    return menu.start(message.channel.id, message.author.id, args[1], menuOpts);
  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};