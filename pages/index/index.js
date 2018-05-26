//index.js
//获取应用实例
const encoding = require("../../lib/encoding.js");
const app = getApp()

Page({
  data: {
    motto: 'Afterglow',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
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
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  bindScanner: function () {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        let result = wx.base64ToArrayBuffer(res["result"]);
        let string_json = new encoding.TextDecoder("utf-8").decode(result);

        let QRjson = JSON.parse(string_json);
        let name = QRjson['name'];
        let id_code = QRjson['identification_code'];
        console.log(name);
        console.log(id_code);

        wx.request({
          url: 'https://afterglow-api.eriri.ac.cn/auth/check_id_code',
          data: { id_code: res["result"] },
          success: (res) => {
            let data = res.data;
            let msg = data['msg'];
            console.log(msg);
            if (msg == "Validated") {
            wx.showModal({
              title: '扫描结果',
              content: "你好！" + name +"\r\n身份认证通过"
            })
            }
            else if (msg == "Not validated") {
              wx.showModal({
                title: '扫描结果',
                content: "你好！" + name + "\r\n验证未通过，请尝试更新验证码"
              })
            }
          }
        })
      }
    })
  },


  bindNFC: function () {
    wx.startHCE({
      aid_list: ['F222222222'],
      success: function (res) {
        console.log(res.errMsg);
        wx.onHCEMessage(function (res) {
          if (res.messageType === 1) {
            wx.showModal({
              title: 'NFC数据',
              content: encoding.TextEncoder("utf-8").encode(res.data)
            })
          }
        })
      }
    })
  },

  bindQR: function () {

  }
})
