// 配置js
var conf = require('../../resource/js/conf.js'),
    util = require('../../utils/util.js');

//获取应用实例
const app = getApp()
Page({
	data: {
		'lun_ad':{},
		'works':{},
		'workIndex':1,
		'blogUrl':conf.blogUrl
	},
	// 首页展示数据
	onLoad: function () {
		var self = this;
	 	if (app.globalData.lun_ad&&app.globalData.works) {
			this.setData({
				lun_ad: app.globalData.lun_ad,
				works: app.globalData.works
			})
			return '';
		}
		util.request({
			url:conf.homeUrl,
		    data:{'workIndex':1},
		    method:'get',
		    header:{'content-type': 'application/json'},
		    success: function (callback) {
		    	console.log(callback.data);
		    	var Articles = callback.data.works;

                for (var i = 0, len = Articles.length; i < len; i++) {
                	var item = Articles[i];
                    item.desc = util.delHtmlTag(item.desc);
                }

              	app.globalData.lun_ad = callback.data.lun_ad;
              	app.globalData.works = Articles;
				self.setData({
					lun_ad: callback.data.lun_ad,
					works: Articles,
					workIndex: 1
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
	inputSearch:function(e){
		console.log(e);
		wx.navigateTo({
	        url:"/pages/cate/cate"
	    })
	},
	onPullDownRefresh: function() {
		var self = this
		util.request({
			url:conf.homeUrl,
		    data:{'workIndex':1},
		    method:'get',
		    header:{'content-type': 'application/json'},
		    success: function (callback) {
		    	console.log(callback.data);
		    	var Articles = callback.data.works;

                for (var i = 0, len = Articles.length; i < len; i++) {
                	var item = Articles[i];
                    item.desc = util.delHtmlTag(item.desc);
                }

              	app.globalData.lun_ad = callback.data.lun_ad;
              	app.globalData.works = Articles;
				self.setData({
					lun_ad: callback.data.lun_ad,
					works: Articles,
					workIndex: 1
				})
		    }
		})
  	},
  	onReachBottom: function () {
		var self = this;
		wx.showToast({
			title: "正在加载~",
			icon: "none",
			duration: 2000
		})

		util.request({
			url:conf.homeUrl,
		    data:{'workIndex':this.data.workIndex+1},
		    method:'get',
		    header:{'content-type': 'application/json'},
		    success: function (callback) {
		    	console.log(callback.data.works);
		    	if(callback.data.works.length==0){
		    		wx.showToast({
						title: '没有文章了哦~',
						icon: "none",
						duration: 2000
					})
		    	}
		    	console.log(callback.data);
		    	var workIndex = self.data.workIndex + 1;
		    	var Articles = callback.data.works;

                for (var i = 0, len = Articles.length; i < len; i++) {
                	var item = Articles[i];
                    item.desc = util.delHtmlTag(item.desc);
                }

                var works = self.data.works.concat(Articles);

              	app.globalData.lun_ad = callback.data.lun_ad;
              	app.globalData.works = works;

				self.setData({
					lun_ad: callback.data.lun_ad,
					works: works,
					workIndex: workIndex
				})
		    }
		})
	}
})

