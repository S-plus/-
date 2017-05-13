// pages/login/login.js
var AV = require('../../utils/av-weapp-min.js')
var app = getApp()
Page({
  data: {
    focus: false,//焦点
    inputValue: '',//输入值
    input: null,//输入框判断
    user_id: "",//用户id
    password: "",//用户密码
    accountValue: "",
    passwordValue: "",
    display1: "",
    display2: 'none',
  },

  //用户输入帐号
  accountInput: function (e) {
    this.setData({
      user_id: e.detail.value
    })
  },

  //用户输入密码
  passwordInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },

  //选择学生登陆
  studentLogin: function () {
    app.globalData.userStatus = "student";
    this.setData({
      display1: 'none',
      display2: '',
    });
  },
  //选择教师登陆
  teacherLogin: function () {
    app.globalData.userStatus = "teacher";
    this.setData({
      display1: 'none',
      display2: '',
    });
  },

  returnIdentity: function () {
    this.setData({
      display1: '',
      display2: 'none',
    });
    console.log(this.data.display1,this.data.display2);
  },

  //登陆
  Login: function () {
    var that = this;
    var userStatus = app.globalData.userStatus;
    var query = null;
    var cql = null;
    if (userStatus == 'student') {
      query = new AV.Query('Student');
      query.equalTo('stu_id', this.data.user_id);
    } else {
      query = new AV.Query('Teacher');
      query.equalTo('tea_id', this.data.user_id);
    }
    query.equalTo('password', this.data.password);
    console.log('跳转user_id:' + this.data.user_id + ',password:' + this.data.password);
    query.find().then(function (data) {
      console.log(data);
      //判断是否存在用户
      if (data.length == 0) {
        wx.showModal({
          content: '用户帐号或者密码错误，请重新输入',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              that.setData({
                user_id: '',
                password: '',
                accountValue: '',
                passwordValue: ''
              });
            }
          }
        })
      }
      //判断用户是否登陆 
      else if (data[0]._serverData.login == true) {
        wx.showModal({
          content: '该用户已登录',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              that.setData({
                user_id: '',
                password: '',
                accountValue: '',
                passwordValue: ''
              });
            }
          }
        })
      } else {
        console.log(that.data.user_id);
        var obj = data[0];
        //设置登陆状态
        obj.set('login', true);
        if (userStatus == 'student') {
          console.log("学生登录跳转");
        } else {
          console.log("教师登录跳转");
        }
        console.log('success user_id:' + that.data.user_id);
        //跳转到sign页
        wx.switchTab({
          url: '/pages/sign/sign',
          success: function () {
            app.globalData.user_id = that.data.user_id;
            console.log("userStatus:" + app.globalData.userStatus + ',user_id:' + app.globalData.user_id);
          }
        })
        return obj.save();
      }
    }).catch(function (error) {
      // 这个错误处理函数将被调用，错误信息是 '出错啦'.
      console.error(error.message);
    });
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
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