const Command = require('../../structures/Command');
const GenericPrompt = require('../../structures/GenericPrompt');
const SubMenu = require('../../structures/SubMenu');
const Util = require('../../util');

module.exports = class EditBoard extends Command {
  get name() { return 'editboard'; }

  get _options() { return {
    aliases: ['eboard', 'eb'],
    cooldown: 10,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getBoard(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (await Util.Trello.ensureBoard(handle, message, _)) return;

    const json = handle.body;
    const membership = json.memberships.find(ms => ms.idMember === userData.trelloID);
    const menu = new SubMenu(this.client, message, {
      header: `**${_('words.board.one')}:** ${
        Util.cutoffText(Util.Escape.markdown(json.name), 50)} (\`${json.shortLink}\`)\n` +
        `**${_('words.member_type.one')}:** ${_(`trello.member_type.${membership.memberType}`)}\n\n` +
        _('boards.wywtd'), itemTitle: 'words.subcmd.many', _ });
    const menuOpts = [
      {
        // Description
        names: ['desc', 'description'],
        title: _('boards.menu.desc'),
        async exec(client) {
          const input = args[1] || await client.messageAwaiter.getInput(message, _, {
            header: _('boards.input_desc')
          });
          if (!input) return;
          if ((await trello.handleResponse({
            response: await trello.updateBoard(json.id, { desc: input }),
            client, message, _ })).stop) return;
          return message.channel.createMessage(_('boards.set_desc', {
            name: Util.cutoffText(Util.Escape.markdown(json.name), 50)
          }));
        }
      }
    ];
    const _this = this;

    if (json.desc)
      menuOpts.push({
        // Remove Description
        names: ['removedesc', 'removedescription', 'rdesc'],
        title: _('boards.menu.remove_desc'),
        async exec(client) {
          if ((await trello.handleResponse({
            response: await trello.updateBoard(json.id, { desc: '' }),
            client, message, _ })).stop) return;
          return message.channel.createMessage(_('boards.removed_desc', {
            name: Util.cutoffText(Util.Escape.markdown(json.name), 50)
          }));
        }
      });
    
    if (membership.memberType === 'admin') {
      menuOpts.unshift({
        // Archive/Unarchive
        names: ['archive', 'unarchive', 'open', 'close'],
        title: _(json.closed ? 'boards.menu.archive_off' : 'boards.menu.archive_on'),
        async exec(client) {
          const handle = await trello.handleResponse({
            response: await trello.updateBoard(json.id, { closed: !json.closed }),
            client, message, _ });
          if (handle.body === 'unauthorized permission requested')
            return message.channel.createMessage(_('boards.need_admin'));

          return message.channel.createMessage(
            _(json.closed ? 'boards.unarchived' : 'boards.archived', {
              name: Util.cutoffText(Util.Escape.markdown(json.name), 50)
            }));
        }
      });
      menuOpts.unshift({
        // Name
        names: ['name', 'rename'],
        title: _('boards.menu.name'),
        async exec(client) {
          const input = args[1] || await client.messageAwaiter.getInput(message, _, {
            header: _('boards.input_name')
          });
          if (!input) return;

          const handle = await trello.handleResponse({
            response: await trello.updateBoard(json.id, { name: input }),
            client, message, _ });
          if (handle.body === 'unauthorized permission requested')
            return message.channel.createMessage(_('boards.need_admin'));

          return message.channel.createMessage(_('boards.set_name', {
            old: Util.cutoffText(Util.Escape.markdown(json.name), 50),
            new: Util.cutoffText(Util.Escape.markdown(input), 50)
          }));
        }
      });
      menuOpts.push({
        // Comment Perms
        names: ['comment', 'commentperms', 'com', 'comperms'],
        title: _('boards.menu.comment', { value: _(`trello.comment_perms.${json.prefs.comments}`) }),
        exec() {
          return _this.changePerms('comment_perms',
            { args, _, trello, client: _this.client, message, board: json });
        }
      });
      menuOpts.push({
        // Vote Perms
        names: ['vote', 'voteperms'],
        title: _('boards.menu.vote', { value: _(`trello.vote_perms.${json.prefs.voting}`) }),
        exec() {
          return _this.changePerms('vote_perms',
            { args, _, trello, client: _this.client, message, board: json });
        }
      });
      menuOpts.push({
        // Invite Perms
        names: ['inviteperms'],
        title: _('boards.menu.invite', { value: _(`trello.invite_perms.${json.prefs.invitations}`) }),
        exec() {
          return _this.changePerms('invite_perms',
            { args, _, trello, client: _this.client, message, board: json });
        }
      });
    }

    return menu.start(message.channel.id, message.author.id, args[0], menuOpts);
  }

  async changePerms(type, { args, _, trello, message, client, board }) {
    const permOpts = {
      comment_perms: [
        'disabled',
        'members',
        (board.organization ? 'org' : null),
        'public'
      ].filter(v => !!v),
      vote_perms: [
        'members',
        (board.organization ? 'org' : null),
        'public'
      ].filter(v => !!v),
      invite_perms: [
        'admins',
        'members'
      ]
    };
    const fields = {
      comment_perms: 'prefs/comments',
      vote_perms: 'prefs/voting',
      invite_perms: 'prefs/invitations'
    };

    let result = args[1];

    if (!permOpts[type].includes(result)) {
      const prompter = new GenericPrompt(client, message, {
        items: permOpts[type], itemTitle: 'words.opt.many',
        display: perm => _(`trello.${type}.${perm}`), _
      });
      result = await prompter.search(args[1],
        { channelID: message.channel.id, userID: message.author.id });
      if (!result) return;
    }

    const handle = await trello.handleResponse({
      response: await trello.updateBoard(board.id, { [fields[type]]: result }),
      client, message, _ });
    if (handle.body === 'unauthorized permission requested')
      return message.channel.createMessage(_('boards.need_admin'));

    return message.channel.createMessage(_(`boards.set_${type}`, {
      value: _(`trello.${type}.${result}`)
    }));
  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};