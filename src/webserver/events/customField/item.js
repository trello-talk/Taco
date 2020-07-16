/*
This file is part of Taco

MIT License

Copyright (c) 2020 Trello Talk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

exports.name = 'UPDATE_CUSTOM_FIELD_ITEM';

exports.exec = async data => {
  const _ = data.localeModule;
  const resultData = {
    description: data.embedDescription(['card', 'customField']),
    fields: []
  };
  const added = !data.customFieldItem.value;
  const removed = !data.oldData.value;
  switch (data.customField.type) {
  case 'checkbox':
    resultData.title = _(`webhooks.customfielditem_checkbox_${removed}`, {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50),
      customField: data.util.cutoffText(data.customField.name, 50)
    });
    break;
  case 'text':
    resultData.title = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50),
      customField: data.util.cutoffText(data.customField.name, 50)
    });
    if (!removed)
      resultData.fields.push({
        name: '*' + _('trello.old_v') + '*',
        value: data.oldData.value.text,
        inline: true
      });
    if (!added)
      resultData.fields.push({
        name: '*' + _('trello.new_v') + '*',
        value: data.customFieldItem.value.text,
        inline: true
      });
    break;
  case 'number':
    resultData.title = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50),
      customField: data.util.cutoffText(data.customField.name, 50)
    });
    if (!removed)
      resultData.fields.push({
        name: '*' + _('trello.old_v') + '*',
        value: _.toLocaleString(parseFloat(data.oldData.value.number)),
        inline: true
      });
    if (!added)
      resultData.fields.push({
        name: '*' + _('trello.new_v') + '*',
        value: _.toLocaleString(parseFloat(data.customFieldItem.value.number)),
        inline: true
      });
    break;
  case 'date':
    resultData.title = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50),
      customField: data.util.cutoffText(data.customField.name, 50)
    });
    if (!removed)
      resultData.fields.push({
        name: '*' + _('trello.old_v') + '*',
        value: _.moment(data.oldData.value.date).format('LLLL'),
        inline: true
      });
    if (!added)
      resultData.fields.push({
        name: '*' + _('trello.new_v') + '*',
        value: _.moment(data.customFieldItem.value.date).format('LLLL'),
        inline: true
      });
    break;
  case 'list':
    resultData.title = _(`webhooks.customfielditem_${data.oldData.idValue ? 'update' : 'remove'}`, {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50),
      customField: data.util.cutoffText(data.customField.name, 50)
    });
    break;
  }
  if (resultData.title)
    return data.send(resultData);
};