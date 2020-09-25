exports.name = 'UPDATE_CHECK_ITEM_NAME';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.checkitem_rename', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list', 'checklist', 'checklistItem']) +
        `\n**${_('trello.one_chkitem_name')}:** ${
          data.util.cutoffText(data.util.Escape.markdown(data.oldData.name), 50)}`,
    },
    small: {
      description: _('webhooks.checkitem_rename', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        card: `[${data.util.cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`
      }),
    }
  });
};