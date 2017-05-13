// pages/personal/personal.js
var AV = require('../../utils/av-weapp-min.js')
var app = getApp()
Page({
  data: {
    userStatus: null,
    user_id: null,
    user_name: null,
    oldPassword: '',//旧密码
    newPassword1: '',//新密码1
    newPassword2: '',//新密码2
    display1: '',
    display2: 'none',
  },

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  bindDateChange: function (e) {
    this.setData({
      day: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },

  getUserName: function () {
    var that = this;
    var user_id = this.data.user_id;
    var userStatus = this.data.userStatus;
    if (userStatus == 'student') {
      var query = new AV.Query('Student')
        .equalTo('stu_id', user_id)
        .find().then(function (data) {
          console.log('getUserName student:' + data[0]._serverData.stu_name);
          that.setData({
            user_name: data[0]._serverData.stu_name
          });
        }).catch(error => console.error(error.message));
    } else {
      var query = new AV.Query('Teacher')
        .equalTo('tea_id', user_id)
        .find().then(function (data) {
          console.log('getUserName teacher:' + data[0]._serverData.tea_name);
          that.setData({
            user_name: data[0]._serverData.tea_name
          });
        }).catch(error => console.error(error.message));
    }
  },

  oldPassword: function (e) {
    //用户输入密码
    this.setData({
      oldPassword: e.detail.value
    })
  },

  newPassword1: function (e) {
    //用户输入密码
    this.setData({
      newPassword1: e.detail.value
    })
  },

  newPassword2: function (e) {
    //用户输入密码
    this.setData({
      newPassword2: e.detail.value
    })
  },

  changePassword: function () {
    this.setData({
      display1: 'none',
      display2: '',
      oldPassword: '',//旧密码
      newPassword1: '',//新密码1
      newPassword2: '',//新密码2
    });
  },

  cancel: function () {
    this.setData({
      display1: '',
      display2: 'none',
      oldPassword: '',//旧密码
      newPassword1: '',//新密码1
      newPassword2: '',//新密码2
    });
  },

  confirmChange: function () {
    var that = this;
    var user_id = this.data.user_id;
    var userStatus = this.data.userStatus;
    var oldPassword = this.data.oldPassword;
    var newPassword1 = this.data.newPassword1;
    var newPassword2 = this.data.newPassword2;
    var query = null;
    if (userStatus == 'student') {
      query = new AV.Query('Student');
      query.equalTo('stu_id', user_id);
    } else {
      query = new AV.Query('Teacher');
      query.equalTo('tea_id', user_id);
    }
    query.equalTo('password', oldPassword);
    console.log('跳转user_id:' + this.data.user_id + ',password:' + this.data.password);
    query.find().then(function (data) {
      console.log(data);
      if (data.length == 0) {
        wx.showModal({
          content: '旧密码错误，请重新输入',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              that.setData({
                oldPassword: '',//旧密码
                newPassword1: '',//新密码1
                newPassword2: '',//新密码2
              });
            }
          }
        })
      } else if (oldPassword == newPassword1 && newPassword1 == newPassword2) {
        wx.showModal({
          content: '新密码与旧密码一致，请重新输入',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              that.setData({
                oldPassword: '',//旧密码
                newPassword1: '',//新密码1
                newPassword2: '',//新密码2
              });
            }
          }
        })
      } else if (newPassword1 == '' && newPassword2 == '') {
        wx.showModal({
          content: '新密码为空请重新输入',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              that.setData({
                oldPassword: '',//旧密码
                newPassword1: '',//新密码1
                newPassword2: '',//新密码2
              });
            }
          }
        })
      } else if (newPassword1 != newPassword2) {
        wx.showModal({
          content: '新密码两次输入不一致，请重新输入',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              that.setData({
                oldPassword: '',//旧密码
                newPassword1: '',//新密码1
                newPassword2: '',//新密码2
              });
            }
          }
        })
      } else {
        var obj = data[0];
        obj.set('password', newPassword1);
        wx.showToast({
          title: '密码修改成功',
          icon: 'success',
          duration: 2000
        })
        that.setData({
          oldPassword: '',//旧密码
          newPassword1: '',//新密码1
          newPassword2: '',//新密码2
        });
        return obj.save();
      }
    }).catch(function (error) {
      // 这个错误处理函数将被调用，错误信息是 '出错啦'.
      console.error(error.message);
    });
  },

  Logout: function () {
    var userStatus = this.data.userStatus;
    var user_id = this.data.user_id;
    var query = null;
    wx.showModal({
      title: '提示',
      content: '确定退出登录？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          if (userStatus == 'student') {
            query = new AV.Query('Student');
            query.equalTo('stu_id', user_id);
          } else {
            query = new AV.Query('Teacher');
            query.equalTo('tea_id', user_id);
          }
          query.find().then(function (data) {
            var obj = data[0];
            obj.set('login', false);
            app.globalData.user_id = null;
            app.globalData.userStatus = null;
            wx.reLaunch({
              url: '/pages/login/login'
            })
            return obj.save();
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    console.log('app userStatus:' + app.globalData.userStatus);
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      userStatus: app.globalData.userStatus,
      user_id: app.globalData.user_id
    })
    console.log("sign_userStatus:" + this.data.userStatus);
    this.getUserName();
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