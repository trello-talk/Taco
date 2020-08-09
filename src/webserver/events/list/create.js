exports.name = 'CREATE_LIST';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.create_list', {
      member: data.invoker.webhookSafeName,
      list: data.util.cutoffText(data.list.name, 50)
    }),
    description: data.embedDescription(['list']),
  });
};