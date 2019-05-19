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
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }else{
      wx.login({
          success: function(res) {
              if (res.code) {
                wx.getUserInfo({
                  success(e) {
                    self.getUserData(e,res);
                  }
                })
              } else {
                  console.log('获取用户登录态失败！' + res.errMsg)
                  wx.showToast({
                    title: '获取用户登录态失败！' + res.errMsg,
                    icon: 'none',
                    duration: 2000
                  });
              }
          }
      });
    }
  },
  maskmove:function(){},
  getUserInfo: function(e) {
    var self = this;
    if (e.detail.userInfo) {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      wx.login({
        success: res => {
            self.getUserData(e.detail,res);
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
  getUserData:function(userinfo,code){
    var self = this;
    
    util.request({
        url:conf.getUserInfoUrl,
        data:{'userInfo':userinfo.userInfo,'encryptedData':userinfo.encryptedData,'iv':encodeURIComponent(userinfo.iv),'code':code.code},
        method:'POST',
        header:{'content-type': 'application/x-www-form-urlencoded'},
        success: function (callback) {
          console.log(callback);
          if(!callback.data.flag){
              wx.showToast({
                title: callback.data.msg,
                icon: 'none',
                duration: 2000
              });
          }else{
              app.globalData.userInfo = callback.data.data;
              wx.setStorageSync('userInfo_openid', callback.data.data.weixin_openid);
              self.setData({
                userInfo: callback.data.data,
                hasUserInfo: true
              })
          }
        }
    })
  }
})

