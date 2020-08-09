exports.name = 'DELETE_LABEL';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.delete_label', {
      member: data.invoker.webhookSafeName,
      labelID: data.label.id
    }),
    description: '',
  });
};