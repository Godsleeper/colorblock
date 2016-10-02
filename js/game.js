/*
* create by tang during boring National Day 
*/
$(function(){
	const winWidth=$(window).width();//宽度
	const winHeight=$(window).height();//高度
	const clickbound=Math.floor(winWidth/3);//左中右点击边界
	const cns=document.getElementById("colorblock");//canvas画布对象
	const cell=20;//块的边长
	const imgArr=["background.jpg","bgpx.png","block_1.png","block_2.png","block_3.png","block_4.png"];//要加载的图片数组blue/yellow/green/red
	//参数
	const config={
		I:-1,               //方块出现的起始行位置
		J:6,                //方块出现的启示列位置
		SPEED:25,           //正常速度
		FASTSPEED:1,        //最快速度
		TIME:40             //刷新速度
	};

	//遮罩
	~function beforeStart(){
		$("body").height(winHeight+"px");
		main();
	}();

	function loadImage(images,callback){
		var imgObjs={};

		var imgObjCreater=function(img){
			var imgObj = new Image();
			imgObj.src="./images/"+img;
			return imgObj;
		}
		var allImgLoader=function(imgs){
			var _temp=0;
			for(var i=0;i<imgs.length;i++){
				imgObjs[imgs[i]]=imgObjCreater(imgs[i]);
				imgObjs[imgs[i]].onload=()=>{
					this.height=this.height;
					this.width=this.width;
					_temp++;
					var rate=Math.floor((_temp/imgs.length)*100);
					console.log(rate);
					$("#loadrate").text(rate+"%");
					if(_temp>=imgs.length){
						$(".main").css({
							display:"block"
						})
						$("body").on("click",()=>{	
							$(".mask").css({
								display:"none"
							});
							callback&&callback(cns,imgObjs);
						})
					}
				}
			}
		}
		allImgLoader(images);
	}
	
	//随机数生成
	function random(max){
		return Math.floor(Math.random()*max)+1;
	}

	//游戏主函数
	function canvas(cns,imgObjs){
		var ctx=cns.getContext('2d');//获得2d上下文
		var timer=null;//时间
		var next=random(5);
		//方块
		var block=function(type){
			this.type=type;//类型 
			this.i = config.I; // 初始行位置
            this.j = config.J; // 初始列位置
            this.speed = config.SPEED; // 初始速度
            this.defer = 0; // 延迟累计
            this.shame=[];//形状
            switch(this.type){
            	case 1://1
            	var color=[];
            	for(var k=0;k<4;k++){
            		color.push(random(4));
            	}
            	this.shame=[{i:this.i,j:this.j,color:color[0]},
            				{i:this.i-1,j:this.j,color:color[1]},
            				{i:this.i-2,j:this.j,color:color[2]},
            				{i:this.i-3,j:this.j,color:color[3]}]
            	break;
            	case 2://土
            	var color=[];
            	for(var k=0;k<4;k++){
            		color.push(random(4));
            	}
            	this.shame=[{i:this.i,j:this.j-1,color:color[0]},
            				{i:this.i-1,j:this.j,color:color[1]},
            				{i:this.i,j:this.j,color:color[2]},
            				{i:this.i,j:this.j+1,color:color[3]}]
            	break;
            	case 3://L
            	var color=[];
            	for(var k=0;k<4;k++){
            		color.push(random(4));
            	}
            	this.shame= [{i: this.i - 2, j: this.j - 1,color:color[0]},
                        	 {i: this.i - 1, j: this.j - 1,color:color[1]},
                        	 {i: this.i, j: this.j - 1,color:color[2]},
                        	 {i: this.i, j: this.j,color:color[3]}];
                break;
                case 4://田
                var color=[];
            	for(var k=0;k<4;k++){
            		color.push(random(4));
            	}
                this.shame=[{i: this.i - 1, j: this.j - 1,color:color[0]},
                        	{i: this.i, j: this.j - 1,color:color[1]},
                        	{i: this.i, j: this.j,color:color[2]},
                        	{i: this.i - 1, j: this.j,color:color[3]}];
                break;
                case 5://转
                var color=[];
            	for(var k=0;k<4;k++){
            		color.push(random(4));
            	}
                this.shame=[{i: this.i - 1, j: this.j - 1,color:color[0]},
                        	{i: this.i, j: this.j - 1,color:color[1]},
                        	{i: this.i, j: this.j,color:color[2]},
                        	{i: this.i + 1, j: this.j,color:color[3]}];
                break;
            }
            //下落方块
            this.dropBlock=function(){
            	if(this.defer==this.speed){
            		this.shame.map((item)=>{
            			item.i=item.i+1;
            		})
            		this.defer=0;
            	}else{
            		this.defer++;
            	}
            };
            //加速下滑
            this.speedUp= function () { 
                this.speed = 1;
                this.defer = 0;
            };
            //检测是否下落
            this.isReady=function(){
            	return this.speed==this.defer;
            };
		};

		//背景
		var background={
			bgimg:imgObjs["bgpx.png"],
			blockimg:[imgObjs["block_1.png"],imgObjs["block_2.png"],imgObjs["block_3.png"],imgObjs["block_4.png"]],
			block:new block(4),
			matrix:new Array(21),
			score:0,//分数
			next:next,
			init:function(){
				var that=this;
				for(var i=0;i<21;i++){
					this.matrix[i]=new Array(12);
					for(var j=0;j<12;j++){
						this.matrix[i][j]=-1;
						ctx.drawImage(this.bgimg,j*cell,i*cell,this.bgimg.width,this.bgimg.height);
					}
				}
				$(".main").click((event)=>{
					var x=event.pageX;
					if(x>=0&&x<=clickbound*1){
						that.setSite(-1)
					}else if(x>1*clickbound&&x<=2*clickbound){
						that.rotateBlock();
					}else{
						that.setSite(1);}
						return false;
					})
				$(".speedup").click((event)=>{
					event.stopPropagation();
					 if(that.block.speed == config.SPEED){
                     	that.block.speedUp(); // 加速
					 }
				})
			},
			start:function(){
				var that=this;
				timer=setInterval(()=>{
					this.block.dropBlock();//下落
					this.refresh();//刷新矩阵
					this.reachBottom();//检测是否碰到地板或有方块
				},config.TIME);
			},
			refresh:function(){
				var img=null;
				var that=this;
				//矩阵走过的位置都置回-1
				that.block.shame.forEach((item)=>{
					if(item.i>0&&(that.matrix[item.i-1][item.j]!=1||that.matrix[item.i-1][item.j]!=2||that.matrix[item.i-1][item.j]!=3||that.matrix[item.i-1][item.j]!=4)){
						that.matrix[item.i-1][item.j]=-1;
					}
				});
				//矩阵方块部分设为与颜色对应的数值
				that.block.shame.forEach((item)=>{
					if(item.i>=0){
						switch(item.color){
							case 1:
							that.matrix[item.i][item.j]=5;break;
							case 2:
							that.matrix[item.i][item.j]=6;break;
							case 3:
							that.matrix[item.i][item.j]=7;break;
							case 4:
							that.matrix[item.i][item.j]=8;break;
						}
						
					}
				});
				//根据数值重绘页面
				that.matrix.forEach((item,index)=>{
					item.forEach((i,j)=>{
						switch(i){
							case -1:img=that.bgimg;break;
							case 1:img=that.blockimg[0];break;
							case 2:img=that.blockimg[1];break;
							case 3:img=that.blockimg[2];break;
							case 4:img=that.blockimg[3];break;
							case 5:img=that.blockimg[0];break;
							case 6:img=that.blockimg[1];break;
							case 7:img=that.blockimg[2];break;
							case 8:img=that.blockimg[3];break;
						}
						ctx.drawImage(img,j*cell,index*cell,img.width,img.height);
					})
				});
			},
			setSite:function(dir){
				var i;
				var shame;
				var length=this.block.shame.length;
				for(i=0;i<length;i++){
					shame=this.block.shame[i];
					if(shame.i>=0 && ((background.matrix[shame.i][shame.j+dir]==1)||(background.matrix[shame.i][shame.j+dir]==2)||(background.matrix[shame.i][shame.j+dir]==3)||(background.matrix[shame.i][shame.j+dir]==4) || (shame.j+dir==-1 || shame.j + dir ==12))){
						break;
					}
				}
				if(i==length){
					this.block.shame.forEach(function(item){
						if(item.i>=0){
								background.matrix[item.i][item.j]=-1;
								item.j=(item.j+dir==-1||item.j+dir==12)?item.j:item.j+dir;
							switch(item.color){
								case 1:
								background.matrix[item.i][item.j]=5;break;
								case 2:
								background.matrix[item.i][item.j]=6;break;
								case 3:
								background.matrix[item.i][item.j]=7;break;
								case 4:
								background.matrix[item.i][item.j]=8;break;
								}
						}else{
							item.j=(item.j+dir==-1||item.j+dir==12)?item.j:item.j+dir;
						}
					})
				}
			},
			reachBottom:function(){
				var that=this;
				var i=0;
				var j=0;
				var length=that.block.shame.length;
				var xy;
				if(that.block.isReady()){
					for(j=0;j<length;j++){
						xy=that.block.shame[j];
						if(xy.i>=0&&(xy.i==20||that.matrix[xy.i+1][xy.j]==1||that.matrix[xy.i+1][xy.j]==2||that.matrix[xy.i+1][xy.j]==3||that.matrix[xy.i+1][xy.j]==4)){
							break;
						}
					}

					if(j<length){
						for(i=0;i<length;i++){
							xy=that.block.shame[i];
							if(xy.i>=0){
								that.matrix[xy.i][xy.j]=xy.color;
							}else{
								that.gameover();
								return;
							}
						}
						that.ruinMat();
						that.block = new block(parseInt(Math.random()*5)+1);
					}
				}
			},
			gameover:function(){
				clearInterval(timer);
				$(".rate").html("<span style='color:#FF3C3C;font-weight:bold'>你挂了,嘻嘻</span>");
				$(".mask").css({
					display:"block"
				})
			},
			rotatePoint: function (c, p,color) { // c点为旋转中心，p为旋转点，一次顺时针旋转90度。返回旋转后的坐标
                return {j: p.i - c.i + c.j, i: -p.j + c.i + c.j,color:color};
            },
			rotateBlock:function(){
				 var that = this, i, o = null, ctr = that.block.shame[1], l = that.block.shame.length;
				 if (that.block.type != 4) { 
				 for (i = 0; i < l; i++) {
                        o = that.rotatePoint(ctr, that.block.shame[i],that.block.shame[i].color);
                        if (o.j < 0 || o.j > 11 || o.i > 20) { // 旋转时不可以碰到边界
                            break;
                        }
                        else if (o.i > 0 && o.j >= 0 && o.j <= 20 && ((background.matrix[o.i][o.j] == 1)||( background.matrix[o.i][o.j] == 2)||( background.matrix[o.i][o.j] == 3)|| (background.matrix[o.i][o.j] == 4))) { // 旋转时不可以已有方块的点
                            break;
                        }
                    }
                if (i == 4) {
                        that.block.shame.forEach(function (o, i){
                            if (o.i >= 0)
                                that.matrix[o.i][o.j] = -1; // 清空变化前的位置
                            that.block.shame[i] = that.rotatePoint(ctr, o,o.color);
                        });
                    }
                }else{
                	for(i=0;i<l;i++){
                		if(that.block.shame[i].j<0||that.block.shame[i].j>11||that.block.shame[i].i>20){
                			break;
                		}else if(that.block.shame[i].i>0&&that.block.shame[i].j>=0&&that.block.shame[i].j<=20&&((background.matrix[that.block.shame[i].i][that.block.shame[i].j]==1)||(background.matrix[that.block.shame[i].i][that.block.shame[i].j]==2)||(background.matrix[that.block.shame[i].i][that.block.shame[i].j]==3)||(background.matrix[that.block.shame[i].i][that.block.shame[i].j]==4))){
                			break;
                		}
                	}
                	if (i == 4) {
                        that.block.shame.forEach((o,i)=>{
                            if (o.i >= 0)
                                that.matrix[o.i][o.j] = -1; // 清空变化前的位置
                        });
                     var _color=that.block.shame[0].color;
            		 that.block.shame[0].color=that.block.shame[1].color;
            		 that.block.shame[1].color=that.block.shame[2].color;
            		 that.block.shame[2].color=that.block.shame[3].color;
            		 that.block.shame[3].color=_color;
                    }
                }
			},
			// detectTree:function(){
			// 	//横=>层遍历
			// 	console.log(background.matrix);
			// 	for(let i=0;i<background.matrix.length;i++){
			// 		var strArr=background.matrix[i].join("");
			// 		strArr=strArr.replace(/(1{3})|(2{3})|(3{3})|(4{3})/g,"000");
			// 		strArr=strArr.split("");
			// 		for(let j=0;j<background.matrix[i].length;j++){
			// 			background.matrix[i][j]=strArr[j];
			// 		}
			// 	}
			// 	// background.matrix.forEach((item,index)=>{
			// 	// 	var strArr=item.join("");
			// 	// 	strArr=strArr.replace(/(1{3})|(2{3})|(3{3})|(4{3})/g,"000");
			// 	// 	item=strArr.split("");
			// 	// })
			// },
			// ruinBlock:function(){
			// }
			detectMat: function () { // 检测矩阵，判断是否有连续一行，返回一个数组
                var count = 0, s,
                    detecta = []; // 需要爆破的行号
                this.matrix.forEach(function (l, i) {
                    for(s = 0; s < l.length; s ++){
                        if(l[s] == 1||l[s] == 2||l[s] == 3||l[s] == 4) count ++; else break;
                    }
                    count == 12 && detecta.push(i);
                    count = 0;
                });
                return detecta.length == 0 ? false : detecta;
            },
            ruinMat: function () { // 爆破连续的一行
                var dmat = this.detectMat(); // 返回整行都有方块的行号集合
                if(dmat){
                    this.score = this.score + (dmat.length == 1 ? 100 : dmat.length == 2 ? 250 : dmat.length == 3 ? 450 : 700);
                    $("#score").text(this.score.toString());
                    dmat.forEach(function (d) {
                        background.matrix.splice(d, 1); // 删掉整行都有方块的行
                        background.matrix.unshift([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]); // 弥补被删的行
                    });
                }
                dmat = null;
            },
		};	
		background.init();
		background.start();
	}

	//入口函数
	function main(){
		loadImage(imgArr,canvas);
	};
});