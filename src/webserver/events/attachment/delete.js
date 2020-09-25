exports.name = 'DELETE_ATTACHMENT_FROM_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.unattach_card', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50),
        attachment: data.util.cutoffText(data.attachment.name, 50)
      }),
      description: data.embedDescription(['card', 'list']),
      image: data.attachment.url.startsWith(data.util.Constants.IMAGE_ATTACHMENT_HOST) ?
        { url: data.attachment.url } : null
    },
    small: {
      description: _('webhooks.unattach_card', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        card: `[${data.util.cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`,
        attachment: data.util.cutoffText(data.attachment.name, 25)
      }),
      thumbnail: data.attachment.url.startsWith(data.util.Constants.IMAGE_ATTACHMENT_HOST) ?
        { url: data.attachment.url } : null
    }
  });
};