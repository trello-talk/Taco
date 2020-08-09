exports.name = 'UPDATE_CARD_DUE';

exports.exec = async data => {
  const _ = data.localeModule;
  const changedKey = Object.keys(data.oldData)[0];
  if (changedKey === 'due') {
    const title = !data.oldData.due ? 'webhooks.due_add' :
      (!data.card.due ? 'webhooks.due_remove' : 'webhooks.due_change');
    const oldDue = _.moment(data.oldData.due);
    const newDue = _.moment(data.card.due);
    return data.send({
      title: _(title, {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list']),
      fields: [data.oldData.due ? {
        name: '*' + _('trello.old_due') + '*',
        value: `${oldDue.format('LLLL')} *(${oldDue.fromNow()})*`,
        inline: true
      } : null, data.card.due ? {
        name: '*' + _('trello.new_due') + '*',
        value: `${newDue.format('LLLL')} *(${newDue.fromNow()})*`,
        inline: true
      } : null].filter(v => !!v)
    });
  } else if (changedKey === 'dueComplete')
    return data.send({
      title: _(data.card.dueComplete ? 'webhooks.due_on' : 'webhooks.due_off', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list'])
    });
};