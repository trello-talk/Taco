exports.name = 'UPDATE_CARD_DESC';

exports.exec = async data => {
  const _ = data.localeModule;
  const title = !data.oldData.desc ? 'webhooks.add_card_desc' :
    (!data.card.desc ? 'webhooks.rem_card_desc' : 'webhooks.edit_card_desc');
  return data.send({
    title: _(title, {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50)
    }),
    description: data.embedDescription(['card', 'list']),
    fields: [{
      name: '*' + _('trello.old_desc') + '*',
      value: data.util.cutoffText(data.oldData.desc, 1024),
      inline: true
    }, {
      name: '*' + _('trello.new_desc') + '*',
      value: data.util.cutoffText(data.card.desc, 1024),
      inline: true
    }].filter(v => !!v.value)
  });
};