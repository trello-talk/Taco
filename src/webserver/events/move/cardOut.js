exports.name = 'MOVE_CARD_FROM_BOARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.move_out_card', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list']) +
        `\n**${_('trello.to_board')}:** \`${data.targetBoard.id}\``,
    },
    small: {
      description: _('webhooks.move_out_card', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        card: `[${data.util.cutoffText(data.card.name, 50)}](https://trello.com/c/${data.card.shortLink})`
      }),
    }
  });
};