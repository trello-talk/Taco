exports.name = 'DELETE_CUSTOM_FIELD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.customfield_delete', {
        member: data.invoker.webhookSafeName,
        customField: data.util.cutoffText(data.customField.name, 50)
      }),
      description: '',
    },
    small: {
      description: _('webhooks.customfield_delete', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        customField: data.util.cutoffText(data.customField.name, 50)
      }),
    }
  });
};