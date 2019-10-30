// var SA_URL = "https://my.saclass.com/businessService/centerCtrl/routeService.do"; //生产机
var SA_URL = "http://192.168.1.121:8091/"; //测试服务器119
//var SA_URL="http://192.168.1.115:8080/SAonline/centerCtrl/routeService.do";  //新晨
//var SA_URL="http://192.168.1.234/SAonline/centerCtrl/routeService.do"; //岳鹏
//var SA_URL="http://192.168.1.181:8080/SAonline/centerCtrl/routeService.do";//何翼
//var SA_URL="http://192.168.1.233:8091/SAonline/centerCtrl/routeService.do";//再飞

var WECHAT_APPID = "wxe034037e8bb6e1b3"

var userID = getCookie("userId");
var token = getCookie("token");
var role = getCookie("role");

if (userID != null && token != null) {
    setCookie("userId", userID, 2);
    setCookie("token", token, 2);
}

function getNoCodeURL() {
    var search = location.search;
    var noCodeUrl;
    if (search == "") {
        noCodeUrl = location.href;
    } else {
        noCodeUrl = location.href.split("?")[0];
        var param = "";
        search = search.slice(1);
        var arr = search.split("&");
        for (var i = 0; i < arr.length; i++) {
            var tmparr = arr[i].split("=");
            if (tmparr[0] != "code" && tmparr[0] != "state") {
                param += arr[i] + "&";
            }
        }
        param = param.slice(0, -1);
        if (param != "") {
            noCodeUrl += "?" + param;
        }
    }
    return noCodeUrl;
}

function showLoginQR() {
    //内嵌二维码方式：无需页面跳转
    var obj = new WxLogin({
        id: "wxQR",
        appid: WECHAT_APPID,
        scope: "snsapi_login",
        redirect_uri: encodeURIComponent(getNoCodeURL()),
        state: "STATE",
        style: "black", //white
        href: ""
    });
}

//检测是否为微信浏览器
function is_weixn() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
        return true;
    } else {
        return false;
    }
}

//发送get请求-基于jquery
function request(serviceName, methodName, otherParam, successFunc, type, postdata, timeout) {
    if (timeout == undefined) {
        timeout = 1000 * 60 * 2;
    }
    var urlStr = createURLStr(serviceName, methodName, otherParam);
    // var urlStr = SA_URL + serviceName + methodName;
    var ajaxConfig = {
        type: type == undefined ? "get" : type,
        url: urlStr,
        timeout: timeout,
        success: function (str) {
            // var json = eval("(" + str + ")");
            var json = str;
            if (json.code == 10099) {
                clearCookie("userId");
                clearCookie("token");
                userID = null;
                token = null;
                hideLoad();
                showAlert("当前登录已失效，请刷新页面重新登录", "", "", "");
            } else {
                if (successFunc != null) {
                    successFunc(json);
                }
            }
        },
        complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
            if (status == 'timeout') {//超时,status还有success,error等值的情况
                xhr.abort();
                xhr = null;
                var data = {code: 1, msg: "请求超时,您当前网络状态不佳"};
                if (successFunc != null) {
                    successFunc(data);
                }
            }
        },
        error: function () {
            var data = {code: 1, msg: "请求失败,未知错误"};
            if (successFunc != null) {
                successFunc(data);
            }
        }
    };
    if (postdata != undefined) {
        ajaxConfig.data = postdata;
    }
    var xhr = $.ajax(ajaxConfig);
    return xhr;
}

//创建请求的url
function createURLStr(serviceName, methodName, otherParam) {
    var data = {};
    data.sn = serviceName;
    data.mn = methodName;
    if (otherParam != null) {
        for (var key in otherParam) {
            data[key] = otherParam[key];
        }
    }
    data.sign = createMD5Sign(data);
    var str = createVarsStrByObj(data);
    var urlStr = SA_URL  + str;
    return urlStr;
}

//MD5验证加密
function createMD5Sign(data) {
    var paramArr = [];
    for (var key in data) {
        if (key != "info") {
            paramArr.push({key: key, value: data[key]});
        }
    }
    paramArr.sort(function (a, b) {
        return a.key > b.key ? 1 : -1;
    });
    var md5 = "";
    for (var i = 0; i < paramArr.length; i++) {
        md5 += paramArr[i].value;
    }
    md5 += "6783c950bdbf40aeac52042a9206e0ba";
    md5 = $.md5(md5);
    return md5;
}

//把对象转换为字符串拼接
function createVarsStrByObj(obj) {
    var str = "";
    for (var key in obj) {
        // var encodeKeyValue = encodeURIComponent(obj[key]);
        if(key=="sn" || key=="mn"){
            str += obj[key];
        }else {
            str+="&"+key+"="+obj[key];
        }

    }
    str = str.slice(0, str.length - 1);
    return str;
}

