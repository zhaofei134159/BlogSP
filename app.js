// 配置js
var conf = require('./resource/js/conf.js'),
    util = require('./utils/util.js');
    
//app.js
App({
  globalData: {
    userInfo: null,
    token: 'zhaofei'
  },
  onLaunch: function () {
    var self = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          wx.getUserInfo({
            success(e) {
              self.getUserData(e,res);
            }
          })
        } 
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  getUserData:function(userinfo,code){
    var self = this;
    util.request({
        url:conf.getUserInfoUrl,
        data:{'userInfo':userinfo.userInfo,'encryptedData':userinfo.encryptedData,'iv':encodeURIComponent(userinfo.iv),'code':code.code},
        method:'POST',
        header:{'content-type': 'application/x-www-form-urlencoded'},
        success: function (callback) {
          // console.log(callback);
          if(callback.data.flag){
              self.globalData.userInfo = callback.data.data;
              wx.setStorageSync('userInfo_openid', callback.data.data.weixin_openid);
          }
        }
    })
  }
})