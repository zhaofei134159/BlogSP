// 配置js
var conf = require('../../resource/js/conf.js'),
    util = require('../../utils/util.js');

//获取应用实例
const app = getApp()
Page({
	data: {
		'lun_ad':{},
		'works':{},
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
		    data:{},
		    method:'get',
		    header:{'content-type': 'application/json'},
		    success: function (callback) {
		    	var Articles = callback.data.works;

                for (var i = 0, len = Articles.length; i < len; i++) {
                	var item = Articles[i];
                    item.desc = util.delHtmlTag(item.desc);
                }

              	app.globalData.lun_ad = callback.data.lun_ad;
              	app.globalData.works = Articles;
				self.setData({
					lun_ad: callback.data.lun_ad,
					works: Articles
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
	}
})

