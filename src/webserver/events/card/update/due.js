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

exports.name = 'UPDATE_CARD_DUE';

exports.exec = async data => {
  const _ = data.localeModule;
  const changedKey = Object.keys(data.oldData)[0];
  if (changedKey === 'due') {
    const title = !data.oldData.due ? 'webhooks.due_add' :
      (!data.card.due ? 'webhooks.due_remove' : 'webhooks.due_change');
    const oldDue = _.moment(data.oldData.due);
    const newDue = _.moment(data.card.due);
    return data.send({
      title: _(title, {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list']),
      fields: [data.oldData.due ? {
        name: '*' + _('trello.old_due') + '*',
        value: `${oldDue.format('LLLL')} *(${oldDue.fromNow()})*`,
        inline: true
      } : null, data.card.due ? {
        name: '*' + _('trello.new_due') + '*',
        value: `${newDue.format('LLLL')} *(${newDue.fromNow()})*`,
        inline: true
      } : null].filter(v => !!v)
    });
  } else if (changedKey === 'dueComplete')
    return data.send({
      title: _(data.card.dueComplete ? 'webhooks.due_on' : 'webhooks.due_off', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list'])
    });
};