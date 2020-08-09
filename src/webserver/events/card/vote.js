exports.name = 'VOTE_ON_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _(data.action.data.voted ? 'webhooks.vote_card' : 'webhooks.unvote_card', {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50)
    }),
    description: data.embedDescription(['card', 'list']),
  });
};