// pages/connected/connected.js
var base64arraybuffer = require('../../utils/base64-arraybuffer')
var gb2312ToBase64 = require('../../utils/gb2312ToBase64')
var deviceID =''
function stringToBuffer(string){
  let data_base64 = gb2312ToBase64.encode64(string);
  let buffer = base64arraybuffer.decode(data_base64);
  return buffer;
}
function bufferToString(buffer){
  let data_base64 = base64arraybuffer.encode(buffer);
  let string = gb2312ToBase64.decode64(data_base64);
  return string;
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chosenName: "now device is",
    chosenID: "",
    serviceUUID: "",
    characteristicsUUID:"",
    show: false,
    receiveData: "",
    writeContent:"",
    
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({ chosenID: options.deviceID,chosenName: options.deviceName})
    
    wx.getBLEDeviceServices({
      deviceId: options.deviceID,
      success(res) {
        console.log('device services:', res.services)
        that.setData({serviceUUID: res.services[0].uuid})
        wx.getBLEDeviceCharacteristics({
          deviceId : options.deviceID,
          serviceId: res.services[0].uuid,
          success(res) {
            console.log('device getBLEDeviceCharacteristics:', res.characteristics)
            that.setData({ characteristicsUUID: res.characteristics[0].uuid })
            wx.notifyBLECharacteristicValueChange({
              state: true,
              deviceId: that.data.chosenID,
              serviceId: that.data.serviceUUID,
              characteristicId: that.data.characteristicsUUID,
              success(res) {
                console.log('notifyBLECharacteristicValueChange success', res.errMsg)
              }
            })
          }
        })
      }
    })
  },
  formSubmit: function(e){
    var that = this;
    let data = e.detail.value.input
    let buffer = stringToBuffer(data)
    wx.writeBLECharacteristicValue({
      deviceId: that.data.chosenID,
      serviceId: that.data.serviceUUID,
      characteristicId: that.data.characteristicsUUID,
      value: buffer,
      success(res) {
        console.log('writeBLECharacteristicValue success', res.errMsg)
      }
    })
  },
  
  
  changeState: function(){
    var that = this;
    let data = 'change';
    let buffer = stringToBuffer(data)
    
    wx.writeBLECharacteristicValue({
      deviceId : that.data.chosenID,
      serviceId : that.data.serviceUUID,
      characteristicId : that.data.characteristicsUUID,
      value: buffer,
      success(res) {
        console.log('writeBLECharacteristicValue success', res.errMsg)
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    wx.onBLECharacteristicValueChange(function (res) {
      console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
      let recData = bufferToString(res.value)
      that.setData({receiveData: recData});
      that.setData({show: true});
    })
  },

  onClose() {
    this.setData({ show: false });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})