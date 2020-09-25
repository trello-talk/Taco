exports.name = 'UPDATE_CUSTOM_FIELD_DISPLAY';

exports.exec = async data => {
  const _ = data.localeModule;
  const changedKey = Object.keys(data.oldData.display)[0];
  if (changedKey === 'cardFront')
    return data.send({
      default: {
        title: _(`webhooks.customfield_carddisplay_${!data.oldData.display.cardFront}`, {
          member: data.invoker.webhookSafeName,
          customField: data.util.cutoffText(data.customField.name, 50)
        }),
        description: '',
      },
      small: {
        description: _(`webhooks.customfield_carddisplay_${!data.oldData.display.cardFront}`, {
          member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
          customField: data.util.cutoffText(data.customField.name, 50)
        }),
      }
    });
};