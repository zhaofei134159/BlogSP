// 配置js
var conf = require('../../resource/js/conf.js'),
    util = require('../../utils/util.js'),
    WxParse = require('../../wxParse/wxParse.js');

//获取应用实例
const app = getApp()
Page({
	data: {
		'imgPath':'/resource/images/word.jpg',
		'wordsResult':{},
		'loadingHidden':true,
	},
	// 首页展示数据
	onLoad: function () {
		this.loadImg();
	},
	onShow: function(){
		this.setData({
			current:0
		})
	},
	selectImg:function(){
		var that = this;
		wx.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: function (res) {
				//res.tempFilePaths 返回图片本地文件路径列表
				var tempFilePaths = res.tempFilePaths;
				that.setData({
					imgPath: tempFilePaths[0]
				})
			}
		})
	},
	previewImg: function (e) {
		var img = this.data.imgPath;
		// 设置预览图片路径
		wx.previewImage({
			current: img,
			urls: [img]
		})
	},
	loadImg: function () {
		var that = this;
		// 动态加载图
		this.setData({
			loadingHidden:false,
		})

		wx.uploadFile({
			url: conf.uploadFileWordUrl,
			filePath: that.data.imgPath,
			name: "file",
			headers: {
				'Content-Type': 'form-data'
			},
			success: function (res) {
				console.log(res);
				var callBack = JSON.parse(res.data);
				console.log(callBack);

				// 隐藏动态加载图
				that.setData({
					loadingHidden:true
				})

				if(callBack.errorNo!='0'){
					wx.showToast({
						title: callBack.errorMsg,
						icon: "",
						duration: 1500,
						mask: true
					});
				}else{
					that.setData({
						wordsResult:callBack.seccuss.words_result
					})
					wx.showToast({
						title: '完成',
						icon: "",
						duration: 1500,
						mask: true
					});
				}
			},
			fail: function (res) {
				console.log(res);
				// 隐藏动态加载图
				that.setData({
					loadingHidden:true
				})
				wx.showToast({
					title: "上传失败，请检查网络或稍后重试。",
					icon: "none",
					duration: 1500,
					mask: true
				});
			}
		})
	}
})

