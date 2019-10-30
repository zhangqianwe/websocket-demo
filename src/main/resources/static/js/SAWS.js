function SAWS() {};

SAWS.MES_UP_REGIST = 0x1001;         // 上行 注册
SAWS.MES_UP_HEART = 0x1002;          // 上行 心跳
SAWS.MES_UP_LOGOUT = 0x1005;         //上行 退出房间
SAWS.MES_UP_CHAT_SINGLE = 0x3001;    // 上行 发消息-单人
SAWS.MES_UP_CHAT_ROOM = 0x3002;      // 上行 发消息-房间内
SAWS.MES_UP_CHAT_ALL = 0x3003;       // 上行 发消息-所有人
SAWS.MES_UP_CHAT_HISTORY = 0x3013;   // 上行 获取房间内历史消息
SAWS.MES_UP_ROOM_LIST = 0x3004;      // 上行 获取房间内用户列表
SAWS.MES_UP_SHARE_GET = 0x3005;      // 上行 获取共享
SAWS.MES_UP_SHAREHIS_GET = 0x3015    // 上行 获取共享历史
SAWS.MES_UP_SHARE_UPD = 0x3006;      // 上行 修改共享
SAWS.MES_UP_SHARE_DEL = 0x3007;      // 上行 共享删除
SAWS.MES_UP_ROOM_DISPOSE = 0x3008;   // 上行 摧毁房间
SAWS.MES_UP_CLASS_START = 0x3009;    // 上行 开课
SAWS.MES_UP_CHAT_DISABLE = 0x3010;   // 上行 禁言
SAWS.MES_UP_CHAT_ENABLE = 0x3011;    // 上行 解除禁言
SAWS.MES_UP_TICK = 0x3012;           // 上行 踢人
SAWS.MES_UP_APPLY = 0x3020;          // 上行申请开通权限
SAWS.MES_UP_APPLYOK = 0x3021;        // 上行申请开通权限-同意

SAWS.MES_DOWN_REGIST = 0x2001;       // 下行 注册
SAWS.MES_DOWN_HEART = 0x2002;        // 下行 心跳
SAWS.MES_DOWN_CHAT_SINGLE = 0x4001;  // 下行 发消息-单人
SAWS.MES_DOWN_CHAT_ROOM = 0x4002;    // 下行 发消息-房间内
SAWS.MES_DOWN_CHAT_ALL = 0x4003;     // 下行 发消息-所有人
SAWS.MES_DOWN_CHAT_HISTORY = 0x4013; // 下行 获取房间内历史消息
SAWS.MES_DOWN_ROOM_LIST = 0x4004;    // 下行 获取房间内用户列表
SAWS.MES_DOWN_SHARE_GET = 0x4005;    // 下行 获取共享内容
SAWS.MES_DOWN_SHAREHIS_GET = 0x4015; // 下行 获取共享历史
SAWS.MES_DOWN_SHARE_UPD = 0x4006;    // 下行 共享修改
SAWS.MES_DOWN_SHARE_DEL = 0x4007;    // 下行 共享删除
SAWS.MES_DOWN_ROOM_DISPOSE = 0x4008; // 下行 摧毁房间
SAWS.MES_DOWN_CLASS_START = 0x4009;  // 下行 开课
SAWS.MES_DOWN_RESPONSE = 0x5001;     // 下行 消息数据回执包
SAWS.MES_DOWN_APPLY = 0x4020;        // 下行申请开通权限
SAWS.MES_DOWN_APPLYOK = 0x4021;      // 下行申请开通权限-同意

SAWS.prototype.socket = null;
var prestr = "ws";
var port = ":9081";
if(location.href.indexOf("https")!=-1){
	prestr = "wss";
	port = "";
}
SAWS.prototype.url = prestr+"://my.saclass.com"+port+"/ws";
//SAWS.prototype.url = "ws://192.168.1.234:8080/ws";
SAWS.prototype.connected = false;
SAWS.prototype.onopen = null;
SAWS.prototype.onmessage = null;
SAWS.prototype.onclose = null;

