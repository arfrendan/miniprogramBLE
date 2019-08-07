//index.js
//获取应用实例
const app = getApp()
var deviceID = ''
var serviceID = ''
var characteristicsID = ''
var devices  = []
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}
Page({
  data: {
    motto: 'Hello World ',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    time: (new Date()).toString(),
    devices: [],
    chosenName:"now device is",
    chosenID:""
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  clickMe: function () {
    this.setData({ motto: "Hello World" })
  },
  setdevice: function(event){
    var that = this;
    var nowDevice = event.currentTarget.dataset.name;
    var nowID = event.currentTarget.dataset.id;
    that.setData({ chosenName: nowDevice });
    that.setData({ chosenID: nowID });
    deviceID = nowID;
  },
  openblue: function(){
    var that = this 
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log(res);
        that.setData({ motto: "开启蓝牙：" + res.errMsg });
        wx.startBluetoothDevicesDiscovery({
          success: function (res) {
            console.log(res);
            that.setData({ motto: "开启蓝牙：扫描成功：" });
          },
          fail: function (res) {
            that.setData({ motto: "开启蓝牙：扫描失败：" + res.errMsg });
          }
        })
      }
      , fail: function (res) {
        that.setData({ motto: "蓝牙开启失败：" + res.errMsg });
      } 

    })
  },

  rspiconnect:function(){
    var that = this;
    wx.openBluetoothAdapter({
      success: function(res) {
        wx.startBluetoothDevicesDiscovery({
          success: function(res) {
            wx.getBluetoothDevices({
              success: function(res) {
                setTimeout(function(){
                  console.log(res.devices);
                  that.setData({ devices: res.devices })
                  for (var i in that.data.devices) {
                    console.log(that.data.devices[i]);
                    //console.log(i.name);
                    if (that.data.devices[i].name == 'raspberrypi') {
                      that.data.chosenID = that.data.devices[i].deviceId;
                      var name = that.data.devices[i].name;
                      console.log(that.data.chosenID);
                      wx.createBLEConnection({
                        deviceId: that.data.chosenID,
                        success: function (res) {
                          wx.stopBluetoothDevicesDiscovery({
                            success: function (res) {
                              console.log('scanning stop')
                              wx.navigateTo({ url: '/pages/connected/connected?deviceID=' + that.data.chosenID +'&deviceName='+name});
                            },
                          })
                        },
                      })
                    }
                  }
                },1000)
                
                
              },
            })
          },
        })
      },
    }) 
  },
  getallblue: function () {
    var that = this;
    wx.getBluetoothDevices({
      success: function (res) {
        console.log(res)
        that.setData({devices: res.devices})
        for (var i in res.devices) {
          console.log(ab2hex(i.advertisData))
        }
      }
    })
  },

  
  
  connect: function(){
    var that = this;
    var nowDevice = deviceID;
   
    wx.createBLEConnection({
      deviceId: nowDevice,
      
      success(res) {
        console.log(res)
        wx.stopBluetoothDevicesDiscovery({
          success: function(res) {
            console.log('scanning stop')
            wx.navigateTo({ url: '/pages/connected/connected?deviceID=' + nowDevice});
            },
        })
      },
      fail(res){
        console.log(res)
      }
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
  }
})
