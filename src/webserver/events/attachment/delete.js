exports.name = 'DELETE_ATTACHMENT_FROM_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.unattach_card', {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50),
      attachment: data.util.cutoffText(data.attachment.name, 50)
    }),
    description: data.embedDescription(['card', 'list']),
    image: { url: data.attachment.url }
  });
};