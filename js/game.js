/*
* create by tang during boring National Day 
*/
$(function(){
	const winWidth=$(window).width();//宽度
	const winHeight=$(window).height();//高度
	const clickbound=Math.floor(winWidth/3);//左中右点击边界
	const cns=document.getElementById("colorblock");//canvas画布对象
	const cell=20;//块的边长
	const imgArr=["bgpx.png","block_1.png","block_2.png","block_3.png","block_4.png"];//要加载的图片数组blue/yellow/green/red
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
		$("body").click(()=>{	
			$(".mask").css({
				display:"none"
			});
		})
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
					if(_temp>=imgs.length){
						callback&&callback(cns,imgObjs);
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
            	this.shame=[{i:this.i,j:this.j-1},
            				{i:this.i-1,j:this.j},
            				{i:this.i,j:this.j},
            				{i:this.i,j:this.j+1}]
            	break;
            	case 3://L
            	this.shame= [{i: this.i - 2, j: this.j - 1},
                        	 {i: this.i - 1, j: this.j - 1},
                        	 {i: this.i, j: this.j - 1},
                        	 {i: this.i, j: this.j}];
                break;
                case 4://田
                this.shame=[{i: this.i - 1, j: this.j - 1},
                        	{i: this.i, j: this.j - 1},
                        	{i: this.i, j: this.j},
                        	{i: this.i - 1, j: this.j}];
                break;
                case 5://转
                this.shame=[{i: this.i - 1, j: this.j - 1},
                        	{i: this.i, j: this.j - 1},
                        	{i: this.i, j: this.j},
                        	{i: this.i + 1, j: this.j}];
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
            //
            this.isReady=function(){
            	return this.speed==this.defer;
            };
		};

		//背景
		var background={
			bgimg:imgObjs["bgpx.png"],
			blockimg:[imgObjs["block_1.png"],imgObjs["block_2.png"],imgObjs["block_3.png"],imgObjs["block_4.png"]],
			block:new block(1),
			matrix:new Array(21),
			score:0,//分数
			init:function(){
				var that=this;
				for(var i=0;i<21;i++){
					this.matrix[i]=new Array(12);
					for(var j=0;j<12;j++){
						this.matrix[i][j]=-1;
						ctx.drawImage(this.bgimg,j*cell,i*cell,this.bgimg.width,this.bgimg.height);
					}
				}
				$("body").click((event)=>{
					var x=event.pageX;
					if(x>=0&&x<=clickbound*1){
						that.setSite(-1)
					}else if(x>1*clickbound&&x<=2*clickbound){
						console.log("mid");
					}else{
						that.setSite(1);}
					})
			},
			start:function(){
				var that=this;
				timer=setInterval(()=>{
					this.block.dropBlock();//下落
					this.refresh();//刷新矩阵
					//this.reachBottom();//检测是否碰到地板或有方块

				},config.TIME);
			},
			refresh:function(){
				var img=null;
				var that=this;
				//矩阵走过的位置都置回-1
				that.block.shame.forEach((item)=>{
					if(item.i>0&&that.matrix[item.i-1][item.j]!=1){
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
					if(shame.i>=0 && ((background.matrix[shame.i][shame.j+dir]==1) || (shame.j+dir==-1 || shame.j + dir ==12))){
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
		};	
		background.init();
		background.start();
	}

	//入口函数
	function main(){
		loadImage(imgArr,canvas);
	};
});