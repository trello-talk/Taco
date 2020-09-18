const Command = require('../../structures/Command');
const SubMenu = require('../../structures/SubMenu');
const MultiSelect = require('../../structures/MultiSelect');
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
      response: await trello.getBoard(userData.currentBoard),
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
        // Member management
        names: ['member', 'm'],
        title: _('cards.menu.member') + ` (${_.toLocaleString(json.members.length)})`,
        exec: this.manageMembers.bind(this, userData, json, boardJson, trello, message, _)
      },
      boardJson.labels.length ? {
        // Label management
        names: ['label', 'lb'],
        title: _('cards.menu.label') + ` (${_.toLocaleString(json.labels.length)})`,
        exec: this.manageLabels.bind(this, json, boardJson, trello, message, _)
      } : null,
      {
        // Move to a different list
        names: ['move', 'mv'],
        title: _('cards.menu.move'),
        async exec(client) {
          const list = await Util.Trello.findList(args[2],
            boardJson.lists.filter(list => !list.closed), client, message, _);
          if (!list) return;

          if (list.id === json.idList)
            return message.channel.createMessage(_('cards.same_list_move'));

          if ((await trello.handleResponse({
            response: await trello.updateCard(json.id, { idList: list.id, pos: 'top' }),
            client, message, _ })).stop) return;
          return message.channel.createMessage(_('cards.move', {
            list: Util.cutoffText(Util.Escape.markdown(list.name), 50),
            card: Util.cutoffText(Util.Escape.markdown(json.name), 50)
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
      },
      ...(json.due ?
        [
          {
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
          },
          {
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
          }
        ] : []
      ),
      json.desc ? {
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
      } : null,
      {
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
      },
      json.attachments.length ? {
        // Edit Attachments
        names: ['attachments', 'atch'],
        title: _('cards.menu.attachments') + ` (${_.toLocaleString(json.attachments.length)})`,
        exec: this.editAttachments.bind(this, args, json, trello, message, _)
      } : null
    ];

    return menu.start(message.channel.id, message.author.id, args[1], menuOpts.filter(v => !!v));
  }

  async manageLabels(card, board, trello, message, _) {
    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const checkEmoji = emojiFallback('632444546684551183', '☑️');
    const uncheckEmoji = emojiFallback('632444550115491910', '⬜');

    const selector = new MultiSelect(this.client, message, {
      path: 'value', checkEmoji, uncheckEmoji
    }, {
      items: board.labels.map(label => ({ ...label, value: card.labels.find(lb => lb.id === label.id) })),
      itemTitle: 'words.label.many',
      _, display: (item) => `${
        Util.cutoffText(Util.Escape.markdown(item.name), 25)}${item.color ?
        ` \`${_(`trello.label_color.${item.color}`)}\` ` :
        ''}`
    });
    const newLabels = await selector.start(message.channel.id, message.author.id);
    if (!newLabels) return;

    if ((await trello.handleResponse({
      response: await trello.updateCard(card.id,
        { idLabels: newLabels.filter(lb => lb.value).map(lb => lb.id).join(',') }),
      client: this.client, message, _ })).stop) return;

    return message.channel.createMessage(_('cards.labels_updated', {
      name: Util.cutoffText(Util.Escape.markdown(card.name), 50)
    }));
  }

  async manageMembers(userData, card, board, trello, message, _) {
    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const checkEmoji = emojiFallback('632444546684551183', '☑️');
    const uncheckEmoji = emojiFallback('632444550115491910', '⬜');

    const selector = new MultiSelect(this.client, message, {
      path: 'value', checkEmoji, uncheckEmoji
    }, {
      items: board.members.map(
        member => ({ ...member, value: card.members.find(mbr => mbr.id === member.id) })),
      itemTitle: 'words.member.many',
      _, display: member => {
        const result = `${Util.cutoffText(Util.Escape.markdown(member.fullName),
          50)} (${member.username})`;
        return member.id === userData.trelloID ? `**${result}**` : result;
      }
    });
    const newMembers = await selector.start(message.channel.id, message.author.id);
    if (!newMembers) return;

    if ((await trello.handleResponse({
      response: await trello.updateCard(card.id,
        { idMembers: newMembers.filter(mbr => mbr.value).map(mbr => mbr.id).join(',') }),
      client: this.client, message, _ })).stop) return;

    return message.channel.createMessage(_('cards.members_updated', {
      name: Util.cutoffText(Util.Escape.markdown(card.name), 50)
    }));
  }

  async editAttachments(args, card, trello, message, _) {
    const attachment = await Util.Trello.findAttachment(args[2], card.attachments, this.client, message, _);
    if (!attachment) return;

    const menu = new SubMenu(this.client, message, {
      header: `**${_('words.attachment.one')}:** ${
        Util.cutoffText(Util.Escape.markdown(attachment.name), 25)}\n\n` +
        _('attachments.wywtd'), itemTitle: 'words.subcmd.many', _ });
    return menu.start(message.channel.id, message.author.id, args[3], [
      {
        // Name
        names: ['name', 'rename'],
        title: _('attachments.menu.name'),
        async exec(client) {
          const input = args[4] || await client.messageAwaiter.getInput(message, _, {
            header: _('attachments.input_name')
          });
          if (!input) return;
          if ((await trello.handleResponse({
            response: await trello.updateAttachment(card.id, attachment.id, { name: input }),
            client, message, _ })).stop) return;
          return message.channel.createMessage(_('attachments.set_name', {
            old: Util.cutoffText(Util.Escape.markdown(attachment.name), 50),
            new: Util.cutoffText(Util.Escape.markdown(input), 50)
          }));
        }
      },
      card.idAttachmentCover !== attachment.id &&
        attachment.url.startsWith(Util.Constants.IMAGE_ATTACHMENT_HOST) ? {
        // Cover
          names: ['cover', 'setcover'],
          title: _('attachments.menu.cover'),
          async exec(client) {
            if ((await trello.handleResponse({
              response: await trello.updateCard(card.id, { idAttachmentCover: attachment.id }),
              client, message, _ })).stop) return;
            
            return message.channel.createMessage(
              _('attachments.set_cover', {
                attachment: Util.cutoffText(Util.Escape.markdown(attachment.name), 50),
                card: Util.cutoffText(Util.Escape.markdown(card.name), 50)
              }));
          },
        } : null,
      {
        // Delete
        names: ['delete', 'remove'],
        title: _('attachments.menu.delete'),
        async exec(client) {
          if (!await client.messageAwaiter.confirm(message, _, {
            header: _('cards.remove_confirm', {
              name: Util.cutoffText(Util.Escape.markdown(attachment.name), 50),
              id: attachment.id
            })
          })) return;

          if ((await trello.handleResponse({
            response: await trello.deleteAttachment(card.id, attachment.id),
            client: this.client, message, _ })).stop) return;

          return message.channel.createMessage(_('attachments.removed', {
            name: Util.cutoffText(Util.Escape.markdown(attachment.name), 50)
          }));
        },
      }
    ].filter(v => !!v));
  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};