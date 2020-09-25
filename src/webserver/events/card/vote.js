exports.name = 'VOTE_ON_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _(data.action.data.voted ? 'webhooks.vote_card' : 'webhooks.unvote_card', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list']),
    },
    small: {
      description: _(data.action.data.voted ? 'webhooks.vote_card' : 'webhooks.unvote_card', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        card: `[${data.util.cutoffText(data.card.name, 50)}](https://trello.com/c/${data.card.shortLink})`
      }),
    }
  });
};