//app.js
const AV = require('utils/av-weapp-min.js');
App({
  globalData: {
    //全局变量
    userInfo: null,
    userStatus: null,
    user_id: null,
    course_id:null,
    course_name:null,
  },
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  onHide: function () {
    //隐藏页面时退出登录并修改数据库字段
    var that = this;
    var userStatus = this.globalData.userStatus;
    var user_id = this.globalData.user_id;
    var query = null;

    if (userStatus == 'student') {
      query = new AV.Query('Student2');
      query.equalTo('stu_id', user_id);
    } else {
      query = new AV.Query('Teacher');
      query.equalTo('tea_id', user_id);
    }
    query.find().then(function (data) {
      var obj = data[0];
      obj.set('login', false);
      that.globalData.user_id = null;
      that.globalData.userStatus = null;
      wx.reLaunch({
        url: '/pages/login/login'
      })
      return obj.save();
    })
  },

  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  }
})
// LeanCloud 应用的 ID 和 Key
AV.init({
  appId: '0bwcCyTG1WSQesliTfgMCIQO-gzGzoHsz',
  appKey: 'x4W4u4z1bj5JdVW466V8qujp',
});
