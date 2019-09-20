const request = require('snekfetch')

module.exports = (client) => { return {
	get: {
		boards: function(token, id){
			return new Promise((resolve,reject)=>{
        request
        .get(`https://api.trello.com/1/members/${id}?boards=open&board_fields=subscribed,starred,pinned,name,shortLink,shortUrl&key=${client.apiKey}&token=${token}`)
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err) reject({ errorCode: "err", errorText: client.util.filter(err), response: res, error: err });
						resolve(res.body)
					}).catch(e => reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		board: function(token, id){
			return new Promise((resolve,reject)=>{
				request.get(`https://api.trello.com/1/boards/${id}?fields=subscribed,starred,pinned,name,desc,prefs,shortLink,shortUrl&members=all&member_fields=username,fullName,id&lists=all&list_fields=name&cards=all&card_fields=name&key=${client.apiKey}&token=${token}`)
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		lists: function(token, id){
			return new Promise((resolve,reject)=>{
				request.get(`https://api.trello.com/1/boards/${id}/lists?cards=open&card_fields=name,subscribed,shortLink,shortUrl,labels&fields=id,name,subscribed,dateLastActivity&key=${client.apiKey}&token=${token}`)
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		listsArchived: function(token, id){
			return new Promise((resolve,reject)=>{
				request.get(`https://api.trello.com/1/boards/${id}/lists?filter=closed&cards=open&card_fields=name,shortLink,shortUrl,labels&key=${client.apiKey}&token=${token}`)
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		card: function(token, id){
			return new Promise((resolve,reject)=>{
				request.get(`https://api.trello.com/1/cards/${id}?members=true&member_fields=fullName&attachments=true&board=true&board_fields=subscribed,name,shortLink,shortUrl&stickers=true&sticker_fields=image&attachment_fields=url&membersVoted=true&memberVoted_fields=fullName&checklists=all&checklist_fields=name&fields=name,subscribed,desc,labels,shortLink,shortUrl,due&key=${client.apiKey}&token=${token}`)
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		cards: function(token, id){
			return new Promise((resolve,reject)=>{
				request.get(`https://api.trello.com/1/boards/${id}/cards?card_fields=name,shortLink,shortUrl,labels&key=${client.apiKey}&token=${token}`)
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		cardsArchived: function(token, id){
			return new Promise((resolve,reject)=>{
				request.get(`https://api.trello.com/1/boards/${id}/cards?filter=closed&card_fields=name,shortLink,shortUrl,labels&key=${client.apiKey}&token=${token}`)
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		labels: function(token, id){
			return new Promise((resolve,reject)=>{
				request.get(`https://api.trello.com/1/board/${id}/labels?fields=name,color&key=${client.apiKey}&token=${token}`)
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		webhooks: function(token){
			return new Promise((resolve,reject)=>{
				request.get(`https://api.trello.com/1/tokens/${token}/webhooks?key=${client.apiKey}`)
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		}
	},
	add: {
		list: function(token, id, name){
			return new Promise((resolve,reject)=>{
				request.post(`https://api.trello.com/1/board/${id}/lists?name=${encodeURI(name)}&key=${client.apiKey}&token=${token}`)
				.send({ key: client.apiKey, token, name: name})
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		webhook: function(token, id){
			return new Promise((resolve,reject)=>{
				request.post(`https://api.trello.com/1/webhook?key=${client.apiKey}&token=${token}`)
				.send({ idModel: id, callbackURL: client.config.webhook_url, description: "Trello Bot Webhook" })
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		card: function(token, id, name){
			return new Promise((resolve,reject)=>{
				request.post(`https://api.trello.com/1/lists/${id}/cards?key=${client.apiKey}&token=${token}`)
				.send({ name: name })
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		attachment: function(token, id, url){
			return new Promise((resolve,reject)=>{
				request.post(`https://api.trello.com/1/card/${id}/attachments?url=${encodeURI(url)}&key=${client.apiKey}&token=${token}`)
				.send({ key: client.apiKey, token, url: url})
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		}
	},
	set: {
		label: function(token, id, color, name){
			return new Promise((resolve,reject)=>{
				request.put(`https://api.trello.com/1/board/${id}/labelNames/${color}?value=${encodeURI(name)}&key=${client.apiKey}&token=${token}`)
				.send({ key: client.apiKey, token, value: name})
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		list: {
			name: function(token, id, name){
				return new Promise((resolve,reject)=>{
					request.put(`https://api.trello.com/1/lists/${id}/name?value=${encodeURI(name)}&key=${client.apiKey}&token=${token}`)
					.send({ key: client.apiKey, token, value: name})
					.end((err, res)=>{
						client.util.filterStatus(res).then(()=>{
							if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
							resolve(res.body)
						}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
					})
				});
			},
			closed: function(token, id, value){
				return new Promise((resolve,reject)=>{
					request.put(`https://api.trello.com/1/lists/${id}/closed?value=${value}&key=${client.apiKey}&token=${token}`)
					.send({ key: client.apiKey, token, value: value})
					.end((err, res)=>{
						client.util.filterStatus(res).then(()=>{
							if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
							resolve(res.body)
						}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
					})
				});
			}
		},
		card: {
			name: function(token, id, name){
				return new Promise((resolve,reject)=>{
					request.put(`https://api.trello.com/1/card/${id}/name?value=${encodeURI(name)}&key=${client.apiKey}&token=${token}`)
					.send({ key: client.apiKey, token, value: name})
					.end((err, res)=>{
						client.util.filterStatus(res).then(()=>{
							if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
							resolve(res.body)
						}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
					})
				});
			},
			list: function(token, id, list){
				return new Promise((resolve,reject)=>{
					request.put(`https://api.trello.com/1/card/${id}/idList?value=${list}&key=${client.apiKey}&token=${token}`)
					.send({ key: client.apiKey, token, value: list})
					.end((err, res)=>{
						client.util.filterStatus(res).then(()=>{
							if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
							resolve(res.body)
						}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
					})
				});
			},
			description: function(token, id, description){
				return new Promise((resolve,reject)=>{
					request.put(`https://api.trello.com/1/card/${id}/desc?value=${encodeURI(description)}&key=${client.apiKey}&token=${token}`)
					.send({ key: client.apiKey, token, value: description})
					.end((err, res)=>{
						client.util.filterStatus(res).then(()=>{
							if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
							resolve(res.body)
						}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
					})
				});
			},
			closed: function(token, id, value){
				return new Promise((resolve,reject)=>{
					request.put(`https://api.trello.com/1/card/${id}/closed?value=${value}&key=${client.apiKey}&token=${token}`)
					.send({ key: client.apiKey, token, value: value})
					.end((err, res)=>{
						client.util.filterStatus(res).then(()=>{
							if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
							resolve(res.body)
						}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
					})
				});
			}
		}
	},
	delete: {
		card: function(token, id){
			return new Promise((resolve,reject)=>{
				request.delete(`https://api.trello.com/1/cards/${id}?key=${client.apiKey}&token=${token}`)
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		webhook: function(token, id){
			return new Promise((resolve,reject)=>{
				request.delete(`https://api.trello.com/1/tokens/${token}/webhooks/${id}?key=${client.apiKey}`)
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		}
	},
	subscribe: {
		card: function(token, id, subscribed){
			return new Promise((resolve,reject)=>{
				request.put(`https://api.trello.com/1/cards/${id}?subscribed=${subscribed}&key=${client.apiKey}&token=${token}`)
				.send({ key: client.apiKey, token, subscribed})
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		list: function(token, id, subscribed){
			return new Promise((resolve,reject)=>{
				request.put(`https://api.trello.com/1/lists/${id}?subscribed=${subscribed}&key=${client.apiKey}&token=${token}`)
				.send({ key: client.apiKey, token, subscribed})
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		},
		board: function(token, id, subscribed){
			return new Promise((resolve,reject)=>{
				request.put(`https://api.trello.com/1/boards/${id}?subscribed=${subscribed}&key=${client.apiKey}&token=${token}`)
				.send({ key: client.apiKey, token, subscribed})
				.end((err, res)=>{
					client.util.filterStatus(res).then(()=>{
						if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
						resolve(res.body)
					}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
				})
			});
		}
	},
	try: function(url){
		return new Promise((resolve,reject)=>{
			request.get(url)
			.end((err, res)=>{
				client.util.filterStatus(res).then(()=>{
					if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
					resolve(res.body)
				}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
			})
		});
	},
	test: function(data){
		return new Promise((resolve,reject)=>{
			request.post("localhost:8000/trellobeta")
			.send(data)
			.end((err, res)=>{
				client.util.filterStatus(res).then(()=>{
					if(err){reject({ errorCode: "err", errorText: client.util.filter(err), response:res, error:err })}
					resolve(res.body)
				}).catch(e=>reject({ errorCode: "statusfail", errorText: e, response: res, error: err }))
			})
		});
	}
}};
