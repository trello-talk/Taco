exports.name = 'UPDATE_BOARD_CLOSED';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _(data.board.closed ?
      'webhooks.archive_board' : 'webhooks.unarchive_board', {
      member: data.invoker.webhookSafeName,
      board: data.util.cutoffText(data.board.name, 50)
    }),
    description: '',
  });
};