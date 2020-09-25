exports.name = 'MAKE_ADMIN_OF_BOARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.board_to_admin', {
        member: data.invoker.webhookSafeName,
        member2: data.member.webhookSafeName
      }),
      description: data.embedDescription(['member']),
    },
    small: {
      description: _('webhooks.board_to_admin', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        member2: `[${data.member.webhookSafeName}](https://trello.com/${data.member.username})`
      }),
    }
  });
};