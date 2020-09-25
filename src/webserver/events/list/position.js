exports.name = 'UPDATE_LIST_POS';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.list_move', {
        member: data.invoker.webhookSafeName,
        list: data.util.cutoffText(data.list.name, 50)
      }),
      description: data.embedDescription(['list']),
    },
    small: {
      description: _('webhooks.list_move', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        list: data.util.cutoffText(data.list.name, 50)
      }),
    }
  });
};