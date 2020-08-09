exports.name = 'CREATE_LABEL';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.create_label', {
      member: data.invoker.webhookSafeName,
      label: data.util.cutoffText(data.label.name, 50)
    }),
    description: data.embedDescription(['label']),
  });
};