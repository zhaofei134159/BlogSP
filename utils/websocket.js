// 配置js
var conf = require('../resource/js/conf.js'),
    util = require('./util.js');

var socketOpen = false;
var socketMsgQueue = [];

function connect(user,func) {
	wx.connectSocket({
		url: conf.webSocketUrl,
		header:{'content-type': 'application/json'},
		success: function () {
			console.log('信道连接成功~')
		},
		fail: function () {
			console.log('信道连接失败~')
		}
	})
 
	wx.onSocketOpen(function (res) {
		wx.showToast({
			title: '信道已开通~',
			icon: "success",
			duration: 2000
		})
	 
		//接受服务器消息
		wx.onSocketMessage(func);//func回调可以拿到服务器返回的数据

		socketOpen = true;
		for (let i = 0; i < socketMsgQueue.length; i++) {
			send(socketMsgQueue[i]);
		}
		socketMsgQueue = [];
		 
	});
 
	wx.onSocketError(function (res) {
		wx.showToast({
			title: '信道连接失败，请检查！',
			icon: "none",
			duration: 2000
		})
	})
}
 
//发送消息
function send(msg) {
	if(socketOpen){
		wx.sendSocketMessage({
			data: msg
		});
	}else{
		socketMsgQueue.push(msg);
	}
}


module.exports = {
	connect: connect,
	send: send
}