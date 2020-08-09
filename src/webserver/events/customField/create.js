exports.name = 'CREATE_CUSTOM_FIELD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.customfield_create', {
      member: data.invoker.webhookSafeName,
      customField: data.util.cutoffText(data.customField.name, 50)
    }),
    description: '',
  });
};