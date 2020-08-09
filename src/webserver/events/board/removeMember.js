exports.name = 'REMOVE_MEMBER_FROM_BOARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _(data.invoker.id === data.member.id ? 'webhooks.board_left' : 'webhooks.board_remove_member', {
      member: data.invoker.webhookSafeName,
      member2: data.member.webhookSafeName
    }),
    description: data.embedDescription(['member']),
  });
};