exports.name = 'UPDATE_BOARD_NAME';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.board_rename', {
      member: data.invoker.webhookSafeName,
      board: data.util.cutoffText(data.board.name, 50),
      oldName: data.util.cutoffText(data.oldData.name, 50)
    }),
    description: '',
  });
};