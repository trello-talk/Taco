exports.name = 'UPDATE_BOARD_DESC';

exports.exec = async data => {
  const _ = data.localeModule;
  const title = !data.oldData.desc ? 'webhooks.add_board_desc' :
    (!data.board.desc ? 'webhooks.rem_board_desc' : 'webhooks.edit_board_desc');
  return data.send({
    default: {
      title: _(title, {
        member: data.invoker.webhookSafeName,
        board: data.util.cutoffText(data.board.name, 50)
      }),
      description: '',
      fields: [{
        name: '*' + _('trello.old_desc') + '*',
        value: data.util.cutoffText(data.oldData.desc, 1024),
        inline: true
      }, {
        name: '*' + _('trello.new_desc') + '*',
        value: data.util.cutoffText(data.board.desc, 1024),
        inline: true
      }].filter(v => !!v.value)
    },
    small: {
      description: _(title, {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        board: data.util.cutoffText(data.board.name, 50)
      }),
      fields: [{
        name: '*' + _('trello.old_desc') + '*',
        value: data.util.cutoffText(data.oldData.desc, 1024),
        inline: true
      }, {
        name: '*' + _('trello.new_desc') + '*',
        value: data.util.cutoffText(data.board.desc, 1024),
        inline: true
      }].filter(v => !!v.value)
    }
  });
};