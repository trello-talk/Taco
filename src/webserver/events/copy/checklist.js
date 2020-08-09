exports.name = 'COPY_CHECKLIST';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.copy_checklist', {
      member: data.invoker.webhookSafeName,
      sourceChecklist: data.util.cutoffText(data.sourceChecklist.name, 50),
      checklist: data.util.cutoffText(data.checklist.name, 50)
    }),
    description: data.embedDescription(['card', 'list', 'checklist']),
  });
};