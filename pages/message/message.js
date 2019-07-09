// 配置js
var conf = require('../../resource/js/conf.js'),
    util = require('../../utils/util.js'),
    websocket = require('../../utils/websocket.js');

//获取应用实例
var app = getApp();
Page({
	data: {
		'Bartitle':'相伴一生',
		'toUserId':'',
		'login_wxopenid':'',
		'newslist':[],
		'userInfo': {},
		'scrollTop': 0,
		'increase':false,//图片添加区域隐藏
		'inputViewBottom':0,
		'aniStyle': true,//动画效果
		'message':"",
		'previewImgList':[],
		'blogUrl':conf.blogUrl
	},
	onLoad: function (e) {
		var self = this;
		var Bartitle = this.data.Bartitle;
		if(e.userId==84){
			var Bartitle = '系统管理员';
		}
		this.setData({
			toUserId: e.userId,
			Bartitle: Bartitle,
			userInfo: app.globalData.userInfo,
			login_wxopenid:  wx.getStorageSync('userInfo_openid')
		})
		console.log(this.data.userInfo);

		//调通接口
		websocket.connect(self.data.userInfo,function (res) {
			// 心跳
        	websocket.heartCheck.reset().start();

        	var result = JSON.parse(res.data);

			var list = [];
			list = self.data.newslist;
			if(result.flog==5){
				list.push(result.result);
			}else if(result.flog==-1){
				websocket.heartCheck.reset();
				wx.showToast({
					title: '退出',
					icon: "none",
					duration: 2000
				})
			}

			wx.setNavigationBarTitle({
				title: self.data.Bartitle 
			})

			self.setData({
				newslist: list
			})
			self.bottom();
		})

		// 发送消息 查看之前的聊天记录
		websocket.send('{ "content": "old message","toUserId":"'+this.data.toUserId+'","userId":"'+this.data.login_wxopenid+'","type":"record"}');
	},
	onUnload:function(){
		websocket.send('{ "content": "out","toUserId":"'+this.data.toUserId+'","userId":"'+this.data.login_wxopenid+'","type":"out"}');
		// websocket.close();
	},
	//事件处理函数
	send: function (res) {
		var flag = this
		if (this.data.message.trim() == ""){
			wx.showToast({
				title: '消息不能为空哦~',
				icon: "none",
				duration: 2000
			})
		}else {
			setTimeout(function(){
				flag.setData({
					increase: false
				})
			},500)

			// 发消息
			websocket.send('{ "content": "' + this.data.message + '","toUserId":"'+this.data.toUserId+'","userId":"'+this.data.login_wxopenid+'","type":"text"}')
			
			// 清空input
			this.setData({
				message : ''
			})
			this.bottom();
		}
	},
	//监听input值的改变
	bindChange:function(res) {
		this.setData({
			message : res.detail.value
		})
	},
	chooseImage:function() {
		var that = this
		wx.chooseImage({
			count: 1, // 默认9
			sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
				var tempFilePaths = res.tempFilePaths
				// console.log(tempFilePaths)
				wx.uploadFile({
					url: conf.setMesssageImageUrl, //服务器地址
					filePath: tempFilePaths[0],
					name: 'file',
					headers: {
						'Content-Type': 'form-data'
					},
					success: function (res) {
						console.log(res);
						if (res.data){
							that.setData({
								'increase': false,
								'inputViewBottom': 0
							})

							websocket.send('{ "content": "' +  res.data + '","toUserId":"'+that.data.toUserId+'","userId":"'+that.data.login_wxopenid+'","type":"image"}')
							that.bottom()
						}
					}
				})
			}
		})
	},
	//图片预览
	previewImg:function(e){
		console.log(e);
		var that = this
		//必须给对应的wxml的image标签设置data-set=“图片路径”，否则接收不到
		var res = e.target.dataset.set
		var list = this.data.previewImgList //页面的图片集合数组
		//判断res在数组中是否存在，不存在则push到数组中, -1表示res不存在
		if (list.indexOf(res) == -1 ) {
			this.data.previewImgList.push(res)
		}
		wx.previewImage({
			current: res, // 当前显示图片的http链接
			urls: that.data.previewImgList // 需要预览的图片http链接列表
		})
	},
	//聊天消息始终显示最底端
	bottom: function () {
		var query = wx.createSelectorQuery()
		query.select('#chat-box').boundingClientRect()
		query.selectViewport().scrollOffset()
		query.exec(function (res) {
			if(res[0]==null){
				return 'error';
			}
			wx.pageScrollTo({
				scrollTop: res[0].bottom // #the-id节点的下边界坐标
			})
			res[1].scrollTop // 显示区域的竖直滚动位置
		})
	},
	tagsShow:function(res){
		// tag显示
		var increase = true;
		var inputViewBottom = 1;
		if(this.data.increase){
			increase = false;
			inputViewBottom = 0
		}
		this.setData({
			'increase': increase,
			'inputViewBottom': inputViewBottom
		})
		this.bottom();
	}
})
