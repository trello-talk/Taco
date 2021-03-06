exports.name = 'UPDATE_CUSTOM_FIELD_NAME';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.customfield_rename', {
        member: data.invoker.webhookSafeName,
        customField: data.util.cutoffText(data.customField.name, 50),
        oldName: data.util.cutoffText(data.oldData.name, 50)
      }),
      description: '',
    },
    small: {
      description: _('webhooks.customfield_rename', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        customField: data.util.cutoffText(data.customField.name, 25),
        oldName: data.util.cutoffText(data.oldData.name, 25)
      }),
    }
  });
};