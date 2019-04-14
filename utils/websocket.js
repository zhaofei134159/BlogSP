// 配置js
var conf = require('../resource/js/conf.js'),
    util = require('./util.js');

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
	var socketOpen = false;
	wx.onSocketOpen(function (res) {
		console.log('WebSocket连接已打开！');
		socketOpen = true;
		console.log('数据发送中' + JSON.stringify(msg));

		if(socketOpen){
			wx.sendSocketMessage({
				data: msg
			});
		}else{
		  	console.log('WebSocket连接关闭！')
		}
	})

}
module.exports = {
	connect: connect,
	send: send
}