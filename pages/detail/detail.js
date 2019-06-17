// 配置js
var conf = require('../../resource/js/conf.js'),
    util = require('../../utils/util.js'),
    WxParse = require('../../wxParse/wxParse.js');

//获取应用实例
const app = getApp()
Page({
	data: {
		'desc':{},
		'work':{},
		'blogUrl':conf.blogUrl
	},
	// 首页展示数据
	onLoad: function (options) {
		console.log(options);
		var workId = options.workId;
	
		var self = this;
		util.request({
			url:conf.detailUrl,
			data:{'workId':workId},
			method:'get',
			header:{'content-type': 'application/json'},
			success: function (callback) {
  				callback.data.work.cdate = util.timeToDate(callback.data.work.ctime,'date');
				self.setData({
					work: callback.data.work
				})
  				WxParse.wxParse('desc', 'html', callback.data.work.desc, self, 25);
		    }
		})
	},
	onShow: function(){
		this.setData({
			current:0
		})
	},
	workImgloadError:function(e){
 		var imgObject="work.img"
	    var _errObj={};  
	    _errObj[imgObject]="public/public/workimg/2014312311231233123.jpg"; 
	    this.setData(_errObj);
	}
})

