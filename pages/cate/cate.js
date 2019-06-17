// 配置js
var conf = require('../../resource/js/conf.js'),
    util = require('../../utils/util.js');

//获取应用实例
const app = getApp()
Page({
	data: {
		'tags':{},
		'works':{},
		'search':'',
		'tagId':'',
		'blogUrl':conf.blogUrl
	},
	// 首页展示数据
	onLoad: function (e) {
		var self = this;
		util.request({
			url:conf.tagUrl,
		    data:{},
		    method:'get',
		    header:{'content-type': 'application/json'},
		    success: function (callback) {
		    	console.log(callback);
				self.setData({
					tags: callback.data.tags,
				})
		    }
		})
	},
	onShow: function(){
		this.setData({
			current:0
		})
	},
	workImgloadError:function(e){
		var _errImg=e.target.dataset.errorimg;  
 		var imgObject="works["+_errImg+"].img"
	    var _errObj={};  
	    _errObj[imgObject]="public/public/workimg/2014312311231233123.jpg"; 
	    this.setData(_errObj);
	},
	searchCancel:function(){
		wx.switchTab({
		  url: '/pages/home/home'
		})
	},
	confirmSearch:function(e){
		var search = e.detail.value;
	 	this.setData({
	 		search:search
	 	});
		var self = this;
		util.request({
			url:conf.searchUrl,
		    data:{'search':search},
		    method:'get',
		    header:{'content-type': 'application/json'},
		    success: function (callback) {
		    	var Articles = callback.data.works;
                for (var i = 0, len = Articles.length; i < len; i++) {
                	var item = Articles[i];
                    item.desc = util.delHtmlTag(item.desc);
                }
			 	self.setData({
			 		works:callback.data.works
			 	});
		    }
		})
		this.onLoad()
	},
	tagSearch:function(e){
		console.log(e);
		var tagId = e.target.dataset.id;
	 	this.setData({
	 		tagId:tagId
	 	});
		var self = this;
		util.request({
			url:conf.tagSearchUrl,
		    data:{'tagId':tagId},
		    method:'get',
		    header:{'content-type': 'application/json'},
		    success: function (callback) {
		    	var Articles = callback.data.works;
                for (var i = 0, len = Articles.length; i < len; i++) {
                	var item = Articles[i];
                    item.desc = util.delHtmlTag(item.desc);
                }
			 	self.setData({
			 		works:callback.data.works
			 	});
		    }
		})
		this.onLoad()
	}

})

