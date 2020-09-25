exports.name = 'MOVE_LIST_FROM_BOARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.move_out_list', {
        member: data.invoker.webhookSafeName,
        list: data.util.cutoffText(data.list.name, 50)
      }),
      description: data.embedDescription(['list']) +
        `\n**${_('trello.to_board')}:** \`${data.targetBoard.id}\``,
    },
    small: {
      description: _('webhooks.move_out_list', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        list: data.util.cutoffText(data.list.name, 25)
      }),
    }
  });
};