exports.name = 'UPDATE_CHECKLIST_NAME';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.checklist_rename', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50),
        checklist: data.util.cutoffText(data.checklist.name, 50)
      }),
      description: data.embedDescription(['card', 'list', 'checklist']) +
        `\n**${_('trello.one_chklist_name')}:** ${
          data.util.cutoffText(data.util.Escape.markdown(data.oldData.name), 50)}`,
    },
    small: {
      description: _('webhooks.checklist_rename', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        card: `[${data.util.cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`,
        checklist: data.util.cutoffText(data.checklist.name, 25)
      }),
    }
  });
};