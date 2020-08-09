exports.name = 'MOVE_CARD_TO_BOARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.move_in_card', {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50)
    }),
    description: data.embedDescription(['card', 'list']) +
      `\n**${_('trello.from_board')}:** \`${data.sourceBoard.id}\``,
  });
};