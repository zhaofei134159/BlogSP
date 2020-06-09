// 配置js
var conf = require('../../resource/js/conf.js'),
    util = require('../../utils/util.js'),
    WxParse = require('../../wxParse/wxParse.js');

//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    loadingHidden:true,
    blogUrl: conf.blogUrl,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  // 首页展示数据
  onLoad: function () {
    var userInfo_openid = wx.getStorageSync('userInfo_openid');
    var self = this;
    if(userInfo_openid){
      this.openidGetUser(userInfo_openid);
    }
  },
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
    self.setData({
      loadingHidden: false
    })

    
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
              console.log(callback.data.data);
              self.setData({
                userInfo: callback.data.data,
                hasUserInfo: true
              })
          }
          
          self.setData({
            loadingHidden: true
          })
        }
    })
  },
  openidGetUser:function(userInfo_openid){
    var self = this;
    self.setData({
      loadingHidden: false
    })

    util.request({
        url:conf.openidGetUserinfo,
        data:{'openid':userInfo_openid},
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
              console.log(callback.data.data);
              self.setData({
                userInfo: callback.data.data,
                hasUserInfo: true
              })
          }
          self.setData({
            loadingHidden: true
          })
        }
    })
  },
  userMessage:function(e){
    if(this.data.hasUserInfo){
      wx.navigateTo({
          url:"/pages/message/message?userId="+e.currentTarget.dataset.uid
      })
    }
  }
})
