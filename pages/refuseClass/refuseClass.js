// 配置js
var conf = require('../../resource/js/conf.js'),
    util = require('../../utils/util.js'),
    WxParse = require('../../wxParse/wxParse.js');

//index.js
//获取应用实例
const app = getApp()
const myaudio = wx.createInnerAudioContext();

Page({
  data: {
    voicePath:'',
    voiceTaskId:'',
    entityPath:'',
    fileWord:'',
    contShow:'voice',
    voiceImagePath:'/resource/images/voice-noactive.png',
    entityImagePath:'/resource/images/entity-noactive.png',
    loadingHidden:true,
    isplay:false,
    voicePlay:'/resource/images/voice.png',
  },
  // 首页展示数据
  onLoad: function () {

  },
  // 导航点击切换内容
  navTap:function(event){
    var title = event.currentTarget.dataset.title;
    this.setData({
        contShow: title,
    });
    if(title=='word'&&this.data.voicePath!=''){
      this.getWord();
    }
  },
  getWord:function(){
    var that = this;

    this.setData({
      loadingHidden:false,
    })

    util.request({
      url:conf.getVoiceUploadDescUrl,
      data:{'voicePath':this.data.voicePath,'task_id':this.data.voiceTaskId},
      method:'get',
      header:{'content-type': 'application/json'},
      success: function (res) {
          that.setData({
            loadingHidden:true,
          })

          console.log(res);
          var callBack = res.data;
          console.log(callBack);

          if(callBack.errorNo!='0'){
            wx.showToast({
              title: callBack.errorMsg,
              icon: "",
              duration: 1500,
              mask: true
            });
          }else{
            var word = callBack.success.word;
            if(callBack.success.word==''){
                word = '无内容';
            }
            console.log(word);
            that.setData({
              fileWord:word,
              voiceTaskId:callBack.success.taskId,
              contShow:'word',
            })
            wx.showToast({
              title: '完成',
              icon: "",
              duration: 1500,
              mask: true
            });
          }
        }
    })
  },
  // 录音开始
  voiceStart:function(){
    var that = this;
    // 修改图片
    this.setData({
      voiceImagePath:'/resource/images/voice-active.png',
    })

    const recorderManager = wx.getRecorderManager()
    const options = {
      duration: 20000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
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
    // 修改图片
    this.setData({
      voiceImagePath:'/resource/images/voice-noactive.png',
    })

    // 录音结束 
    const recorderManager = wx.getRecorderManager();
    recorderManager.stop();
    recorderManager.onStop((res) => {
      console.log('停止录音', res.tempFilePath)
      // 上传文件
      this.uploadFileModel(res.tempFilePath,'voice');
    })
  },
  // 播放
  voicePlayback: function () {
    if(this.data.isplay==false){
      myaudio.autoplay = true
      myaudio.src = this.data.voicePath
      myaudio.onPlay(() => {
        console.log('开始播放')
      })
      myaudio.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })
      this.setData({
          isplay: true,
      });
    }else{ 
      myaudio.pause();
      this.setData({
          isplay: false,
      });
    }
  },
  uploadFileModel:function(tempFilePath,type){
    var that = this;
    // 上传文件
    this.setData({
      loadingHidden:false,
    })

    var uploadUrl = conf.uploadVoiceWordUrl;
    if(type=='entity'){
      var uploadUrl = conf.uploadEntityImageWordUrl;
    }

    wx.uploadFile({
      url: uploadUrl,
      filePath: tempFilePath,
      name: "file",
      headers: {
        'Content-Type': 'form-data'
      },
      success: function (res) {
        // 隐藏动态加载图
        that.setData({
          loadingHidden:true
        })
        console.log(res);

        var callBack = JSON.parse(res.data);
        console.log(callBack);

        if(callBack.errorNo!='0'){
          wx.showToast({
            title: callBack.errorMsg,
            icon: "",
            duration: 1500,
            mask: true
          });
        }else{
          that.setData({
            voicePath:callBack.seccuss.voiceFile,
            voiceTaskId:callBack.seccuss.taskId,
            fileWord:'努力加载中......',
            entityPath:'',
            contShow:'voice',
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
  },
  selectImg:function(){
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        //res.tempFilePaths 返回图片本地文件路径列表
        var tempFilePaths = res.tempFilePaths;
        that.setData({
          entityPath: tempFilePaths[0]
        })
        that.loadImg();
      }
    })
  },
  loadImg: function () {
    var that = this;
    // 动态加载图
    this.setData({
      loadingHidden:false,
    })

    wx.uploadFile({
      url: conf.uploadFileWordUrl,
      filePath: that.data.entityPath,
      name: "file",
      headers: {
        'Content-Type': 'form-data'
      },
      success: function (res) {
        console.log(res);
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
            voicePath:'',
            voiceTaskId:'',
            fileWord:callBack.seccuss.words_result,
            contShow:'entity',
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
