// 配置js
var conf = require('../../resource/js/conf.js'),
    util = require('../../utils/util.js'),
    WxParse = require('../../wxParse/wxParse.js');

//获取应用实例
const app = getApp()
Page({
  data: {
      'userInfo': {},
      'hasUserInfo': false,
      'canIUse': wx.canIUse('button.open-type.getUserInfo')
  },
  // 首页展示数据
  onLoad: function () {
    var self = this;
    // wx.checkSession({
    //     success: function(e){
    //         console.log("没过期");
    //         wx.getUserInfo({
    //           success(res) {
    //              self.getUserData(res);
    //           }
    //         })
    //     },
    //     fail: function(){ 
    //         console.log("过期了");
    //         wx.login({
    //             success: function(res) {
    //                 if (res.code) {
    //                   wx.getUserInfo({
    //                     success(res) {
    //                       self.getUserData(res);
    //                     }
    //                   })
    //                 } else {
    //                     console.log('获取用户登录态失败！' + res.errMsg)
    //                 }
    //             }
    //         });
    //     }
    // });
  },
  maskmove:function(){},
  getUserInfo: function(e) {
    var self = this;
    console.log(e)
    if (e.detail.userInfo) {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      wx.login({
        success: res => {
            self.getUserData(res);
        }
      })  
    } else {
      console.log(333,'执行到这里，说明拒绝了授权')
      wx.showToast({
        title: "为了您更好的体验,请先同意授权",
        icon: 'none',
        duration: 2000
      });
    }
  },
  getUserData:function(e){
    console.log(e);
    return '';
    var self = this;
    app.globalData.userInfo = e.userInfo;
    this.setData({
      userInfo: e.userInfo,
      hasUserInfo: true
    })
    util.request({
        url:conf.getUserInfoUrl,
        data:{'userInfo':e.userInfo,'encryptedData':e.encryptedData,'iv':e.iv},
        method:'POST',
        header:{'content-type': 'application/x-www-form-urlencoded'},
        success: function (callback) {
          console.log(callback);          
        }
    })
  }
})

