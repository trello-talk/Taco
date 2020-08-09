exports.name = 'UPDATE_CHECKLIST_POS';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.checklist_move', {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50),
      checklist: data.util.cutoffText(data.checklist.name, 50)
    }),
    description: data.embedDescription(['card', 'list', 'checklist']),
  });
};