//js获取location.href的参数的方法
function getQuery(para) {
    var reg = new RegExp("(^|&)" + para + "=([^&]*)(&|$)");
    var search = decodeURIComponent(window.location.search);
    var r = search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}

function replaceQuery(para, value) {
    var search = decodeURIComponent(window.location.search);
    if (search == "") {
        search = "?" + para + "=" + value;
    } else if (search.indexOf(para) == -1) {
        search += "&" + para + "=" + value
    } else {
        var reg = new RegExp(para + "=[^&]*");
        search = search.replace(reg, para + "=" + value);
    }
    return search;
}

//读取cookies
function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

//写入N小时cookie
function setCookie(name, value, Hours) {
    var exp = new Date();
    exp.setTime(exp.getTime() + Hours * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

//清除cookie  
function clearCookie(name) {
    setCookie(name, "", -1);
}

//派发事件
var dispatch = function (ele, type) {
    if (document.all) {
        // IE浏览器支持fireEvent方法
        ele.fireEvent('on' + type, evt)
    } else {
        // 其他标准浏览器使用dispatchEvent方法
        var evt = document.createEvent('HTMLEvents');
        // initEvent接受3个参数：
        // 事件类型，是否冒泡，是否阻止浏览器的默认行为
        evt.initEvent(type, true, true);
        ele.dispatchEvent(evt);
    }
};

//上传文件
function uploadFile(maxSize, successFunc, startuploadFunc, extention) {
    var form = $('<form method="post" enctype="multipart/form-data"></form>');
    var file = $('<input type="file" name="file" />');
    form.append(file);
    file.click();
    file.change(function () {
        var filePath = this.value;
        var fileObj = $(this)[0].files[0];
        var fileSizeM = fileObj.size / 1024 / 1024;
        if (extention != undefined && extention != "") {
            var earr = extention.split(",");
            var ext = fileObj.name.slice(fileObj.name.lastIndexOf(".") + 1);
            if (earr.indexOf(ext) == -1) {
                alert("文件格式只能是" + extention);
                return;
            }
        }
        if (fileSizeM > maxSize) {
            alert("文件大小不能超过" + maxSize + "M");
            return;
        }
        fileSizeM = fileSizeM.toFixed(1);
        if (startuploadFunc != null) {
            startuploadFunc();
        }
        formUpload(form[0], function (json) {
            if (json.code == 0) {
                if (successFunc != null) {
                    successFunc(json.fileName, json.url, fileObj.name);
                }
            } else {
                showAlert(json.msg);
            }
        });
    });
}

function formUpload(form, func) {
    var obj = {md5: "true"};
    var server_url = createURLStr("File", "upload", obj);
    form.action = server_url;
    console.log("上传文件...");
    $(form).ajaxSubmit({
        success: function (str) {
            console.log("上传成功！");
            var json = JSON.parse(str);
            if (func != null) {
                func(json);
            }
        }
    });
}

function formatDateTime(timenumber, format) {
    if (timenumber == undefined || timenumber == null || timenumber == "" || isNaN(timenumber)) {
        return "INVAILED";
    }
    var adate = new Date(timenumber);
    var year = adate.getFullYear().toString();
    var month = (adate.getMonth() + 1).toString();
    var thedate = adate.getDate().toString();
    var hour = adate.getHours().toString();
    var minute = adate.getMinutes().toString();
    var second = adate.getSeconds().toString();
    month = month.length == 1 ? "0" + month : month;
    thedate = thedate.length == 1 ? "0" + thedate : thedate;
    hour = hour.length == 1 ? "0" + hour : hour;
    minute = minute.length == 1 ? "0" + minute : minute;
    second = second.length == 1 ? "0" + second : second;
    var YMD = year + "-" + month + "-" + thedate;
    var HMS = hour + ":" + minute + ":" + second;
    var HM = hour + ":" + minute;
    var YMD2 = year + "/" + month + "/" + thedate;
    switch (format) {
        case "Y-M-D":
            return YMD;
            break;
        case "Y/M/D":
            return YMD2;
            break;
        case "H:M:S":
            return HMS;
            break;
        case "H:M":
            return HM;
            break;
        case "Y-M-D H:M:S":
            return YMD + " " + HMS;
            break;
        case "Y/M/D H:M:S":
            return YMD2 + " " + HMS;
            break;
        case "Y-M-D H:M":
            return YMD + " " + HM;
            break;
        case "Y/M/D H:M":
            return YMD2 + " " + HM;
            break;
        default:
            return YMD + " " + HMS;
            break;
    }
}