SAWS.prototype.bin2String = function(array) {
	var str = decodeURIComponent(String.fromCharCode.apply(null, array));
	str = eval("'"+str+"'");
	return str;
};
SAWS.prototype.stringToBytes = function(str) {
	var ch, st, re = [];
	for(var i = 0; i < str.length; i++) {
		ch = str.charCodeAt(i); // get char   
		st = []; // set up "stack"  
		do {
			st.push(ch & 0xFF); // push byte to stack  
			ch = ch >> 8; // shift value down by 1 byte  
		}
		while (ch);
		// add stack contents to result  
		// done because chars have "wrong" endianness  
		re = re.concat(st.reverse());
	}
	// return an array of bytes  
	return re;
};
SAWS.prototype.createMessageId = function(){
	var rand = parseInt(Math.random()*1000000000);
	return rand;
};
SAWS.prototype.init = function(){
	this.socket = new WebSocket(this.url);
	this.socket.binaryType = "arraybuffer";
	this.socket.onopen = function(event){
		this.connected = true;
		//console.log("webSocket connect success! <"+this.url+">");
		if(this.onopen!=undefined){
			this.onopen();
		}
	}.bind(this);
	this.socket.onclose = function(event){
		this.connected = false;
		//console.log("webSocket connect close! <"+this.url+">");
		if(this.onclose!=undefined){
			this.onclose();
		}
	}.bind(this);
	this.socket.onmessage = function(msg){
		//console.log("========== webSocket receive message ==========")
		var resultObj = {};
		if(msg.data instanceof ArrayBuffer){
// 消息类型
			var index = 0;
			var newBuffer = msg.data.slice(index);
			var num = new Int32Array(newBuffer, 0, 1);
			index+=4;
			resultObj.type = parseInt("0x"+num[0].toString(16));
// 事物ID
			newBuffer = msg.data.slice(index);
			num = new Int32Array(newBuffer, 0, 1);
			index+=4;
			resultObj.id = num[0];
// room len
			newBuffer = msg.data.slice(index);
			num = new Int32Array(newBuffer, 0, 1);
			index+=4;
// room
			var str = new Uint8Array(msg.data, index, num[0]);
			index+=num[0];
			resultObj.roomId = this.bin2String(str);
// from user id len
			newBuffer = msg.data.slice(index);
			num = new Int32Array(newBuffer, 0, 1);
			index+=4;
// from user id
			str = new Uint8Array(msg.data, index, num[0]);
			index+=num[0];
			resultObj.fromUserId = this.bin2String(str);
// to user id len
			newBuffer = msg.data.slice(index);
			num = new Int32Array(newBuffer, 0, 1);
			index+=4;
// to user id 
			str = new Uint8Array(msg.data, index, num[0]);
			index+=num[0];
			resultObj.toUserId = this.bin2String(str);
// status
			newBuffer = msg.data.slice(index);
			num = new Int32Array(newBuffer, 0, 1);
			index+=4;
			resultObj.status = num[0];
// options size
			newBuffer = msg.data.slice(index);
			num = new Int32Array(newBuffer, 0, 1);
			index+=4;
			resultObj.options = [];
			var optionLen = num[0];
			for(var i=0; i<optionLen; i++){
				var op = {};
// 1 k
				newBuffer = msg.data.slice(index);
				num = new Int32Array(newBuffer, 0, 1);
				index+=4;
				op.key = num[0];
// v len						
				newBuffer = msg.data.slice(index);
				num = new Int32Array(newBuffer, 0, 1);
				index+=4;
// 1 v
				str = new Uint8Array(msg.data, index, num[0]);
				index+=num[0];
				op.value = this.bin2String(str);
				resultObj.options.push(op);
			}
		}
		//console.log(resultObj);
		if(this.onmessage!=undefined){
			this.onmessage(resultObj);
		}
	}.bind(this);
};
SAWS.prototype.send = function(mesType, status, roomId, fromId, toId, options){
//	var sendObj = {
//		type:mesType, status:status, roomId:roomId, fromUserId:fromId, toUserId:toId, options:options
//	};
//	console.log("========== webSocket send message ========== ")
//	console.log(sendObj);
	var room = this.stringToBytes(encodeURIComponent(roomId));
	var fromUserId = this.stringToBytes(encodeURIComponent(fromId));
	var toUserId = this.stringToBytes(toId);
	var size = 2+1+room.length+1+fromUserId.length+1+toUserId.length+1+1;
	var bytesOptionValue = [];
	for(var i=0; i<options.length; i++){
		bytesOptionValue.push(this.stringToBytes(encodeURIComponent(options[i].value)));
		size += (2+bytesOptionValue[i].length);
	}
	var index = 0;
// 消息类型
	var inrArray = new Int32Array(size);
	inrArray[index] = mesType;
	index += 1;
// 事物ID 随机整数
	inrArray[index] = this.createMessageId();
	index += 1;
// 房间ID长度（转码后）
	inrArray[index] = room.length;
	index+=1;
// 房间ID（转码后）
	inrArray.set(room, index);
	index += room.length;
// 发送人ID长度（转码后）
	inrArray[index] = fromUserId.length;
	index += 1;
// 发送人ID（转码后）
	inrArray.set(fromUserId, index);
	index += fromUserId.length;
// 接收人ID长度（转码后）
	inrArray[index] = toUserId.length;
	index += 1;
// 接收人ID（转码后）
	inrArray.set(toUserId, index);
	index += toUserId.length;
// 状态
	inrArray[index] = status;
	index += 1;
// OPTIONS SIZE
	inrArray[index] = options.length;
	index += 1;
//OPTIONS
	for(var i=0; i<options.length; i++){
		// Key
			inrArray[index] = options[i].key;
			index += 1;
		// value length
			inrArray[index] = bytesOptionValue[i].length;
			index += 1;
		// value
			inrArray.set(bytesOptionValue[i], index);
			index += bytesOptionValue[i].length;
	}
	this.socket.send(inrArray.buffer);
};
SAWS.prototype.heart = function(){
	this.send(SAWS.MES_UP_HEART, 0, "", "", "", []); //发心跳
};
SAWS.prototype.login = function(roomId, uid, authcode, role, uname, icon){
	this.send(SAWS.MES_UP_REGIST, 0, roomId, uid, "", [
		{key:1, value:authcode}, {key:2, value:role}, {key:3, value:uname}, {key:4, value:icon}
	]);
};
SAWS.prototype.logout = function(roomId, uid){
	this.send(SAWS.MES_UP_LOGOUT, 0, roomId, uid, "", []);
};
SAWS.prototype.getRoomUserList = function(roomId, uid){
	this.send(SAWS.MES_UP_ROOM_LIST, 0, roomId, uid, "", []);
};
SAWS.prototype.sendRoomMessage = function(roomId, uid, msg){
	this.send(SAWS.MES_UP_CHAT_ROOM, 0, roomId, uid, "", [{key:1, value:msg}]);
};
SAWS.prototype.sendSingleMessage = function(roomId, uid, msg,toId){
 this.send(SAWS.MES_UP_CHAT_SINGLE, 0, roomId, uid, toId, [{key:1, value:msg}]);
};
SAWS.prototype.applyAuth = function(roomId, uid, touid, code, name, operate, count){
 this.send(SAWS.MES_UP_APPLY, 0, roomId, uid, touid, [{key:1, value:code},{key:2, value:name},{key:3, value:operate},{key:4, value:count}]);
};
SAWS.prototype.applyAuthOK = function(roomId, uid, touid, code, name, operate, count){
 this.send(SAWS.MES_UP_APPLYOK, 0, roomId, uid, touid, [{key:1, value:code},{key:2, value:name},{key:3, value:operate},{key:4, value:count}]);
};
SAWS.prototype.getShareObject = function(roomId, uid, sharename){
	this.send(SAWS.MES_UP_SHARE_GET, 0, roomId, uid, "", [{key:1, value:sharename}]);
};
SAWS.prototype.updShareObject = function(roomId, uid, sharename, sharevalue, docIndex, pageIndex, otherOption, authOption){
	var options = [{key:1, value:sharename}, {key:2, value:sharevalue}];
	if(docIndex!=undefined){
		options.push({key:3, value:docIndex})
	}
	if(pageIndex!=undefined){
		options.push({key:4, value:pageIndex})
	}
	if(otherOption!=undefined && otherOption!=null){
        options.push({key:5, value:otherOption})
	}
	if(authOption!=undefined && authOption!=null){
		options.push({key:100, value:authOption})
	}
	this.send(SAWS.MES_UP_SHARE_UPD, 0, roomId, uid, "", options);
	//console.log("<设置共享对象>", roomId, uid, sharename, sharevalue, docIndex, pageIndex)
};
SAWS.prototype.getRoomHistoryChat = function(roomId, uid, lasttime){
	lasttime = lasttime==undefined ? 0 : lasttime;
	this.send(SAWS.MES_UP_CHAT_HISTORY, 0, roomId, uid, "", [{key:1, value:lasttime},{key:2, value:10}]);
};
SAWS.prototype.bandChat = function(roomId, uid, touid, auth){
	this.send((auth==1 ? SAWS.MES_UP_CHAT_DISABLE : SAWS.MES_UP_CHAT_ENABLE), 0, roomId, uid, touid, []);
}
SAWS.prototype.tickout = function(roomId, uid, touid){
	this.send(SAWS.MES_UP_TICK, 0, roomId, uid, touid, []);
}
SAWS.prototype.getShareHistory = function(roomId, uid, sharename, docIndex, pageIndex){
	this.send(SAWS.MES_UP_SHAREHIS_GET, 0, roomId, uid, "", [{key:1, value:sharename},{key:2, value:docIndex},{key:3, value:pageIndex}]);
	//console.log("<获取共享对象历史>", roomId, uid, sharename, docIndex, pageIndex)
}