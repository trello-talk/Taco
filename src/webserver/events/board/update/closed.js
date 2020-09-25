exports.name = 'UPDATE_BOARD_CLOSED';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _(data.board.closed ?
        'webhooks.archive_board' : 'webhooks.unarchive_board', {
        member: data.invoker.webhookSafeName,
        board: data.util.cutoffText(data.board.name, 50)
      }),
      description: '',
    },
    small: {
      description: _(data.board.closed ?
        'webhooks.archive_board' : 'webhooks.unarchive_board', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        board: data.util.cutoffText(data.board.name, 50)
      }),
    }
  });
};