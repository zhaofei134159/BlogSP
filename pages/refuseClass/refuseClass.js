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
    citySelect:{},
    cityIndex:'0',
    inputSearchInfo:'',
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
    var city = [
            {'city_id':'110000','city_name':'北京市'},
            {'city_id':'310000','city_name':'上海市'},
            {'city_id':'330200','city_name':'宁波市'},
            {'city_id':'440300','city_name':'深圳市'},
            {'city_id':'610100','city_name':'西安市'}
        ];
    this.setData({
      citySelect: city
    })
  },
  bindPickerChange:function(e){
    this.setData({
      cityIndex: e.detail.value
    })
  },
  setInput:function(e){
    this.setData({
      inputSearchInfo: e.detail.value
    })
  },
  inputSearch:function(){
    var search = this.data.inputSearchInfo;
    var that = this;
    // 上传文件
    this.setData({
      loadingHidden:false,
    })

    util.request({
        url:conf.searchWordUrl,
        data:{'search':search,'cityId':this.data.citySelect[this.data.cityIndex].city_id},
        method:'get',
        header:{'content-type': 'application/json'},
        success: function (res) {
          // 上传文件
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
            that.setData({
              voicePath:'',
              fileWord:callBack.success.garbage_info,
              entityPath:'',
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
  // 导航点击切换内容
  navTap:function(event){
    var title = event.currentTarget.dataset.title;
    this.setData({
        contShow: title,
    });
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
      encodeBitRate: 96000,
      format: 'mp3',
      frameSize: 50,
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
  // 选择图片上传
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
        // 上传文件
        that.uploadFileModel(tempFilePaths[0],'entity');
      }
    })
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
      formData: {'cityId':this.data.citySelect[this.data.cityIndex].city_id},
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
          if(type=='entity'){
            that.setData({
              voicePath:'',
              fileWord:callBack.success.garbage_info,
              entityPath:callBack.success.imgFile,
              inputSearchInfo:'',
              contShow:'entity',
            })
          }else{
            that.setData({
              voicePath:callBack.success.voiceFile,
              fileWord:callBack.success.garbage_info,
              entityPath:'',
              inputSearchInfo:'',
              contShow:'voice',
            })
          }
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
  // 播放
  voicePlayback: function () {
    var that = this;
    if(this.data.isplay==false){
      myaudio.src = this.data.voicePath
      myaudio.play();
      myaudio.onPlay(() => {
        console.log('开始播放');
        that.setData({
            isplay: true,
        });
      })
      myaudio.onStop(() => {
        that.setData({
            isplay: false,
        });
      });
      myaudio.onEnded(() => {
        that.setData({
            isplay: false,
        });
      });
      myaudio.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
        that.setData({
            isplay: false,
        });
      })
    }else{ 
      myaudio.stop();
      this.setData({
          isplay: false,
      });
    }
  }
})
