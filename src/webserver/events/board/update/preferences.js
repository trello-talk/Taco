exports.name = 'UPDATE_BOARD_PREFS';

exports.exec = async data => {
  const prefMap = {
    invitations: 'invite_perms',
    comments: 'comment_perms',
    voting: 'vote_perms',
    permissionLevel: 'perm_levels'
  };
  const pref = Object.keys(data.board.prefs)[0];

  if (prefMap[pref]) {
    const _ = data.localeModule;
    return data.send({
      default: {
        title: _(`webhooks.board_set_${prefMap[pref]}`, {
          member: data.invoker.webhookSafeName,
          board: data.util.cutoffText(data.board.name, 50),
          oldPerm: _(`trello.${prefMap[pref]}.${data.oldData.prefs[pref]}`),
          perm: _(`trello.${prefMap[pref]}.${data.board.prefs[pref]}`)
        }),
        description: '',
      },
      small: {
        description: _(`webhooks.board_set_${prefMap[pref]}`, {
          member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
          board: data.util.cutoffText(data.board.name, 50),
          oldPerm: _(`trello.${prefMap[pref]}.${data.oldData.prefs[pref]}`),
          perm: _(`trello.${prefMap[pref]}.${data.board.prefs[pref]}`)
        }),
      }
    });
  }
};