exports.name = 'MAKE_NORMAL_MEMBER_OF_BOARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _(data.invoker.id === data.member.id ?
        'webhooks.board_to_normal_self' : 'webhooks.board_to_normal', {
        member: data.invoker.webhookSafeName,
        member2: data.member.webhookSafeName
      }),
      description: data.embedDescription(['member']),
    },
    small: {
      description: _(data.invoker.id === data.member.id ?
        'webhooks.board_to_normal_self' : 'webhooks.board_to_normal', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        member2: `[${data.member.webhookSafeName}](https://trello.com/${data.member.username})`
      }),
    }
  });
};