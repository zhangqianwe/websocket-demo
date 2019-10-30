Vue.component('live-publisher', {
	props:{
		liveMsg:{
			default:"未登录"
		},
		isTeacher:{
			default:true
		},
		start:{
			default:false
		},
		actor:{
			default:false
		},
		appKey: String,
		teacherId: String,
		pushUrl:String,
		roomId:String
	},
	data: function(){
		return {
			netcall:null,
			token:null
		}
	},
  	template: '<div id="wydiv">'+
		'<div id="WY-video-container"></div>'+
		'<div id="WY-remote-container"></div>'+
		'<div id="wystatus" :title="liveMsg">{{liveMsg}}<span>{{started}}</span></div>',
	methods:{
		getWYtoken: function(){
			this.liveMsg = "获取网易token...";
			request("WangYiCloud", "createImId", {userId:this.teacherId.toLocaleLowerCase(), name:"老师"}, function(data){
				if(data.code==0){
					this.liveMsg = "获取网易token成功";
					this.token = data.token;
					this.initWY();
				}else{
					this.liveMsg = "获取网易token失败："+data.msg;
//					showAlert("获取网易token失败", data.msg, "重试", "", function(index){
//						if(index==1){
//							this.getWYtoken();
//						}
//					}.bind(this));
				}
			}.bind(this))
		},
		initWY: function(){
			this.liveMsg = "网易登录中...";
			NIM.use(WebRTC);
			var obj = {
			    appKey: this.appKey,
			    account: this.teacherId.toLocaleLowerCase(),
			    token: this.token,
			    onconnect: this.onWYConnect,
			    onwillreconnect: this.onWYWillReconnect,
			    ondisconnect: this.onWYDisconnect,
			    onerror: this.onWYError,
			    //debug: true
			};
			nim = NIM.getInstance(obj);
		},
		onWYConnect: function() {
		    this.liveMsg = "网易登录成功";
		    console.log('<网易直播组件>','网易登录成功');
		    this.initNetCall(); //初始化音视频通话实例
		},
		onWYWillReconnect: function(obj) {
		    this.liveMsg = "网易重连中...";
		},
		onWYDisconnect: function(error) {
		    if (error) {
		        switch (error.code) {
		        		case 302:
		        			this.liveMsg = "网易账号或密码错误";
		        			console.log('<网易直播组件>',this.liveMsg);
		            		break;
		        		case 417:
		        			this.liveMsg = "重复登录";
		        			console.log('<网易直播组件>',this.liveMsg);
		        			//showAlert(this.liveMsg, "请联系管理员", "", "");
		            		break;
		        		case 'kicked':
		        			this.liveMsg = "被踢，该账号在其他地方登录";
		        			console.log('<网易直播组件>',this.liveMsg);
		            		break;
		        		default:
		        			this.liveMsg = "网易已断开 code: "+error.code+" message: "+error.message;
		        			console.log('<网易直播组件>',this.liveMsg);
		            		break;
		        }
		    }else{
		    		this.liveMsg = "网易已断开，未知错误";
		    		console.log('<网易直播组件>','网易已断开，未知错误');
		    }
		},
		onWYError: function(error) {
			this.liveMsg = "网易IM发生错误";
			console.log('<网易直播组件>','网易IM发生错误');
		},
		initNetCall: function(){
			this.liveMsg = "直播初始化";
			console.log('<网易直播组件>','直播初始化');
			var videodom = this.actor ? "WY-video-container" : "WY-remote-container";
			var videoContainer = document.getElementById(videodom); //直播预览自己的dom容器
			var remotedom = this.actor ? "WY-remote-container" : "WY-video-container";
			var remoteContainer = document.getElementById(remotedom); //直播观看对方的dom容器
			console.log('<网易直播组件>',videodom, remotedom)
			this.netcall = WebRTC.getInstance({
				nim: nim, 
				container: videoContainer, 
				remoteContainer: remoteContainer,
				//debug: true
			});
			this.addNetCallListener(); //添加音视频通话事件监听
			this.joinChannel(); //加入房间
		},
		addNetCallListener: function(){
			//监听有人加入房间
			this.netcall.on('joinChannel', function (obj) {
				//this.liveMsg = "有人进入房间："+obj.account;
				console.log('<网易直播组件>','有人进入房间',obj);
			}.bind(this))
			//监听有人离开房间
			this.netcall.on('leaveChannel', function (obj) {
				//this.liveMsg = "有人离开房间："+obj.account;
				console.log('<网易直播组件>','有人离开房间',obj);
				this.stopRemoteVideo(obj); // 停止预览该同伴的视频流
			}.bind(this))
			//收到用户媒体流的通知：在这里播放对方的音视频
			this.netcall.on('remoteTrack', function (obj) {
				//console.log('<网易直播组件>','*** 收到用户媒体流的通知 ***', obj);
				if (obj.track.kind === 'audio') {
					this.startRemoteAudio(); // 播放对方声音
				}
				if (obj.track.kind === 'video') {
					this.startRemoteVideo(obj); //播放对方画面
					this.setRemoteVideoSize(obj); // 设置对方预览画面大小
				}
			}.bind(this))
			//设备状态发送变化
			this.netcall.on('deviceStatus', function(obj) {
			    // 检查摄像头
			    netcall.getDevicesOfType(WebRTC.DEVICE_TYPE_VIDEO).then(function (devices) {
			        if(devices.length==0){
			        		this.liveMsg = "未检测到摄像头，请连接摄像头，然后刷新页面";
			        		console.log('<网易直播组件>',this.liveMsg);
//			        		showAlert("摄像头已断开", "请连接摄像头，然后刷新页面", "刷新", "", function(index){
//			        			if(index==1){
//			        				location.reload();
//			        			}
//			        		});
			        }
			    })
			    // 检查麦克风
			    netcall.getDevicesOfType(WebRTC.DEVICE_TYPE_AUDIO_IN).then(function (devices) {
			        if(devices.length==0){
			        		this.liveMsg = "未检测到麦克风，请连接麦克风，然后刷新页面";
			        		console.log('<网易直播组件>',this.liveMsg);
//			        		showAlert("麦克风已断开", "请连接麦克风，然后刷新页面", "刷新", "", function(index){
//			        			if(index==1){
//			        				location.reload();
//			        			}
//			        		});
			        }
			    })
			}.bind(this))
		},
		joinChannel: function(){
			this.liveMsg = "加入房间...房间号："+this.roomId;
			console.log('<网易直播组件>',this.liveMsg);
			var sessionConfig = {
			 	videoQuality: WebRTC.CHAT_VIDEO_QUALITY_HIGH,
			  	videoFrameRate: WebRTC.CHAT_VIDEO_FRAME_RATE_15,
			 	highAudio: true, //是否开启高清通话，默认关闭
			  	rtmpRecord: false, //是否开启推流录制
				splitMode: WebRTC.LAYOUT_SPLITTOPHORFLOATING, //主播和连麦者的布局模式
				liveEnable: true
			}
			if(this.isTeacher){
				sessionConfig.rtmpUrl = this.pushUrl; //主播必填：推流地址
				console.log('<网易直播组件> 推流地址：', sessionConfig.rtmpUrl);
			}
			this.netcall.joinChannel({
			  channelName: this.roomId, //房间号，必填
			  type: WebRTC.NETCALL_TYPE_VIDEO, //会议通话类型，音频、️视频+音频
			  liveEnable: true, //是否开启互动直播
			  sessionConfig: sessionConfig
			}).then(function(obj) {
			  this.liveMsg = "加入房间成功";
			  console.log('<网易直播组件>',this.liveMsg);
			  this.startMicrophone(); //开启麦克风、摄像头等操作
			}.bind(this)).catch(function(error){
				this.liveMsg = "加入房间失败："+error.message;
				console.log('<网易直播组件>',this.liveMsg);
				if(this.isTeacher){
					this.createChannel(); //主播身份在加入房间失败后，创建房间
				}
			}.bind(this))
		},
		createChannel: function(){
			this.liveMsg = "创建房间...房间号："+this.roomId;
			console.log('<网易直播组件>',this.liveMsg);
			this.netcall.createChannel({
			  channelName: this.roomId, //必填，同一个房间号必须等所有人退出房间（房间将被销毁）后才能再次使用，否则直接加入即可
			  custom: '自定义数据', //可选
			  webrtcEnable: true // 是否支持WebRTC方式接入，可选，默认为不开启
			}).then(function(obj) {
				this.liveMsg = "房间创建成功";
				console.log('<网易直播组件>',this.liveMsg);
				this.joinChannel(); //加入房间
			}.bind(this));
		},
		startMicrophone: function(){
			this.liveMsg = "开启麦克风...";
			console.log('<网易直播组件>',this.liveMsg);
		    this.netcall.startDevice({
		      type: WebRTC.DEVICE_TYPE_AUDIO_IN
		    }).then(function(){
				this.liveMsg = "麦克风开启成功";
				console.log('<网易直播组件>',this.liveMsg);
				this.netcall.setCaptureVolume(255); // 设置采集音量
				this.startCamera(); //开启摄像头
		    }.bind(this)).catch(function(error) {
		    		this.liveMsg = '启动麦克风失败：'+error.toString();
		    		console.log('<网易直播组件>',this.liveMsg);
		    		this.startCamera(); //开启摄像头
		    }.bind(this))
		},
		startCamera: function(){
			this.liveMsg = "开启摄像头...";
			console.log('<网易直播组件>',this.liveMsg);
			this.netcall.startDevice({
		      type: WebRTC.DEVICE_TYPE_VIDEO,
		      width: 640,
		      height: 480
		   }).then(function(){
				this.liveMsg = "摄像头开启成功";
				console.log('<网易直播组件>',this.liveMsg);
				this.netcall.startLocalStream(); //预览本地视频
				this.netcall.setVideoViewSize({width:(this.actor?320:105), height:(this.actor?213:70), cut:false}); // 设置本地预览画面大小
			    this.netcall.changeRoleToPlayer(); // 主播、连麦者调用此方法设置为互动者角色；观众要调用方法：changeRoleToAudience 切换为观众
			    this.startLive();
			}.bind(this)).catch(function(error) {
		   		this.liveMsg = "启动摄像头失败："+error.toString();
		   		console.log('<网易直播组件>',this.liveMsg);
		   		this.netcall.changeRoleToPlayer(); // 主播、连麦者调用此方法设置为互动者角色；观众要调用方法：changeRoleToAudience 切换为观众
			    this.startLive();
		  	}.bind(this))
		},
		startLive: function(){
			this.liveMsg = "直播连接中...";
			console.log('<网易直播组件>',this.liveMsg);
			this.netcall.startRtc().then(function(){
				this.liveMsg = "正在直播";
				console.log('<网易直播组件>',this.liveMsg);
				this.$emit('live-start');
			}.bind(this)).catch(function(error){
				this.liveMsg = "直播连接失败："+error.toString();
				var errorMessage = error.toString().replace("2nd argument is not instance of MediaStreamTrack.", "当前浏览器不支持视频直播，请使用chrome浏览器");
				console.log('<网易直播组件>',this.liveMsg);
			}.bind(this))
		},
		startRemoteAudio: function(){
			this.netcall.startDevice({type: WebRTC.DEVICE_TYPE_AUDIO_OUT_CHAT}).catch(function() {
		   		this.liveMsg = "播放对方的声音失败";
		   		console.log('<网易直播组件>',this.liveMsg);
		  	}.bind(this))
		},
		stopRemoteAudio: function(){
			this.netcall.stopDevice(WebRTC.DEVICE_TYPE_AUDIO_OUT_CHAT);
		},
		startRemoteVideo: function(obj){
			var videodom = this.actor ? "WY-remote-container" : "WY-video-container";
			var remoteVideoContainer = document.getElementById(videodom); //对方视频显示容器
			this.netcall.startRemoteStream({account: obj.account, node: remoteVideoContainer});
		},
		setRemoteVideoSize: function(obj){
			this.netcall.setVideoViewRemoteSize({
		    		account: obj.account,
		    		width: this.actor ? 105 : 320,
		      	height: this.actor ? 70 : 213,
		    		cut:true
			})
		},
		stopRemoteVideo: function(obj){
			this.netcall.stopRemoteStream({account: obj.account});
		},
		leaveChannel: function(){
			this.liveMsg = "您已退出房间，直播已停止";
			console.log('<网易直播组件>',this.liveMsg);
			this.netcall.leaveChannel().then(function(obj) {
			  	// 离开房间后的扫尾工作
				this.netcall.stopLocalStream(); // 停止本地视频预览
				this.netcall.stopRemoteStream(); // 停止对端视频预览
				this.netcall.stopDevice(WebRTC.DEVICE_TYPE_AUDIO_IN); // 停止设备麦克风
				this.netcall.stopDevice(WebRTC.DEVICE_TYPE_VIDEO); // 停止设备摄像头
				this.netcall.stopDevice(WebRTC.DEVICE_TYPE_AUDIO_OUT_LOCAL); // 停止播放本地音频
				this.netcall.stopDevice(WebRTC.DEVICE_TYPE_AUDIO_OUT_CHAT); // 停止播放对端音频
			}.bind(this));
		},
	},
	computed:{
		started: function(){
			if(this.start){
				this.getWYtoken();
			}
			return "";
		}
	}
});