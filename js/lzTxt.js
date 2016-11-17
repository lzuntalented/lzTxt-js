(function(){
	function lzTxt(){
		this.version = "1.0.0";
		this.author = "lz";
	}
	
	var _default = {
		origin_txt : "",//文字文本
		origin_txt_list : "",//分割的文本列表
		origin_txt_split : "\r\n",//分割标示
		
		width : 0,
		height : 0,
		
		/*钩子*/
		hook_page_start: null,//开始分页计算
		hook_page_end: null,//结束分页计算
		
		page_draw_start: null,//单页开始绘制之前操作
	};
	
	/*字体尺寸*/
	var font = {
		size: 16
	}

	var panel = {
		col: Math.floor(_default.width / font.size),//列数
		row: Math.floor(_default.height / font.size),//行数
		space: 2,
	}
	
	var page_list = [
		{
			line: 0,
			offset : 0
		}
	];
	
	/*初始化*/
	lzTxt.prototype.init = function(config){
		for(var i in config){
			_default[i] = config[i];
		}
		
		_default.origin_txt_list = _default.origin_txt.split(_default.origin_txt_split);
		panel = {
			col: Math.floor(_default.width / font.size),//列数
			row: Math.floor(_default.height / font.size),//行数
		}
		pages();
	}
	
	/*获取本地文件内容*/
	lzTxt.read_file = function(){
		
	}
	
	/*开始分页*/
	var pages = function(){
		typeof _default.hook_page_start === "function" && _default.hook_page_start(); 

		var i = 0;
		while(true){
			var page_cur = page_list.length - 1;
//			console.log(page_list[page_cur]);
			var page = page_next(page_list[page_cur].line,page_list[page_cur].offset);
			page_list.push(page);
			if(page.line >= _default.origin_txt_list.length){
				break;
			}
		}
		typeof _default.hook_page_end === "function" && _default.hook_page_end(); 
	}
	
	/*获取当前分页信息*/
	lzTxt.prototype.get_page_list = function(){
		return page_list;
	}
	
	/*重置单页绘制之前的操作*/
	lzTxt.prototype.set_page_draw_start = function(func){
		if(typeof func === "function")
			_default.page_draw_start = func;
	}
	
	
	/*开始真实绘制下一屏*/
	function page_next(page_current,page_offset){
		/*返回结果*/
		var result = {
			line : 0,
			offset : 0,
			list : []
		}
		var str_write_list = _default.origin_txt_list;
		var total = panel.col * panel.row * 2;//字符有占一位和两位的，一行最多可绘制2倍长度
		var current = page_current;
		var total = panel.col * panel.row * 2;//字符有占一位和两位的，一行最多可绘制2倍长度
		var count = 0;
		var tag = false;

		var tmp_all_write = [];
		var isBreak = false;//检查是否正常跳出
		while(current < str_write_list.length){
			
			var len = str_write_list[current].length;
			var tmp_write = [];
			var str = str_write_list[current];
			var start = 0;
			if(!tag){
				start = page_offset;
				tag = true;
			}
			
			var tmp = 0;
			var begin = start;
			for(var i = start; i < len ; i ++ ){
				//逐个检查
				if(tmp >= panel.col * 2 - 1){
					tmp_write.push(str.substring(begin,i));
					begin = i;
					tmp = 0;
				}
				
				var len_char = 1;
				if(str.charCodeAt(i) > 128){
					len_char = 2;
				}
				
				tmp += len_char;
			}
			
			if(tmp > 0){
				tmp_write.push(str.substring(begin,i))
			}
			
			if(str == "") {
				tmp_write.push("");
			};
			
			var offset = 0;
			if(tmp_all_write.length + tmp_write.length > panel.row) {
				for(var i = 0 ; i < tmp_all_write.length ; i ++){
					result.list.push(tmp_all_write[i]);
				}
				
				for(var j = 0 ; j < tmp_write.length && j + i < panel.row ; j ++){
					offset += tmp_write[j].length;
					result.list.push(tmp_write[j]);
				}
				
				result.line = current;
				result.offset = offset;
				isBreak = true;
				break	;
			}

			tmp_all_write = tmp_all_write.concat(tmp_write);

			current ++;
		}
		/*未正常跳出，表示到达书尾，直接绘制*/
		if(!isBreak){
			for(var i = 0 ; i < tmp_all_write.length ; i ++){
				result.line = current;
				result.offset = 0;
				result.list.push(tmp_all_write[i]);
			}
		}
		
		return result;
	}
	
	var current_page = 0;
	
	/*渲染页面*/
	lzTxt.prototype.render = function(page){
		if(page <= 0 || page >= page_list.length) 
			return false ;
			
		ctx.clearRect(0,0,_default.width,_default.height);
		
		current_page = page;
		/*开始绘制画布之前的操作*/
//		ctx.save();
		typeof _default.page_draw_start === "function" && _default.page_draw_start();
//		ctx.restore();
		
		var list = page_list[page].list;
		for(var i = 0; i < list.length;i++){
			ctx.fillText(list[i],0,(i + 1) * font.size);
		}
		return true;
	}
	
	/*获取当前电子书的进度*/
	lzTxt.prototype.get_progress = function(){
		return {
			page: current_page,
			total: page_list.length
		}
	}
	
	window.lzTxt = window.lzTxt || new lzTxt();
})();
