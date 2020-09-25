exports.name = 'CREATE_LIST';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.create_list', {
        member: data.invoker.webhookSafeName,
        list: data.util.cutoffText(data.list.name, 50)
      }),
      description: data.embedDescription(['list']),
    },
    small: {
      description: _('webhooks.create_list', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        list: data.util.cutoffText(data.list.name, 50)
      }),
    }
  });
};