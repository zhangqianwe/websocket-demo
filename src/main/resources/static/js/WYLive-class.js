Vue.component('live-publisher', {
	props:{
		isTeacher:{
			default:true
		},
		appKey: String,
		userId: String,
		teacherId:String,
		pushUrl:String,
		roomId:String
	},
	data: function(){
		return {
			liveMsg:"未登录",
			netcall:null,
			token:null,
			lmlist:[]
		}
	},
  	template: 
  		'<div id="wydiv">'+
			'<div id="WY-video-container"></div>'+
			'<div id="WY-lm-panel">'+
				'<div class="WY-lm-container" id="remote-container"></div>'+
				'<div class="WY-lm-container"></div>'+
				'<div class="WY-lm-container"></div>'+
				'<div class="WY-lm-container"></div>'+
			'</div>'+
			'<div id="wystatus" :title="liveMsg">{{liveMsg}}</div>'+
		'</div>',
	methods:{
		init: function(){
			console.log("<网易直播组件> 初始化......","userId: "+this.userId,"teacherId: "+this.teacherId);
			var accid_token = getCookie("wy_accid_token");
			if(accid_token!=null){
				var arr = accid_token.split("#");
				if(arr.length>1 && arr[0]==this.userId.toLocaleLowerCase()){
					this.token = arr[1];
					this.initWY();
				}else{
					this.getWYtoken();
				}
			}else{
				this.getWYtoken();
			}
		},
		getWYtoken: function(){
			this.liveMsg = "获取网易token...";
			request("WangYiCloud", "createImId", {userId:this.userId.toLocaleLowerCase(), name:"老师"}, function(data){
				if(data.code==0){
					this.liveMsg = "获取网易token成功";
					this.token = data.token;
					setCookie("wy_accid_token", this.userId.toLocaleLowerCase()+"#"+this.token, 24);
					this.initWY();
				}else{
					this.liveMsg = "获取网易token失败："+data.msg;
				}
			}.bind(this))
		},
		initWY: function(){
			this.liveMsg = "网易登录中...";
			NIM.use(WebRTC);
			var obj = {
			    appKey: this.appKey,
			    account: this.userId.toLocaleLowerCase(),
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
		        			this.getWYtoken();
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
			console.log('<网易直播组件>','网易IM发生错误', error);
		},
		initNetCall: function(){
			this.liveMsg = "直播初始化";
			console.log('<网易直播组件>','直播初始化');
			var videodom = this.isTeacher ? "WY-video-container" : "remote-container";
			//var remotdom = this.isTeacher ? "remote-container" : "WY-video-container";
			if(!this.isTeacher){
				$("#remote-container").addClass("active");
			}else{
				$("#remote-container").removeAttr("id");
			}
			var videoContainer = document.getElementById(videodom); //直播预览自己的dom容器
			//var remotContainer = document.getElementById(remotdom); //预览对方的dom容器
			this.netcall = WebRTC.getInstance({
				kickLast: true,
				nim: nim, 
				container: videoContainer, 
				//remoteContainer: remotContainer,
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
				var idx = this.lmlist.indexOf(obj.account);
				if(idx!=-1){
					//如果下线的人是正在连麦的人
					this.stopRemoteVideo(obj); // 停止预览该同伴的视频流
					this.lmlist.splice(idx,1);
					$(".WY-lm-container").each(function(){
						if($(this).attr("id")=="lm"+obj.account){
							$(this).removeAttr("id");
							$(this).removeClass("active");
						}
					})
				}
			}.bind(this))
			this.netcall.on('remoteTrack', function (obj) {
				console.log('<网易直播组件>','*** 收到用户媒体流的通知 ***', obj);
				var canplay = true; //是否可以播放（前四个人可以连麦播放）
				var idx = this.lmlist.indexOf(obj.account);
				if(idx==-1){
					if(this.lmlist.length<4){
						this.lmlist.push(obj.account);
					}else{
						canplay = false;
					}
				}
				if(!canplay) return;
				if (obj.track.kind === 'audio') {
					this.startRemoteAudio(); // 播放对方声音
				}
				if (obj.track.kind === 'video') {
					var domid;
					var w;
					var h;
					if(obj.account==this.teacherId){
						domid = "WY-video-container";
						w = 320;
						h = 213;
					}else{
						domid = "lm"+obj.account;
						w = 160;
						h = 106;
						var mydom;
						var emptyDoms = [];
						$(".WY-lm-container").each(function(){
							if($(this).attr("id")=="lm"+obj.account){
								mydom = $(this);
							}
							if(!$(this).hasClass("active")){
								emptyDoms.push($(this));
							}
						})
						if(mydom==null){
							emptyDoms[0].addClass("active");
							emptyDoms[0].attr("id", "lm"+obj.account);
						}
					}
					this.startRemoteVideo(obj, domid); //播放对方画面
					this.setRemoteVideoSize(obj,w,h); // 设置对方预览画面大小
				}
			}.bind(this))
			//设备状态发送变化
			this.netcall.on('deviceStatus', function(obj) {
			    // 检查摄像头
			    netcall.getDevicesOfType(WebRTC.DEVICE_TYPE_VIDEO).then(function (devices) {
			        if(devices.length==0){
			        		this.liveMsg = "未检测到摄像头，请连接摄像头，然后刷新页面";
			        		console.log('<网易直播组件>',this.liveMsg);
			        }
			    })
			    // 检查麦克风
			    netcall.getDevicesOfType(WebRTC.DEVICE_TYPE_AUDIO_IN).then(function (devices) {
			        if(devices.length==0){
			        		this.liveMsg = "未检测到麦克风，请连接麦克风，然后刷新页面";
			        		console.log('<网易直播组件>',this.liveMsg);
			        }
			    })
			}.bind(this))
		},
		joinChannel: function(){
			this.liveMsg = "加入房间...房间号："+this.roomId;
			console.log('<网易直播组件>',this.liveMsg);
			var sessionConfig = {
			 	videoQuality: WebRTC.CHAT_VIDEO_QUALITY_LOW,
			  	videoFrameRate: WebRTC.CHAT_VIDEO_FRAME_RATE_10,
			 	highAudio: true, //是否开启高清通话，默认关闭
			  	rtmpRecord: false, //是否开启推流录制
				liveEnable: true
			}
			var layoutvalue = '{"version":0,"set_host_as_main":true,"host_area":{"adaption":1},"special_show_mode":true,"n_host_area_number":4,"n_host_area_0":{"position_x":7000,"position_y":300,"width_rate":2100,"height_rate":1000,"adaption":1},"n_host_area_1":{"position_x":7000,"position_y":1500,"width_rate":2100,"height_rate":1000,"adaption":1},"n_host_area_2":{"position_x":7000,"position_y":2700,"width_rate":2100,"height_rate":1000,"adaption":1},"n_host_area_3":{"position_x":7000,"position_y":3900,"width_rate":2100,"height_rate":1000,"adaption":1}}';
			if(this.isTeacher){
				sessionConfig.splitMode = WebRTC.LAYOUT_SPLITBOTTOMHORFLOATING; //主播和连麦者的布局模式
				//sessionConfig.layout = layoutvalue;
				sessionConfig.rtmpUrl = this.pushUrl; //主播必填：推流地址
				console.log('<网易直播组件> 推流地址：', sessionConfig.rtmpUrl);
			}else{
				sessionConfig.videoQuality = WebRTC.CHAT_VIDEO_QUALITY_LOW;
				sessionConfig.videoFrameRate = WebRTC.CHAT_VIDEO_FRAME_RATE_10;
			}
			this.netcall.joinChannel({
			  channelName: this.roomId, //房间号，必填
			  type: WebRTC.NETCALL_TYPE_VIDEO, //会议通话类型，音频、️视频+音频
			  liveEnable: true, //是否开启互动直播
			  sessionConfig: sessionConfig
			}).then(function(obj) {
			  this.liveMsg = "加入房间成功";
			  console.log('<网易直播组件>',this.liveMsg);
			  this.startLive();
			  //这里开始给cookie写入时间戳，每2秒一次
			  //setTimeout(this.setTimestapCookie, 2000);
			}.bind(this)).catch(function(error){
				this.liveMsg = "加入房间失败："+error.message;
				console.log('<网易直播组件>',this.liveMsg);
				if(this.isTeacher){
					this.createChannel(); //主播身份在加入房间失败后，创建房间
				}
			}.bind(this))
		},
//		setTimestapCookie: function(){
//			var date = new Date();
//			var timecount = date.getTime();
//			setCookie("wangyi_live_lasttime", timecount, 1);
//			//console.log('<网易直播组件> 写入当前时间戳：', date.toLocaleString());
//			setTimeout(this.setTimestapCookie, 2000);
//		},
		changeToPlayer: function(){
			this.startMicrophone();
		},
		changeToViewer: function(){
			this.netcall.changeRoleToAudience(); //观众角色
			this.netcall.stopLocalStream(); // 停止本地视频预览
			this.netcall.stopDevice(WebRTC.DEVICE_TYPE_VIDEO); // 停止设备摄像头
			this.netcall.stopDevice(WebRTC.DEVICE_TYPE_AUDIO_IN); // 停止设备麦克风
			this.netcall.stopDevice(WebRTC.DEVICE_TYPE_AUDIO_OUT_LOCAL); // 停止播放本地音频
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
				this.startCamera();
		    }.bind(this)).catch(function(error) {
		    		this.liveMsg = '启动麦克风失败：'+error.toString();
		    		console.log('<网易直播组件>',this.liveMsg);
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
				var videodom = this.isTeacher ? "WY-video-container" : "remote-container";
				var videoContainer = document.getElementById(videodom); //直播预览自己的dom容器
				this.netcall.startLocalStream(videoContainer); //预览本地视频
				//设置本地预览画面大小
				this.netcall.setVideoViewSize(
					{
						width:(this.isTeacher ? 320 : 160), 
						height:(this.isTeacher ? 213 : 106), 
						cut:false
					}
				);
				//切换为连麦角色
				this.netcall.changeRoleToPlayer();
				this.liveMsg = "您已加入互动直播";
		   		console.log('<网易直播组件>',this.liveMsg);
			}.bind(this)).catch(function(error) {
		   		this.liveMsg = "启动摄像头失败："+error.toString();
		   		console.log('<网易直播组件>',this.liveMsg);
		  	}.bind(this))
		},
		startLive: function(){
			this.liveMsg = "webRTC连接中...";
			console.log('<网易直播组件>',this.liveMsg);
			this.netcall.startRtc().then(function(){
				this.liveMsg = "webRTC连接成功";
				console.log('<网易直播组件>',this.liveMsg);
				this.$emit('live-start');
				if(this.isTeacher){
					this.changeToPlayer();
				}
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
		startRemoteVideo: function(obj, domid){
			var remoteVideoContainer = document.getElementById(domid); //对方视频显示容器
			this.netcall.startRemoteStream({account: obj.account, node: remoteVideoContainer});
		},
		setRemoteVideoSize: function(obj, w, h){
			this.netcall.setVideoViewRemoteSize({
		    		account: obj.account,
		    		width: w,
		      	height: h,
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
	}
});