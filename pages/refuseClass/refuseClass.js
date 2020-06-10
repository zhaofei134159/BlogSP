// 配置js
var conf = require('../../resource/js/conf.js'),
    util = require('../../utils/util.js'),
    WxParse = require('../../wxParse/wxParse.js');

//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    voicePath:'',
    loadingHidden:true,
  },
  // 首页展示数据
  onLoad: function () {
    
  },
  // 录音开始
  voiceStart:function(){
    var that = this;
    const recorderManager = wx.getRecorderManager()
    const options = {
      duration: 6000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
    }
    //调取小程序新版授权页面
    wx.authorize({
      scope: 'scope.record',
      success() {
        console.log("录音授权成功");
        // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
        // wx.startRecord();
        recorderManager.start(options);//使用新版录音接口，可以获取录音文件
      },
      fail(){
        console.log("第一次录音授权失败");
        wx.showModal({
          title: '提示',
          content: '您未授权录音，功能将无法使用',
          showCancel: true,
          confirmText: "授权",
          confirmColor: "#52a2d8",
          success: function (res) {
            if (res.confirm) {
              //确认则打开设置页面（重点）
              wx.openSetting({
                success: (res) => {
                  console.log(res.authSetting);
                  if (!res.authSetting['scope.record']) {
                    //未设置录音授权
                    console.log("未设置录音授权");
                    wx.showModal({
                      title: '提示',
                      content: '您未授权录音，功能将无法使用',
                      showCancel: false,
                    })
                  } else {
                    //第二次才成功授权
                    console.log("设置录音授权成功");
                    recorderManager.start(options);
                  }
                },
                fail: function () {
                  console.log("授权设置录音失败");
                }
              })
            } else if (res.cancel) {
              console.log("cancel");
            }
          },
          fail: function () {
            console.log("openfail");
          }
        })
      }
    })
  },
  voiceEnd:function(){
    var that = this;

    // 录音结束 
    const recorderManager = wx.getRecorderManager();
    recorderManager.stop();
    recorderManager.onStop((res) => {
      console.log('停止录音', res.tempFilePath)
      that.setData({
          voicePath: res.tempFilePaths[0]
      })
    })

    // 上传录音文件
    this.setData({
      loadingHidden:false,
    })

    wx.uploadFile({
      url: conf.uploadVoiceWordUrl,
      filePath: that.data.voicePath,
      name: "file",
      headers: {
        'Content-Type': 'form-data'
      },
      success: function (res) {
        var callBack = JSON.parse(res.data);
        console.log(callBack);

        // 隐藏动态加载图
        that.setData({
          loadingHidden:true
        })

        if(callBack.errorNo!='0'){
          wx.showToast({
            title: callBack.errorMsg,
            icon: "",
            duration: 1500,
            mask: true
          });
        }else{
          that.setData({
            wordsResult:callBack.seccuss.words_result
          })
          wx.showToast({
            title: '完成',
            icon: "",
            duration: 1500,
            mask: true
          });
        }
      },
      fail: function (res) {
        console.log(res);
        // 隐藏动态加载图
        that.setData({
          loadingHidden:true
        })
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
