module.exports = (client) => ({
  get: {
    server(id) {
      return client.rdb.r.table("servers").get(id).default(null).run(client.rdb.conn);
    },
    servers() {
      return new Promise((resolve, reject) => {
        client.rdb.r.table("servers").run(client.rdb.conn, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(data.toArray());
        });
      });
    },
    webhooks() {
      return new Promise((resolve, reject) => {
        client.rdb.r.table("webhooks").run(client.rdb.conn, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(data.toArray());
        });
      });
    },
    webhooksEdit(id, muted) {
      return new Promise((resolve, reject) => {
        client.rdb.r.table("webhooks").run(client.rdb.conn, (err, data) => {
          if (err) {
            reject(err);
          }
          data.each(async (err, row) => {
            if (err) {
              reject(err);
            }
            if (row.id !== id) return;
            for (let item of Object.keys(row)) {
              if (!row[item].bits) return;
              row[item] = { muted: muted };
              client.rdb.r.table("webhooks").get(row.id).update(row).run(client.rdb.conn, (err2, data2) => {
                if (err2) {
                  reject(err2);
                }
                resolve(data2);
              });
            }
          });
        });
      });
    },
    webhooksOf(id) {
      return new Promise((resolve, reject) => {
        client.rdb.r.table("webhooks").run(client.rdb.conn, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(data.toArray().map(webhook => {
            if (webhook[id] !== undefined) {
              return { board: webhook["id"], id: id, bits: webhook[id].bits };
            } else {
              return undefined;
            }
          }).filter(webhook => {
            if (webhook !== undefined) {
              return true;
            } else {
              return false;
            }
          }));
        });
      });
    },
    webhook(id, bid) {
      return client.rdb.r.table("webhooks").get(bid)(id).default(null).run(client.rdb.conn);
    },
    webhookBoard(bid) {
      return client.rdb.r.table("webhooks").get(bid).default(null).run(client.rdb.conn);
    },
    user(id) {
      return client.rdb.r.table("users").get(id).default(null).run(client.rdb.conn);
    }
  },
  add: {
    board(id, bid) {
      return new Promise((resolve, reject) => {
        client.rdb.r.table("servers").get(id).default(null).run(client.rdb.conn, (err, data) => {
          if (err) {
            reject(err);
          }
          if (data === null) {
            client.rdb.r.table("servers").insert({
              id: id,
              boards: [],
              current: bid
            }).run(client.rdb.conn, (err, data) => {
              if (err) {
                reject(err);
              }
              resolve(data);
            });
          } else {
            client.rdb.r.table("servers").get(id).update({ boards: client.rdb.r.row("boards").append(bid) }).run(client.rdb.conn, (err2, data2) => {
              if (err2) {
                reject(err2);
              }
              resolve(data2);
            });
          }
        });
      });
    },
    server(data) {
      return client.rdb.r.table("servers").insert(data).run(client.rdb.conn);
    },
    webhook(id, bid, url, mid, wid) {
      return new Promise((resolve, reject) => {
        client.rdb.r.table("webhooks").get(bid).default(null).run(client.rdb.conn, (err, data) => {
          if (err) {
            reject(err);
          }
          if (data === null) {
            let table = { id: bid, modelId: mid };
            if (wid) table.webhookId = wid;
            table[id] = { webhook: url, bits: [], muted: false };
            client.rdb.r.table("webhooks").insert(table).run(client.rdb.conn, (err2, data2) => {
              if (err2) {
                reject(err2);
              }
              resolve(data2);
            });
          } else {
            let table = { modelId: mid };
            if (wid) table.webhookId = wid;
            table[id] = { webhook: url, bits: [] };
            client.rdb.r.table("webhooks").get(bid).update(table).run(client.rdb.conn, (err2, data2) => {
              if (err2) {
                reject(err2);
              }
              resolve(data2);
            });
          }
        });
      });
    }
  },
  setup: {
    server(id, c) {
      return client.rdb.r.table("servers").insert({ id: id, boards: [c], current: c }).run(client.rdb.conn);
    }
  },
  delete: {
    board(id, bid) {
      return client.rdb.r.table("servers")
        .get(id).update({
          boards: client.rdb.r.row("boards")
            .difference([bid])
        }).default(null).run(client.rdb.conn);
    },
    webhook(id, bid) {
      return new Promise((resolve, reject) => {
        client.rdb.r.table("webhooks").get(bid).default(null).run(client.rdb.conn, (err, data) => {
          if (err) {
            reject(err);
          }
          if (data === null) {
            reject(404);
          }
          let table = data;
          delete table[id];
          if (Object.keys(table).length <= 3) {
            client.rdb.r.table("webhooks").get(bid).delete().run(client.rdb.conn, (err2, data2) => {
              if (err2) {
                reject(err2);
              }
              resolve(data2);
            });
          } else {
            client.rdb.r.table("webhooks").get(bid).replace(table).run(client.rdb.conn, (err2, data2) => {
              if (err2) {
                reject(err2);
              }
              resolve(data2);
            });
          }
        });
      });
    },
    user(id) {
      return client.rdb.r.table("users").get(id).delete().run(client.rdb.conn);
    }
  },
  set: {
    server(id, data) {
      return client.rdb.r.table("servers").get(id).update(data).run(client.rdb.conn);
    },
    user(id, data) {
      return client.rdb.r.table("users").get(id).update(data).run(client.rdb.conn);
    },
    webhook(id, bid, bits) {
      return new Promise((resolve, reject) => {
        client.rdb.r.table("webhooks").get(bid).default(null).run(client.rdb.conn, (err, data) => {
          if (err) {
            reject(err);
          }
          if (data === null) {
            reject(404);
          }
          let table = {};
          table[id] = { bits: bits };
          client.rdb.r.table("webhooks").get(bid).update(table).run(client.rdb.conn, (err2, data2) => {
            if (err2) {
              reject(err2);
            }
            resolve(data2);
          });
        });
      });
    },
    webhookMute(id, bid, muted) {
      return new Promise((resolve, reject) => {
        client.rdb.r.table("webhooks").get(bid).default(null).run(client.rdb.conn, (err, data) => {
          if (err) {
            reject(err);
          }
          if (data === null) {
            reject(404);
          }
          let table = {};
          table[id] = { muted: muted };
          client.rdb.r.table("webhooks").get(bid).update(table).run(client.rdb.conn, (err2, data2) => {
            if (err2) {
              reject(err2);
            }
            resolve(data2);
          });
        });
      });
    }
  }
});
