//index.js
//获取应用实例
const app = getApp()
var amapFile = require('../../libs/amap-wx.js')
var config = require('../../libs/config.js');

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userLocation: {},
    address: '',
    weather: {}
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      // url: '../logs/logs'
    })
  },
  onLoad: function () {
    this.getUserLocation()
    this.getWeatherInfo()

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
  getUserLocation: function() {
    wx.getSetting ({
      success: res => {
        if (res.authSetting['scope.userLocation']) {
          wx.getLocation({
            success: res => {
              app.globalData.userLocation = res
              this.setData({
                userLocation: res
              })
            }
          })
        } else {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              wx.getLocation({
                success: res => {
                  const latitude = res.latitude
                  const longitude = res.longitude
                  const speed = res.speed
                  const accuracy = res.accuracy
                  app.globalData.userLocation = res
                  this.setData({
                    userLocation: res
                  })
                }
              })
            }
          })
        }
      }
    })

    const that = this;
    var myAmapFun = new amapFile.AMapWX({ key: config.Config.key })
    myAmapFun.getRegeo({
      success: function (res) {
        that.setData({
          address: res[0].regeocodeData.formatted_address
        })
        console.log("address is" + res[0].regeocodeData.formatted_address)
      },
    })
  },
  getWeatherInfo: function () {
    var that = this;
    var myAmapFun = new amapFile.AMapWX({ key: config.Config.key });
    myAmapFun.getWeather({
      success: function (data) {
        that.setData({
          weather: data
        });
      },
      fail: function (info) {
        // wx.showModal({title:info.errMsg})
      }
    })
  },
  onPullDownRefresh: function() {
    console.log("pulldown refresh")
    this.getUserLocation()
    
    // wx.showNavigationBarLoading()
    setTimeout(function(){
      console.log("timeout happen")
      wx.stopPullDownRefresh()
      // wx.hideNavigationBarLoading()
      
    }, 1000*10)
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '欢迎使用我的天气',
      path: '/page/index'
    }
  }
})
