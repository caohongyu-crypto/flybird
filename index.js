var skyDom = document.querySelector('.sky');
var skyStyles = getComputedStyle(skyDom);
var skyWidth = skyStyles.width;
var skyHeight = skyStyles.height;


var landDom = document.querySelector('.land');
var landStyles = getComputedStyle(landDom);
var landWidth = landStyles.width;
var landHeight = landStyles.height;
var landTop = landStyles.top;


var birdDom = document.querySelector('.bird');
var birdStyles = getComputedStyle(birdDom);
var birdWidth = parseFloat(birdStyles.width);
var birdHeight = parseFloat(birdStyles.height);
var birdTop = parseFloat(birdStyles.top);
var birdLeft = parseFloat(birdStyles.left);
var gameDom = document.getElementsByClassName('game')[0];
var gameHeight = gameDom.clientHeight;
var gameWidth = gameDom.clientWidth;


class Rectangle{
	constructor(width, height, left, top, xSpeed, ySpeed, dom){
		this.width = width;
		this.height = height;
		this.left = left;
		this.top = top;
		this.xSpeed = xSpeed;
		this.ySpeed = ySpeed;
		this.dom = dom;
		this.render();
	}
	
	render(){
		this.dom.style.width = this.width + 'px';
		this.dom.style.height = this.height + 'px';
		this.dom.style.top = this.top + 'px';
		this.dom.style.right = this.right + 'px';
		this.dom.style.left = this.left + 'px';
	}
	
	onMove(){
		
	}
	
	move(duration){
		var xDis = this.xSpeed * duration;
		var yDis = this.ySpeed * duration;
		this.left = this.left + xDis;
		this.top = this.top + yDis;
		
		if(this.onMove){
			this.onMove();  //判断是否存在onMove方法,如果存在则调用
		}
		
		this.render();
	}
	

}

//速度向右为正,向左为负
class Sky extends Rectangle{
	constructor(){
		super(skyWidth, skyHeight, 0, 0, -100, 0, skyDom);
	}
	
	onMove(){
		if(this.left <= -parseFloat(skyWidth) / 2){
			this.left = 0;
		}
	}
}



class Land extends Rectangle{
	constructor(speed){
		super(landWidth, landHeight, 0, landTop, speed, 0, landDom);
	}
	
	onMove(){
		if(this.left <= -parseFloat(landWidth) / 2){
			this.left = 0;
		}
	}
	
}



class Bird extends Rectangle{
	constructor(){
		super(birdWidth, birdHeight, birdLeft, birdTop, 0, 0, birdDom);
		this.g = 1500;
		this.maxY = gameHeight - parseFloat(landHeight) - this.height;
		
		this.startStaus = 1;
		this.timer = null;
		this.render();
	}
	
	
	
	
	move(duration){
		super.move(duration);  //重用父类逻辑
		this.ySpeed += this.g * duration;
		
	}
	
	onMove(){
		// console.log(this.top);
		if(this.top < 0){
			this.top = 0;
		}else if(this.top > this.maxY){
			this.top = this.maxY;
		}
		
	}
	
	//开始扇动翅膀
	startMove(){
		// console.log(this.left);
		if(this.timer){
			return;
		}
		
		this.timer = setInterval(() => {
			this.startStaus = (this.startStaus + 1) % 3 + 1;
			this.render();
		}, 300)
	}
	
	render(){
		super.render();
		this.dom.className = `game bird swing${this.startStaus}`;
	}
	
	
	//停止扇动翅膀
	stopMove(){
		clearInterval(this.timer);
		this.timer = null;
	}
	
	jump(){
		this.ySpeed = -350;
	}
	
	
}


class Pipe extends Rectangle {
	constructor(height, top, speed, dom){
		super(52,height, gameWidth, top, speed, 0, dom)
	}
	
	onMove(){
		if(this.left <= -this.width){
			this.dom.remove();
		}
	}
}

function getRandom(min, max){
	return Math.floor(Math.random() * (max - min) + min);
}

