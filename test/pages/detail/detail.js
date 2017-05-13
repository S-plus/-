// pages/detail/detail.js
var AV = require('../../utils/av-weapp-min.js')
var app = getApp()

const _date = new Date()

Page({
  data: {
    user_id: null,
    userStatus: null,
    course_id: null,
    course_name: null,
    record: [],
    date: _date.getFullYear() + '-' + (_date.getMonth() + 1) + '-' + _date.getDate(),
    dateNow: _date.getFullYear() + '-' + (_date.getMonth() + 1) + '-' + _date.getDate(),
    notSign: [],//未签到的学生名单
    signed: [],//已签到的学生名单
  },

  getCourseName: function () {
    var that = this;
    var course_id = this.data.course_id;
    var query = new AV.Query('Course')
      .equalTo('course_id', course_id)
      .find().then(function (data) {
        console.log()
        wx.setNavigationBarTitle({
          title: data[0]._serverData.course_name + '考勤记录'
        });
      }).catch(error => console.error(error.message));
  },

  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value,
    });
    this.getRecord();
  },

  getRecord: function () {
    var that = this;
    var date = new Date(this.data.date + ' 00:00:00');
    console.log('getRecord date:' + date);
    var datePlus = date;
    var dateSub = date;
    datePlus = datePlus.setDate(datePlus.getDate() + 1);
    datePlus = new Date(datePlus);
    dateSub = dateSub.setDate(dateSub.getDate() - 1);
    dateSub = new Date(dateSub);
    console.log('getRecord datePlus:' + datePlus);
    var user_id = this.data.user_id;
    var userStatus = this.data.userStatus;
    var course_id = this.data.course_id;
    if (userStatus == 'student') {
      var query = new AV.Query('Sign')
        .equalTo('stu_id', user_id)
        .equalTo('course_id', course_id)
        .descending('signup_time')
        .find().then(function (data) {
          console.log('getRecord student:' + data);
          that.setData({
            record: data
          });
        }).catch(error => console.error(error.message));
    } else {
      console.log('getRecord showSignResults course_id:' + course_id);
      var query = new AV.Query('Sign')
        .equalTo('course_id', course_id)
        .greaterThanOrEqualTo('signup_time', dateSub)
        .lessThanOrEqualTo('signup_time', datePlus)
        .equalTo('sign_state', true)
        .addDescending('signup_time')
        .addAscending('stu_id')
        .find().then(function (data) {
          console.log('showSignResults true:' + data);
          if (data.length != 0) {
            that.setData({
              signed: data
            });
          } else {
            that.setData({
              signed: []
            });
          }
        }).catch(error => console.error(error.message));
      query = new AV.Query('Sign')
        .equalTo('course_id', course_id)
        .greaterThanOrEqualTo('signup_time', dateSub)
        .lessThanOrEqualTo('signup_time', datePlus)
        .equalTo('sign_state', false)
        .addDescending('signup_time')
        .addAscending('stu_id')
        .find().then(function (data) {
          console.log('showSignResults false:' + data);
          if (data.length != 0) {
            that.setData({
              notSign: data
            });
          } else {
            that.setData({
              notSign: []
            });
          }
        }).catch(error => console.error(error.message));
    }
  },

  selectRecord: function (e) {
    var that = this;
    var objectId = e.currentTarget.id;
    var query = new AV.Query('Sign')
      .equalTo('objectId', objectId)
      .find().then(function (data) {
        if (data[0]._serverData.sign_state == true) {
          wx.showModal({
            content: '学号：' + data[0]._serverData.stu_id + ',姓名：' + data[0]._serverData.stu_name + ',发起签到时间：' + data[0]._serverData.signup_time + ',签到时间：' + data[0]._serverData.signin_time + ',签到状态：已签到',
            confirmText: '修改状态',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定');
                wx.showModal({
                  content: '确定修改学生签到状态？',
                  success: function (res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                      var obj = data[0];
                      obj.set('signin_time', null);
                      obj.set('sign_state', false);
                      return obj.save().then(function (data) {
                        wx.showToast({
                          title: '修改成功',
                          icon: 'success',
                          duration: 1000
                        });
                        that.getRecord();
                      }).catch(error => console.error(error.message));
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              }
            }
          })
        } else {
          wx.showModal({
            content: '学号：' + data[0]._serverData.stu_id + ',姓名：' + data[0]._serverData.stu_name + ',发起签到时间：' + data[0]._serverData.signup_time + ',签到状态：未签到',
            confirmText: '修改状态',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定');
                wx.showModal({
                  content: '确定修改学生签到状态？',
                  success: function (res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                      var obj = data[0];
                      obj.set('signin_time', _date);
                      obj.set('sign_state', true);
                      return obj.save().then(function (data) {
                        wx.showToast({
                          title: '修改成功',
                          icon: 'success',
                          duration: 1000
                        });
                        that.getRecord();
                      }).catch(error => console.error(error.message));
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              }
            }
          })
        }

      }).catch(error => console.error(error.message));
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      userStatus: app.globalData.userStatus,
      user_id: app.globalData.user_id,
      course_id: app.globalData.course_id,
    });
    this.getCourseName();
    this.getRecord();
  },

  onReady: function () {
    // 页面渲染完成
  },

  onShow: function () {
    // 页面显示
    this.setData({
      userStatus: app.globalData.userStatus,
      user_id: app.globalData.user_id,
      course_id: app.globalData.course_id,
    });
    this.getCourseName();
    this.getRecord();
  },

  onHide: function () {
    // 页面隐藏
  },

  onUnload: function () {
    // 页面关闭
  }
})