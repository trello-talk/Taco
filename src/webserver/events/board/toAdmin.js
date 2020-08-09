exports.name = 'MAKE_ADMIN_OF_BOARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.board_to_admin', {
      member: data.invoker.webhookSafeName,
      member2: data.member.webhookSafeName
    }),
    description: data.embedDescription(['member']),
  });
};