class PipePare {
	constructor(speed){
		this.spaceHeight = 150;
		this.minHeight = 80;
		this.maxHeight = parseFloat(landTop) - this.minHeight - this.spaceHeight;
		const upHeight = getRandom(this.minHeight, this.maxHeight);
		
		
		const upDom = document.createElement('div');
		upDom.className = 'pipe up';
		
		this.upPipe = new Pipe(upHeight, 0, speed, upDom);
		const downHeight = parseFloat(landTop) - this.spaceHeight - upHeight;
		const downTop = parseFloat(landTop) - downHeight;
		
		const downDom = document.createElement('div');
		downDom.className = 'pipe down';
		this.downPipe = new Pipe(downHeight, downTop, speed, downDom);
		
		
		
		gameDom.appendChild(upDom);
		gameDom.appendChild(downDom);
		
	}
	
	//该柱子是否移除了视野
	get useLess(){
		return this.upPipe.left < -this.upPipe.width;
	}
	
	move(duration){
		this.upPipe.move(duration);
		this.downPipe.move(duration);
	}
}

class PipePareProducer{
	constructor(speed){
		this.pairs = [];
		this.timer = null;
		this.tick = 1500;
		this.speed = speed;
		this.count = 0;
	}
	
	startProducer(){
		if(this.timer){
			return;
		}
		
		this.timer = setInterval(() => {
			this.scoreNum();
			this.pairs.push(new PipePare(this.speed));
			
			for(let i = 0; i < this.pairs.length; i++){
				var pair = this.pairs[i];
				if(pair.useLess){
					this.pairs.splice(i, 1);
					i--;
				}
			}
			
		}, this.tick);
		
	}
	
	stopProducer(){
		clearInterval(this.timer);
		this.timer = null;
	}
	
	scoreNum(){
		for(let i = 0; i < this.pairs.length; i++){
			var pair = this.pairs[i];
			var upPipeLeft = pair.upPipe.left;
			if(upPipeLeft > 0 && upPipeLeft < 150){
				this.count++;
			}
		}
		if(this.count == 0){
			return 0;
		}else if(this.count > 0){
			return this.count - 1;
		}
	}
}


class Game {
	constructor(){
		this.sky = new Sky();
		this.land = new Land(-100);
		this.bird = new Bird();
		this.pipeProducer = new PipePareProducer(-100);
		this.timer = null; 
		this.tick = 16;
		this.gameOver = false;
	}
	
	start(){
		if(this.timer){
			return;
		}
		
		if(this.gameOver){
			window.location.reload();
		}
		
		//开始生成柱子
		this.pipeProducer.startProducer();
		this.bird.startMove();
		this.timer = setInterval(() => {
			const duration = this.tick / 1000;
			this.sky.move(duration);
			this.land.move(duration);
			this.bird.move(duration);
			this.pipeProducer.pairs.forEach((pair) => {
				pair.move(duration);
			
			},this.tick);
			
			if(this.isGameOver()){
				this.stop();
				var result = this.pipeProducer.scoreNum();
				alert('GameOver! 得分:' + result);
				this.gameOver = true;
			}
		}, this.tick)
		
	}
	

	stop(){
		clearInterval(this.timer);
		this.timer = null;
		this.pipeProducer.stopProducer();
	}
	
	isHit(rec1, rec2){
		var centerX1 = rec1.left + rec1.width / 2;
		var centerY1 = rec1.top + rec1.height / 2;
		var centerX2 = rec2.left + rec2.width / 2;
		var centerY2 = rec2.top + rec2.height / 2;
		
		var disX = Math.abs(centerX1 - centerX2);
		var disY = Math.abs(centerY1 - centerY2);
		
		if(disX < (rec1.width + rec2.width) / 2 && disY < (rec1.height + rec2.height) / 2){
			
			return true;
		}
		return false;
		
	}
	
	isGameOver(){
		if(this.bird.top >= this.bird.maxY){
			return true;
		}
		
		for(let i = 0; i < this.pipeProducer.pairs.length; i++){
			const pair = this.pipeProducer.pairs[i];
	
			 if (this.isHit(this.bird, pair.upPipe) || this.isHit(this.bird, pair.downPipe)) {
				return true;
			}
			
		}
		return false;
	}
	
	
	
	isRegEvent(){
		window.onkeydown = (e) =>{
			if(e.key === 'Enter'){
				if(this.timer){
					this.stop();
				}else{
					this.start();
					
				}
			}else if(e.key === ' '){
				this.bird.jump();
			}
		}
		
	}
	
}

var g = new Game();
g.isRegEvent();