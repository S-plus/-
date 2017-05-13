// pages/course/course.js
var AV = require('../../utils/av-weapp-min.js')
var app = getApp()
Page({
  data: {
    userStatus: null,
    user_id: null,
    course: [],
  },

  getCourse: function () {
    var that = this;
    var userStatus = this.data.userStatus;
    var user_id = this.data.user_id;
    if (userStatus == 'student') {
      var query = new AV.Query('Student')
        .equalTo('stu_id', user_id)
        .find().then(function (data) {
          console.log('getCourse student:' + data);
          return new AV.Query('Course')
            .equalTo('class_id', data[0]._serverData.class_id)
            .ascending('course_id')
            .find().then(function (data) {
              console.log('student course:' + data);
              that.setData({
                course: data
              });
            }).catch(error => console.error(error.message));
        }).catch(error => console.error(error.message));
    } else {
      var query = new AV.Query('Course')
        .equalTo('tea_id', user_id)
        .ascending('course_id')
        .find().then(function (data) {
          that.setData({
            course: data
          });
        }).catch(error => console.error(error.message));
    }
  },

  chooseCourse: function (e) {
    var that = this;
    var course_id = e.currentTarget.id;
    console.log('course chooseCourse:' + course_id);
    app.globalData.course_id = course_id;
    wx.navigateTo({
      url: '/pages/detail/detail',
      success: function () {
        app.globalData.user_id = that.data.user_id;
        console.log("userStatus:" + app.globalData.userStatus + ',user_id:' + app.globalData.user_id);
      }
    })
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      userStatus: app.globalData.userStatus,
      user_id: app.globalData.user_id
    });
    this.getCourse();
  },

  onReady: function () {
    // 页面渲染完成
  },

  onShow: function () {
    // 页面显示
  },

  onHide: function () {
    // 页面隐藏
  },

  onUnload: function () {
    // 页面关闭
  }
})