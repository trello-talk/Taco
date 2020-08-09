exports.name = 'UPDATE_LABEL_NAME';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.label_rename', {
      member: data.invoker.webhookSafeName,
      label: data.util.cutoffText(data.label.name, 50),
      oldName: data.util.cutoffText(data.oldData.name, 50)
    }),
    description: data.embedDescription(['label']),
  });
};