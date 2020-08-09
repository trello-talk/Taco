exports.name = 'UPDATE_CHECKLIST_NAME';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.checklist_rename', {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50),
      checklist: data.util.cutoffText(data.checklist.name, 50)
    }),
    description: data.embedDescription(['card', 'list', 'checklist']) +
      `\n**${_('trello.one_chklist_name')}:** ${
        data.util.cutoffText(data.util.Escape.markdown(data.oldData.name), 50)}`,
  });
};