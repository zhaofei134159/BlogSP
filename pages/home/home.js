// 配置js
var conf = require('../../resource/js/conf.js'),
    util = require('../../utils/util.js');

//获取应用实例
const app = getApp()
Page({
	data: {
		'lun_ad':{},
		'blogUrl':conf.blogUrl
	},
	// 首页展示数据
	onLoad: function () {
		var self = this;
		util.request({
			url:conf.detailUrl,
		    data:{},
		    method:'get',
		    header:{'content-type': 'application/json'},
		    success: function (callback) {
				self.setData({
					lun_ad: callback.data.lun_ad
				})
		    }
		})
	},
	onShow: function(){
		this.setData({
			current:0
		})
	},
})

