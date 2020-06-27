/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah 2016 - 2019
 Copyright (c) Trello Talk Team 2019 - 2020

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
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