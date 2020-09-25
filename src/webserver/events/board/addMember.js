exports.name = 'ADD_MEMBER_TO_BOARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _(data.invoker.id === data.member.id ? 'webhooks.board_join' : 'webhooks.board_add_member', {
        member: data.invoker.webhookSafeName,
        member2: data.member.webhookSafeName
      }),
      description: data.embedDescription(['member']) +
        `\n**${_('words.member_type.one')}:** ${_(`trello.member_type.${data.action.data.memberType}`)}`,
    },
    small: {
      description: _(data.invoker.id === data.member.id ?
        'webhooks.board_join' : 'webhooks.board_add_member', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        member2: `[${data.member.webhookSafeName}](https://trello.com/${data.member.username})`
      }),
    }
  });
};