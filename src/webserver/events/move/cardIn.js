exports.name = 'MOVE_CARD_TO_BOARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.move_in_card', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list']) +
        `\n**${_('trello.from_board')}:** \`${data.sourceBoard.id}\``,
    },
    small: {
      description: _('webhooks.move_in_card', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        card: `[${data.util.cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`
      }),
    }
  });
};