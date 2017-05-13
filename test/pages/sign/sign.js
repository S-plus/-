//sign.js
var AV = require('../../utils/av-weapp-min.js')
var app = getApp()
Page({
  data: {
    latitude: null,//经度
    longitude: null,//纬度
    getLocation: null,//获取经纬度是否成功标志
    signstate: null,//签到状态标志
    user_id: null,//用户帐号
    userStatus: null,//用户身份
    signcheck: false,//签到检查标志
    cr_id: null,//教室id
    cr_name:null,//教室名
    //course_id: null,//课程id
    class_id: null,//班级id
    student: [],//学生信息
    second: 2,//
    lastTime: 180,//剩余时间
    lastTime_:0,//上一次的查询时间
    signresults: [],//查询结果
    signtime: null,//时间标记
    courseName: null,//课程名
    display1: '',//教师考勤界面显示标志
    display2: 'none',
    notSignPopulation: 0,//未签到人数
    signedPopulation: 0,//已签到人数
    notSign: [],//未签到的学生名单
    signed: [],//已签到的学生名单
    _classRoomArray: ['禹州312', '禹州316', '陆大214', '陆大216'],
    _lastTime: [1, 2, 3, 4, 5],
    index1: 0,
    index2: 2,
    classRoomArray: [
      {
        name: '禹州312',
        cr_id: 'cr001'
      },
      {
        name: '禹州316',
        cr_id: 'cr002'
      },
      {
        name: '陆大214',
        cr_id: 'cr003'
      },
      {
        name: '陆大216',
        cr_id: 'cr004'
      }
    ],
  },

  bindPickerChange: function (e) {
    var classroomarry = this.data.classRoomArray;
    var i = e.detail.value;
    this.setData({
      index1: i,
      cr_id: classroomarry[i].cr_id,//修改教室
      cr_name:classroomarry[i].name
    });
  },

  bindPickerDuration: function (e) {
    var lasttime = this.data._lastTime;
    this.setData({
      index2: e.detail.value,
      lastTime: (lasttime[e.detail.value] * 60),
      lastTime_:(lasttime[e.detail.value] * 60),
    });
  },

  //获取当前日期（周一~周日）及当前所属时间段（am,pm）
  getDayTime: function () {
    var date = new Date();
    var day = date.getDay();
    var time = date.getHours();
    var daytime = null;
    switch (day) {
      case 0:
        daytime = "周日";
        break;
      case 1:
        daytime = "周一";
        break;
      case 2:
        daytime = "周二";
        break;
      case 3:
        daytime = "周三";
        break;
      case 4:
        daytime = "周四";
        break;
      case 5:
        daytime = "周五";
        break;
      case 6:
        daytime = "周六";
        break;
      default:
        break;
    };
    if (time < 12) {
      daytime = daytime + "上午";
    } else {
      daytime = daytime + "下午";
    }
    console.log("daytime:" + daytime);
    return daytime;
  },

  //倒计时
  countdown: function (second) {
    var that = this;
    var identity = that.data.userStatus;
    //var lastTime_ = that.data.lastTime_;
    //console.log('second:' + second);
    if (second == 0) {
      if (identity == 'student') {
        that.setData({
          signcheck: false
        });
      } else {
        that.setData({
          signcheck: true,
          //lastTime:lastTime_,
        });
      }
      return;
    }
    var time = setTimeout(function () {
      that.setData({
        lastTime: second - 1
      });
      that.countdown((second - 1));
    }
      , 1000)
  },

  //获取课程及教室id
  getCourse: function () {
    console.log('getCourse function');
    var that = this;
    var classroomarry = this.data.classRoomArray;
    var user_id = this.data.user_id;//获取当前用户id
    var cr_id = null;
    var identity = this.data.userStatus;//当前用户身份
    var datetime = this.getDayTime();
    //var datetime = '周一上午';//当前时间段
    //用户为教师时获取课程、教室id及学生id列表
    if (identity == 'teacher') {
      return new AV.Query('Course')
        .equalTo('course_time', datetime)
        .equalTo('tea_id', user_id)
        .find().then(function (data) {
          console.log('getCourse teacher:' + data);
          if (data.length != 0) {
            app.globalData.course_id = data[0]._serverData.course_id;
            app.globalData.course_name = data[0]._serverData.course_name;
            that.setData({
              signcheck: true,
              //course_id: data[0]._serverData.course_id,//获取当前课程
              cr_id: data[0]._serverData.cr_id,//获取课程教室id
              cr_name:data[0]._serverData.cr_name,//获取教室名
              courseName: app.globalData.course_name,
            });
            cr_id = data[0]._serverData.cr_id;
            for (var i = 0; i < classroomarry.length; i++) {
              if (cr_id == classroomarry[i].cr_id) {
                that.setData({
                  index1: i
                });
                //修改picker-view显示
              }
            }
            return new AV.Query('Student')
              .equalTo('class_id', data[0]._serverData.class_id)
              .find().then(function (data) {
                console.log('class_id select:' + data);
                that.setData({
                  student: data//获取当前课程的学生id
                });
                console.log('student:' + that.data.student);
              }).catch(error => console.error(error.message));
          }
        }).catch(error => console.error(error.message));
    }
    //用户为学生时获取获取当前课程id
    else {
      return new AV.Query('Student')
        .equalTo('stu_id', user_id)
        .find()
        .then(function (data) {
          return new AV.Query('Course')
            .equalTo('course_time', datetime)
            .equalTo('class_id', data[0]._serverData.class_id)
            .find()
            .then(function (data) {
              if(data.length != 0){
                courseName: data[0]._serverData.course_name,
                app.globalData.course_id = data[0]._serverData.course_id;
              }
            }).catch(error => console.error(error.message));
        }).catch(error => console.error(error.message));
    }
  },

  //检查当前是否有正在进行的考勤
  signCheck: function () {
    console.log('signCheck Function');
    var that = this;
    var date = new Date();
    var user_id = this.data.user_id;
    var identity = this.data.userStatus;//当前用户身份    
    var course_id = app.globalData.course_id;
    console.log('signCheck course_id:' + course_id);
    var passTime = null;
    var query = new AV.Query('Sign');
    if (course_id != null) {
      if (identity == 'student') {
        query.equalTo('stu_id', user_id);//学生状态下只查询该学生的记录
      } else {
        query.equalTo('course_id', course_id);//教师状态下查询当前课程的记录
      }
      query.descending('signup_time');
      query.first().then(function (data) {//查询最新的签到记录
        console.log('signCheck data:' + data);
        passTime = (date - data._serverData.signup_time) / 1000;
        if ((identity == 'student') && (data._serverData.sign_state == true)) {
          //已签到的情况下
          that.setData({
            signcheck: false,
          });
        }
        else if (passTime < data._serverData.sign_duration) {//如果过去时间小于签到时长，则存在正在进行的签到
          that.setData({
            signcheck: true,
            display1: 'none',//当前存在正在进行的签到，不可发起新的签到
            display2: '',
            signtime: data._serverData.signup_time,
            lastTime: Math.round(data._serverData.sign_duration - passTime),//剩余时间赋值
          });
          that.countdown(Math.round(data._serverData.sign_duration - passTime));
          console.log('signCheck showSignResults course_id:' + app.globalData.course_id);
          that.showSignResults();//显示考勤结果
        } else {
          //教师状态下，当前无正在进行的签到，可发起签到
          that.setData({
            display1: '',
            display2: 'none',
          });
        }
      }).catch(function (error) {
        console.error(error.message);
      });
    }
  },

  //签到
  Sign: function () {
    var that = this;
    var user_id = this.data.user_id;
    var date = new Date();
    console.log('sign function signstate:' + this.data.signstate)
    if (this.data.signstate) {
      var query = new AV.Query('Sign')
        .equalTo('stu_id', user_id)
        .descending('signup_time')
        .first().then(function (data) {
          console.log(data);
          var obj = data;
          obj.set('signin_time', date);
          obj.set('sign_state', true);
          wx.showToast({
            title: '签到成功',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            signcheck: false
          });
          return obj.save().then(function (data) { console.log('sign success') });
        }).catch(error => console.error(error.message));
    } else if (this.data.signstate == false && this.data.getLocation == true) {
      wx.showModal({
        content: '签到地点错误，请到指定教室后刷新页面重试',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定');
          }
        }
      });
    } else {
      wx.showModal({
        content: '无法获取地理信息，请刷新页面并授权',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定');
          }
        }
      });
    }
  },

  //通过获取当前位置判断是否签到成功
  getLocation: function (location) {
    var that = this
    //var date = new Date();
    //var signstate = null;
    console.log('getLocation');
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        that.setData({
          getLocation: true,
          latitude: res.latitude,
          longitude: res.longitude,
        })
        if (
          //位置判断举例
          (res.latitude >= location[0] && res.latitude <= location[1]) &&
          (res.longitude >= location[2] && res.longitude <= location[3])
        ) {
          //signstate = true;
          //console.log('w1' + signstate);
          that.setData({
            signstate: true//签到成功            
          });
          console.log('signstate in function:' + that.data.signstate);
        } else {
          //signstate = false;
          that.setData({
            signstate: false//签到位置错误导致的签到失败
          });

        }
        //console.log(that.data.signstate)
      },
      fail: function () {
        //signstate = false;
        that.setData({
          getLocation: false,
          signstate: false//无法获取位置导致的失败
        });
      }
    })
  },

  //位置判断
  locationJudging: function () {
    var that = this;
    var user_id = this.data.user_id;
    var date = new Date();
    if (this.data.signcheck == true) {
      return new AV.Query('Sign')
        .equalTo('stu_id', user_id)
        .descending('signup_time')
        .first().then(function (data) {//查询最新的签到记录
          console.log('locationJudging find Sign:'+data);
          return new AV.Query('Classroom')
            .equalTo('cr_id', data._serverData.cr_id)
            .find().then(function (data) {
              console.log('step1:' + data);
              that.getLocation(data[0]._serverData.cr_location);//位置匹配  
            }).then(function (data) {

            }).catch(function (error) {
              console.error(error.message);
            });
        }).catch(function (error) {
          console.error(error.message);
        });
    }
  },

  //签到时间写入及修改签到状态
  signIn: function (that) {
    var date = new Date();
    var user_id = that.data.user_id;
    //var course_id = that.data.course_id;
    var course_id = app.globalData.course_id;
    var query = new AV.Query('Sign')
      .equalTo('stu_id', user_id)
      .equalTo('course_id', course_id)
      .descending('signup_time')
      .first().then(function (data) {
        console.log('signin:' + data);
        var obj = data;
        obj.set('signin_time', date);
        obj.set('sign_state', true);
        wx.showModal({
          content: '签到成功！',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              //自动刷新当前页面
              that.setData({
                signcheck: false
              });
            }
          }
        });
        return obj.save();
      }).catch(error => console.error(error.message));
  },

  //发起签到
  requestSign: function () {
    var that = this;
    that.setData({
      notSign: [],//清空上一轮的考勤结果
      signed: [],
    });
    if(this.data.lastTime == 0 && this.data.lastTime_ == 0){
      //教师未设置签到时长，默认为3分钟
      var duration = 180;
    }else if(this.data.lastTime == 0 && this.data.lastTime_ != 0){
      var duration = this.data.lastTime_;//教师在签到页面待到倒计时结束，如果没有重新设置签到时长，则用上一次的签到时长
    }else{
      var duration = this.data.lastTime;//存在新的签到时长
    }
    var cr_id = this.data.cr_id;//教室id
    var cr_name = this.data.cr_name;
    var course_id = app.globalData.course_id;
    var course_name = app.globalData.course_name;
    var date = new Date();//获取当前时间
    var student = this.data.student;
    var i = 0;
    console.log('student[0]:' + student[0]);
    console.log('requestSign student:' + student);
    this.setData({
      display1: 'none',
      display2: '',
      signtime: date,//记录发起签到的时间
    });
    this.countdown(duration);
    var Sign = AV.Object.extend('Sign');
    for (i = 0; i < student.length; i++) {
      //console.log('for:'+student[0].stu_id);
      var stu_id = student[i]._serverData.stu_id;
      var stu_name = student[i]._serverData.stu_name;
      console.log('for stu_id:' + stu_id);
      console.log('setTimeout stu_id:' + stu_id);
      var sign = new Sign();
      sign.set('course_id', course_id);//课程id
      sign.set('course_name', course_name);//课程id
      sign.set('stu_id', stu_id);
      sign.set('stu_name', stu_name);
      console.log('i=' + i);
      sign.set('cr_id', cr_id);
      sign.set('cr_name', cr_name);
      sign.set('signup_time', date);
      sign.set('sign_duration', duration);
      sign.save().catch(error => console.error(error.message));
    }
    console.log('for end');
    setTimeout(function () {
      that.showSignResults()
    }, 1000);
    //this.showSignResults();
  },

  //签到结果显示
  showSignResults: function () {
    var that = this;
    var date = that.data.signtime;
    var course_id = app.globalData.course_id;
    console.log('showSignResults course_id:' + course_id);
    var notSign = [];//未签到的学生名单
    var signed = [];//已签到的学生名单

    var i = 0;
    var query = new AV.Query('Sign')
      .equalTo('course_id', course_id)
      .equalTo('signup_time', date)
      .equalTo('sign_state', true)
      .ascending('stu_id')
      .find().then(function (data) {
        console.log('showSignResults true:' + data);
        if (data.length != 0) {
          that.setData({
            signed: data
          });
        }
      }).catch(error => console.error(error.message));

    query = new AV.Query('Sign')
      .equalTo('course_id', course_id)
      .equalTo('signup_time', date)
      .equalTo('sign_state', false)
      .ascending('stu_id')
      .find().then(function (data) {
        console.log('showSignResults false:' + data);
        if (data.length != 0) {
          that.setData({
            notSign: data
          });
        }
      }).catch(error => console.error(error.message));
  },

  onLoad: function () {
    // 页面载入时传递当前用户身份
    this.setData({
      userStatus: app.globalData.userStatus,
      user_id: app.globalData.user_id
    })
    this.getCourse();
    this.signCheck();
    //status = app.globalData.userStatus;
    console.log("sign_userStatus:" + this.data.userStatus);
    if (this.data.userStatus == 'student') {
      this.signCheck();
      this.locationJudging();
      //this.countdown(this);   
    } else {
      this.signCheck();
      //this.showSignResults();
    }
  },

  onReady: function () {
    // 页面渲染完成
  },

  onShow: function () {
    // 页面显示
    this.setData({
      userStatus: app.globalData.userStatus,
      user_id: app.globalData.user_id
    })
    this.getCourse();
    console.log("sign_userStatus:" + this.data.userStatus);
    if (this.data.userStatus == 'student') {
      this.signCheck();
      this.locationJudging();
      //this.countdown(this);   
    } else {
      this.signCheck();
      //this.showSignResults();
    }
  },

  onPullDownRefresh: function () {
    //页面刷新
    wx.showToast({
      title: '刷新中...',
      icon: 'loading',
      duration: 1000
    })
    this.setData({
      userStatus: app.globalData.userStatus,
      user_id: app.globalData.user_id
    })
    this.getCourse();
    this.signCheck();
    //status = app.globalData.userStatus;
    console.log("sign_userStatus:" + this.data.userStatus);
    if (this.data.userStatus == 'student') {
      this.signCheck();
      this.locationJudging();
      //this.countdown(this);   
    } else {
      this.signCheck();
      //this.showSignResults();
    }
  },

  onHide: function () {
    // 页面隐藏
  },

  onUnload: function () {
    // 页面关闭
  }
})