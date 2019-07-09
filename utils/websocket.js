// 配置js
var conf = require('../resource/js/conf.js'),
    util = require('./util.js');

var socketOpen = false;
var lockReconnect = false;
var serverInterObj = null;
var socketMsgQueue = [];

function connect(user,func) {
	socketOpen = false;
	console.log('链接：'+socketOpen);
	wx.connectSocket({
		url: conf.webSocketUrl,
	})
 
	wx.onSocketOpen(function (res) {
        heartCheck.reset().start();
		wx.showToast({
			title: '信道已开通~',
			icon: "success",
			duration: 2000
		})
	 
		//接受服务器消息
		wx.onSocketMessage(func);//func回调可以拿到服务器返回的数据

		socketOpen = true;

		if(socketMsgQueue.length>=0){
			for (let i = 0; i < socketMsgQueue.length; i++) {
				send(socketMsgQueue[i]);
			}
			socketMsgQueue = [];
		}
	});
 
	wx.onSocketError(function (res) {
		console.log(res);
		reconnect();
		wx.showToast({
			title: '信道连接失败，请检查！',
			icon: "none",
			duration: 2000
		})
	})
}

function reconnect(){
	console.log('重连：'+socketOpen);
	if (lockReconnect){
		console.log('正在重连');
		return false;
	} 
	lockReconnect = true;
	wx.connectSocket({
		url: conf.webSocketUrl,
	})
	socketOpen = true
	lockReconnect = false;
}
 
//发送消息
function send(msg) {
	console.log('发送：'+socketOpen);
	if(socketOpen){
		wx.sendSocketMessage({
			data: msg
		});
	}else{
		socketMsgQueue.push(msg);
	}
}

function close(){
	wx.onSocketOpen(function (e) {
		wx.closeSocket({
			complete: function(res){
				console.log(res);
			}
		});
		socketOpen = false;
	});

	wx.onSocketError(function (res) {
		console.log(res);
	})

	wx.onSocketClose(function(res) {
		wx.showToast({
			title: '连接断开~',
			icon: "none",
			duration: 2000
		})
	})
	
}


//心跳检测
var heartCheck = {
    timeout: 10000,   //  10秒 心跳一下       
    timeoutObj: null,
    serverTimeoutObj: null,
    reset: function(){
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    },
    start: function(){
        var self = this;
        this.timeoutObj = setTimeout(function(){
            send("ping");
            // console.log("ping!")
            self.serverTimeoutObj = setTimeout(function(){
                close();     
            }, self.timeout)
        }, this.timeout)
    }
}



module.exports = {
	connect: connect,
	close: close,
	send: send,
	socketOpen:socketOpen,
	heartCheck:heartCheck,
	reconnect:reconnect
}