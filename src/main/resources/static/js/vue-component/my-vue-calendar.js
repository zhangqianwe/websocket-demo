Vue.component('my-vue-calendar', {
	props: ['config'],
	data: function() {
		console.log(this.fulldate);
		this.initMyMiniCalendar();
		return {
			fulldate: this.fulldate,
			mini_currentYear: this.mini_currentYear, //面板当前年
			mini_currentMonth: this.mini_currentMonth, //面板当前月
			mini_today_year: this.mini_today_year, //今天的年
			mini_today_month: this.mini_today_month, //今天的月
			mini_today_day: this.mini_today_day, //今天的日
			mini_today_fullDateStr: this.mini_today_fullDateStr, //今天的年月日
			mini_days: this.mini_days,
		}
	},
	template: `
		<style>
		.myMiniCalendar{
			position: absolute;
			top: 0;
			left: 0;
			width: 189px;
			/*height: 189px;*/
			height: auto;
			border: 1px solid #e1e1e1;
			background-color: #FFFFFF;
			z-index: 101;
			overflow: hidden;
			display: none;
		}
		.myMiniCalendar .myMiniCalendar_header{
			position: relative;
			width: 100%;
			height: 27px;
			text-align: center;
			line-height: 27px;
			cursor: default;
		}
		.myMiniCalendar_header_pre{
			position: absolute;
			left: 0;
			top: 0;
			width: 40px;
			height: 27px;
			border: none;
			background: url('img/calendar/miniCalendar_pre.png')no-repeat center center;
			background-size: 6px 8px;
			cursor: pointer;
		}
		.myMiniCalendar_header_next{
			position: absolute;
			right: 0;
			top: 0;
			width: 40px;
			height: 27px;
			border: none;
			background: url('img/calendar/miniCalendar_next.png')no-repeat center center;
			background-size: 7px 9px;
			cursor: pointer;
		}
		.myMiniCalendar_header_next{
			
		}
		.myMiniCalendar .myMiniCalendar_week{
			position: relative;
			width: 100%;
			overflow:hidden;
			cursor: default;
		}
		.myMiniCalendar .myMiniCalendar_content{
			position: relative;
			width: 100%;
			overflow:hidden;
		}
		.myMiniCalendar_content .myMiniCalendar_day{
			position: relative;
			cursor: pointer;
		}
		.myMiniCalendar_element{
			position: relative;
			width: 27px;
			height: 27px;
			display: inline-block;
			float: left;
			font-size: 12px;
			color: #333333;
			text-align: center;
			line-height: 27px;
		}
		.myMiniCalendar_day:hover{
			background-color: #e1e1e1;
			opacity: 0.8;
		}
		.myMiniCalendar_today{
			position: relative;
			background-color:#ff5614;
		    color: #ffffff;
		    border: 1px solid #ff5614;
		    border-radius: 50px;
		    display: inline-block;
		    width: 20px;
		    height: 20px;
		    text-align: center;
		    line-height: 19px;
		}
		.myMiniCalendar_chooseDay{
			position: relative;
		    color: #FFFFFF;
		    background-color: #2C3845;
		    border-radius: 50px;
		    display: inline-block;
		    width: 20px;
		    height: 20px;
		    text-align: center;
		    line-height: 19px;
		}
		/*正常尺寸*/
		.myMiniCalendar_normal{
			position: absolute;
			top: 0;
			left: 0;
			width: 280px;
			/*height: 189px;*/
			height: auto;
			border: 1px solid #e1e1e1;
			background-color: #FFFFFF;
			z-index: 101;
			overflow: hidden;
			display: none;
		}
		.myMiniCalendar_normal .myMiniCalendar_header{
			position: relative;
			width: 100%;
			height: 40px;
			text-align: center;
			line-height: 40px;
			cursor: default;
			font-size: 19px;
		}
		.myMiniCalendar_normal .myMiniCalendar_header_pre{
			position: absolute;
			left: 0;
			top: 0;
			width: 40px;
			height: 40px;
			border: none;
			background: url('img/calendar/miniCalendar_pre_normal.png')no-repeat center center;
			background-size: 9px 11px;
			cursor: pointer;
		}
		.myMiniCalendar_normal .myMiniCalendar_header_next{
			position: absolute;
			right: 0;
			top: 0;
			width: 40px;
			height: 40px;
			border: none;
			background: url('img/calendar/miniCalendar_next_normal.png')no-repeat center center;
			background-size: 8px 12px;
			cursor: pointer;
		}
		.myMiniCalendar_normal .myMiniCalendar_header_next{
			
		}
		.myMiniCalendar_normal .myMiniCalendar_week{
			position: relative;
			width: 100%;
			overflow:hidden;
			cursor: default;
		}
		.myMiniCalendar_normal .myMiniCalendar_content{
			position: relative;
			width: 100%;
			overflow:hidden;
		}
		.myMiniCalendar_normal .myMiniCalendar_content .myMiniCalendar_day{
			position: relative;
			cursor: pointer;
		}
		.myMiniCalendar_normal .myMiniCalendar_element{
			position: relative;
			width: 40px;
			height: 40px;
			display: inline-block;
			float: left;
			font-size: 16px;
			color: #333333;
			text-align: center;
			line-height: 40px;
		}
		
		.myMiniCalendar_normal .myMiniCalendar_week .myMiniCalendar_element{
			font-size: 14px;
		}
		.myMiniCalendar_normal .myMiniCalendar_day:hover{
			background-color: #e1e1e1;
			opacity: 0.8;
		}
		.myMiniCalendar_normal .myMiniCalendar_today{
			position: relative;
			background-color:#ff5614;
		    color: #ffffff;
		    border: 1px solid #ff5614;
		    border-radius: 50px;
		    display: inline-block;
		    width: 25px;
		    height: 25px;
		    text-align: center;
		    line-height: 23px;
		}
		.myMiniCalendar_normal .myMiniCalendar_chooseDay{
			position: relative;
		    color: #FFFFFF;
		    background-color: #2C3845;
		    border-radius: 50px;
		    display: inline-block;
		    width: 25px;
		    height: 25px;
		    text-align: center;
		    line-height: 23px;
		}
		.myMiniCalendar_normal .chooseToday{
			position: relative;
			width: 100%;
			height:42px;
			line-height:42px;
			border-top:1px solid #e1e1e1;
			text-align:center;
		}
		.myMiniCalendar_normal .chooseToday button{
			position:relative;
			width:60px;
			height:27px;
			border:1px solid #dc4851;
			font-size:16px;
			color:#dc4851;
			border-radius:2px;
		}

		</style>
		<div class="myMiniCalendar" v-bind:class="{myMiniCalendar_normal:config.size=='normal'}" style='position:relative;display:block'>
			<div class="myMiniCalendar_header">
				<button class="myMiniCalendar_header_pre" @click.stop="mini_calendar_pre($event)"></button>
				<span style="position:relative;top: 1px;">{{mini_currentMonth+1|formatMonthToEn}} {{mini_currentYear}}</span>
				<button class="myMiniCalendar_header_next" @click.stop="mini_calendar_next($event)"></button>
			</div>
			<div class="myMiniCalendar_week">
				<div class="myMiniCalendar_element">Sun</div>
				<div class="myMiniCalendar_element">Mon</div>
				<div class="myMiniCalendar_element">Tue</div>
				<div class="myMiniCalendar_element">Wed</div>
				<div class="myMiniCalendar_element">Thu</div>
				<div class="myMiniCalendar_element">Fri</div>
				<div class="myMiniCalendar_element">Sat</div>
			</div>
			<div class="myMiniCalendar_content">
				<div class="myMiniCalendar_day myMiniCalendar_element" v-for="(index,day) in mini_days" @click="getMiniCalendarDate(day)">					
					<span v-if="day.fullDate!=mini_today_fullDateStr&&day.fullDate!=fulldate" v-bind:style="{color:(index<7&&day.day>7)||(index>20&&day.day<8)?'#dddddd':'#333333'}">{{day.day}}</span>
					<span v-if="day.fullDate==fulldate" class="myMiniCalendar_chooseDay">{{day.day}}</span>
					<span v-if="day.fullDate==mini_today_fullDateStr&&day.fullDate!=fulldate" class="myMiniCalendar_today">{{day.day}}</span>
				</div>
			</div>
			<div class="chooseToday">
				<button @click="chooseToday">today</button>
			</div>
		</div>`,
	methods: {
		initMyMiniCalendar: function() {
			console.log("*********************************");
			console.log(this.config);
			var myStartDate = this.config.beginDate;
			this.setCalendarConfig();
			this.fulldate = "";
			var d;
			if(myStartDate==undefined||myStartDate==""||myStartDate==null){
				d = new Date();
			}else{
				var startArr = myStartDate.split("-");
				d = new Date(startArr[0],startArr[1]-1,startArr[2]);
			}
			
			var d_today = new Date();
			this.mini_today_year = d_today.getFullYear();
			this.mini_today_month = d_today.getMonth();
			this.mini_today_day = d_today.getDate();
			this.mini_today_fullDateStr = this.mini_today_year + "-" + this.formatDateToAddZero(this.mini_today_month + 1) + "-" + this.formatDateToAddZero(this.mini_today_day);
			
//			this.mini_today_year = d.getFullYear();
//			this.mini_today_month = d.getMonth();
//			this.mini_today_day = d.getDate();
//			this.mini_today_fullDateStr = this.mini_today_year + "-" + this.formatDateToAddZero(this.mini_today_month + 1) + "-" + this.formatDateToAddZero(this.mini_today_day);
			
			this.set_my_mini_calendar(d);
		},
		setCalendarConfig: function() {

		},
		getMiniCalendarDate: function(dayObj) {
			this.fulldate = dayObj.fullDate;
			this.$emit('getfulldate',dayObj.fullDate);
			console.log(this.fulldate);
		},
		chooseToday:function(){
			this.$emit('getfulldate',this.mini_today_fullDateStr);
		},
		mini_calendar_pre: function(ev) {
			var events=ev||arguments.callee.caller.arguments[0] || window.event;//获取event属性
			events.stopPropagation();
			var d_pre = new Date(this.mini_currentYear, this.mini_currentMonth - 1);
			this.set_my_mini_calendar(d_pre);
		},
		mini_calendar_next: function(ev) {
			var events=ev||arguments.callee.caller.arguments[0] || window.event;//获取event属性
			events.stopPropagation();
			var d_next = new Date(this.mini_currentYear, this.mini_currentMonth + 1);
			this.set_my_mini_calendar(d_next);
		},
		set_my_mini_calendar: function(d) {
			this.mini_days = new Array();
			var year = d.getFullYear();
			var month = d.getMonth();
			this.mini_currentYear = year;
			this.mini_currentMonth = month;
			//获取当月1日之前的日期
			var d_currentFirst = new Date(year, month, 1);
			var beforMonth = d_currentFirst.getDay();
			for(var i = beforMonth; i > 0; i--) {
				var d_before = new Date(year, month, 1 - i);
				this.mini_days.push({
					year: d_before.getFullYear(),
					month: d_before.getMonth(),
					day: d_before.getDate(),
					time: d_before.getTime(),
					fullDate: d_before.getFullYear() + "-" + this.formatDateToAddZero(d_before.getMonth() + 1) + "-" + this.formatDateToAddZero(d_before.getDate()),
				})
			}
			//获取当月日期
			var d_current = new Date(year, month + 1, 0);
			var currentDaysTotal = d_current.getDate();
			for(var i = 1; i <= currentDaysTotal; i++) {
				this.mini_days.push({
					year: year,
					month: month,
					day: i,
					time: d_current.getTime(),
					fullDate: year + "-" + this.formatDateToAddZero(month + 1) + "-" + this.formatDateToAddZero(i),
				})
			}
			//获取当月之后的日期
			var d_currentAfter = new Date(year, month, currentDaysTotal);
			var afterMonth_day = d_currentAfter.getDay();
			var afterIndex = 6 - afterMonth_day;
			for(var i = 0; i < afterIndex; i++) {
				var d_after = new Date(year, month, currentDaysTotal + i + 1);
				this.mini_days.push({
					year: d_after.getFullYear(),
					month: d_after.getMonth(),
					day: d_after.getDate(),
					time: d_after.getTime(),
					fullDate: d_after.getFullYear() + "-" + this.formatDateToAddZero(d_after.getMonth() + 1) + "-" + this.formatDateToAddZero(d_after.getDate()),
				})
			}
			console.log(this.mini_days);
		},
		formatDateToAddZero: function(num) { //+0
			var formatNum = num < 10 ? ("0" + num) : num;
			return formatNum;
		},
	},
	computed: {}
});