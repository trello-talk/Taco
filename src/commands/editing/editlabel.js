const Command = require('../../structures/Command');
const SubMenu = require('../../structures/SubMenu');
const GenericPrompt = require('../../structures/GenericPrompt');
const Util = require('../../util');

module.exports = class EditLabel extends Command {
  get name() { return 'editlabel'; }

  get _options() { return {
    aliases: ['elabel', 'elb'],
    cooldown: 10,
    permissions: ['auth', 'selectedBoard']
  }; }

  async findColor(query, message, _) {
    const colors = [
      'none', 'green', 'yellow', 'red', 'orange',
      'lime', 'purple', 'blue', 'sky', 'pink', 'black'
    ];
    const foundColor = colors.find(val => val === query);
    if (foundColor) return foundColor;
    else if (['none', 'clear', 'transparent'].includes(query)) return null;
    else {
      const prompter = new GenericPrompt(this.client, message, {
        items: colors, itemTitle: 'words.color.many',
        header: _('labels.choose_color'),
        display: val => _(`trello.label_color.${val}`),
        _
      });
      const promptResult = await prompter.search(query,
        { channelID: message.channel.id, userID: message.author.id },
        val => _(`trello.label_color.${val}`));
      if (promptResult && promptResult._noresults) {
        await message.channel.createMessage(_('prompt.no_search'));
        return;
      } else
        return promptResult;
    }
  }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getLabels(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (await Util.Trello.ensureBoard(handle, message, _)) return;

    const json = handle.body;
    const label = await Util.Trello.findLabel(args[0], json, this.client, message, _);
    if (!label) return;

    const _this = this;
    const menu = new SubMenu(this.client, message, {
      header: `**${_('words.label.one')}:** ${
        Util.cutoffText(Util.Escape.markdown(label.name), 25)} (\`${label.id}\`)\n` +
        (label.color ? `**${_('words.color.one')}:** ${_(`trello.label_color.${label.color}`)}\n` : '') +
        '\n' + _('labels.wywtd'), itemTitle: 'words.subcmd.many', _ });
    return menu.start(message.channel.id, message.author.id, args[1], [
      {
        // Name
        names: ['name', 'rename'],
        title: _('labels.menu.name'),
        async exec(client) {
          const input = args[2] || await client.messageAwaiter.getInput(message, _, {
            header: _('labels.input_name')
          });
          if (!input) return;
          if ((await trello.handleResponse({
            response: await trello.updateLabel(label.id, { name: input }),
            client, message, _ })).stop) return;
          return message.channel.createMessage(_('labels.set_name', {
            old: Util.cutoffText(Util.Escape.markdown(label.name), 50),
            new: Util.cutoffText(Util.Escape.markdown(input), 50)
          }));
        }
      },
      {
        // Color
        names: ['color', 'recolor', 'colour', 'recolour'],
        title: _('labels.menu.color'),
        async exec(client) {
          let color = await _this.findColor(args[2], message, _);
          if (!color) return;
          if (color === 'none') color = null;

          if ((await trello.handleResponse({
            response: await trello.updateLabel(label.id, { color }),
            client, message, _ })).stop) return;
          
          return message.channel.createMessage(
            _('labels.set_color', {
              label: Util.cutoffText(Util.Escape.markdown(label.name), 50),
              color: _(`trello.label_color.${color || 'none'}`)
            }));
        },
      }
    ]);
  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};