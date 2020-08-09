exports.name = 'UPDATE_LIST_NAME';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.list_rename', {
      member: data.invoker.webhookSafeName,
      list: data.util.cutoffText(data.list.name, 50),
      oldName: data.util.cutoffText(data.oldData.name, 50)
    }),
    description: data.embedDescription(['list']),
  });
};