exports.name = 'DELETE_LABEL';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.delete_label', {
        member: data.invoker.webhookSafeName,
        labelID: data.label.id
      }),
      description: '',
    },
    small: {
      description: _('webhooks.delete_label', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        labelID: data.label.id
      }),
    }
  });
};