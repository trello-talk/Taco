exports.name = 'UPDATE_LABEL_NAME';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.label_rename', {
        member: data.invoker.webhookSafeName,
        label: data.util.cutoffText(data.label.name, 50),
        oldName: data.util.cutoffText(data.oldData.name, 50)
      }),
      description: data.embedDescription(['label']),
    },
    small: {
      description: _('webhooks.label_rename', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        label: data.util.cutoffText(data.label.name, 25),
        oldName: data.util.cutoffText(data.oldData.name, 25)
      }),
    }
  });
};