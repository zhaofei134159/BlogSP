// 配置js
var conf = require('../../resource/js/conf.js'),
    util = require('../../utils/util.js'),
    WxParse = require('../../wxParse/wxParse.js');

//获取应用实例
const app = getApp()
Page({
	data: {
		'imgPath':'',
	},
	// 首页展示数据
	onLoad: function () {
		
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
		wx.uploadFile({
		url: "http://localhost:8080/upload/upload",
		filePath: that.data.imgPath,
		name: "upload_file",
		// 请求携带的额外form data
		/*formData: {
		"id": id
		},*/
		header: {
		'Content-Type': "multipart/form-data"
		},
		success: function (res) {
		wx.showToast({
		title: "图像上传成功！",
		icon: "",
		duration: 1500,
		mask: true
		});
		},
		fail: function (res) {
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

