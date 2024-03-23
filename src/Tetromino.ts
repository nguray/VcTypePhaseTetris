import Phaser from 'phaser'
import GameGlobals from './GameGlobals'

export default class Tetromino {

	x = 0;
	y = 0;
	type = 0;
	color = 0xff0000;
	v = [{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}];

	static idTetrisBag = 14;
	static tetrisBag = [1,2,3,4,5,6,7,1,2,3,4,5,6,7];

  
	static readonly geom = [
	  [{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}],
	  [{x:0,y:-1},{x:0,y:0},{x:-1,y:0},{x:-1,y:1}],
	  [{x:0,y:-1},{x:0,y:0},{x:1,y:0},{x:1,y:1}],
	  [{x:0,y:-1},{x:0,y:0},{x:0,y:1},{x:0,y:2}],
	  [{x:-1,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:1}],
	  [{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1}],
	  [{x:-1,y:-1},{x:0,y:-1},{x:0,y:0},{x:0,y:1}],
	  [{x:1,y:-1},{x:0,y:-1},{x:0,y:0},{x:0,y:1}]
	];
  
	static readonly colors = [
	  0x000000,
	  0xff6060,
	  0x60ff60,
	  0x6060ff,
	  0xcccc60,
	  0xcc60cc,
	  0x60cccc,
	  0xdaaa00
	];
  
	constructor( typ: number, x: number, y: number) {
	  this.x = x;
	  this.y = y;
  
	  if (typ>=0 && typ<8){
		this.initShape(typ);
	  }
  
	}

	// min and max included 
	static randomIntFromInterval(min : number, max: number): number { 
		return Math.floor(Math.random() * (max - min + 1) + min)
	}
		
	static tetrisRandomizer() : number{
		let iSrc;
		let ityp;
		//-----------------------------------------
		if (Tetromino.idTetrisBag<14){
		  ityp = Tetromino.tetrisBag[this.idTetrisBag];
		  Tetromino.idTetrisBag++;
		}else{
		  //-- Shuttle
		  for(let i=0;i<this.tetrisBag.length;i++){
			iSrc = Tetromino.randomIntFromInterval(0,13);
			ityp = Tetromino.tetrisBag[iSrc];
			Tetromino.tetrisBag[iSrc] = Tetromino.tetrisBag[0];
			Tetromino.tetrisBag[0] = ityp;
		  }
		  ityp = Tetromino.tetrisBag[0];
		  Tetromino.idTetrisBag = 1;
		}
		return ityp;
	}
	
	initShape(typ: number){
	  this.type = typ;
	  this.color = Tetromino.colors[typ];
	  this.v = new Array();
	  Tetromino.geom[typ].forEach(elem => {
		this.v.push({x: elem.x,y: elem.y});
	  });
  
	}
  
	draw(graphics: Phaser.GameObjects.Graphics) {
  
	  let x;
	  let y;
	  const d = GameGlobals.CELL_SIZE - 1;
	  graphics.fillStyle(this.color);
	  for (const p of this.v) {
		x = GameGlobals.BOARD_LEFT + this.x +  p.x * GameGlobals.CELL_SIZE;
		y = GameGlobals.BOARD_TOP + this.y +  p.y * GameGlobals.CELL_SIZE;
		graphics.fillRect( x, y, d, d);  
	  }
  
	}
  
	rotateLeft() {
	  if (this.type!=5){
		let x;
		let y;
		for (let i=0;i<this.v.length;i++){
		  x = this.v[i].y;
		  y = -this.v[i].x;
		  this.v[i].x = x;
		  this.v[i].y = y;
		}
		
	  }
	}
  
	rotateRight() {
	  if (this.type!=5){
		let x;
		let y;
		for (let i=0;i<this.v.length;i++){
		  x = -this.v[i].y;
		  y = this.v[i].x;
		  this.v[i].x = x;
		  this.v[i].y = y;
		}
	  }
	}
  
	minX() : number {
	  let x;
	  let mX = this.v[0].x;
	  for (let i=1;i<this.v.length;i++){
		  x = this.v[i].x;
		  if (x<mX){
			mX = x;
		  }
	  }
	  return mX;
	}
  
	maxX() : number {
	  let x;
	  let mX = this.v[0].x;
	  for (let i=1;i<this.v.length;i++){
		  x = this.v[i].x;
		  if (x>mX){
			mX = x;
		  }
	  }
	  return mX;
	}
  
	maxY() : number{
	  let y;
	  let mY = this.v[0].y;
	  for (let i=1;i<this.v.length;i++){
		  y = this.v[i].y;
		  if (y>mY){
			mY = y;
		  }
	  }
	  return mY;
	}
  
	column() : number {
	  return Math.trunc(this.x/GameGlobals.CELL_SIZE);
	}
  
	isOutBottomLimit() : boolean {
	  return ((this.maxY())*GameGlobals.CELL_SIZE + this.y)>(GameGlobals.CELL_SIZE*GameGlobals.NB_ROWS);
	}
  
	reachBottomLimit() : boolean {
	  return ((this.maxY()+1)*GameGlobals.CELL_SIZE + this.y)>(GameGlobals.CELL_SIZE*GameGlobals.NB_ROWS);
	}
  
	isOutLeftLimit() : boolean {
	  return (this.minX()*GameGlobals.CELL_SIZE + this.x)<0;
	}
  
	isOutRightLimit(){
	  return ((this.maxX()+1)*GameGlobals.CELL_SIZE+this.x)>(GameGlobals.CELL_SIZE*GameGlobals.NB_COLUMNS);
	}
  
	isOutLRLimit(veloH: number) : boolean{
	  if (veloH<0){
		return this.isOutLeftLimit();
	  }else if (veloH>0){
		return this.isOutRightLimit();
	  }
	  return false;
	}
  
	hitGround(board: Array<number>) : boolean {
	  let x,y;
	  //--------------------------------------------
	  let hit = (x: number,y: number)=>{
		const ix = (x/GameGlobals.CELL_SIZE) | 0;
		const iy = (y/GameGlobals.CELL_SIZE) | 0;
		if ((ix>=0) && (ix<GameGlobals.NB_COLUMNS) && (iy>=0) && (iy<GameGlobals.NB_ROWS)){
		  //console.log(`(${x},${y})--(${ix},${iy})`);
		  //let d = board[iy*GameGlobals.NB_COLUMNS+ix];
		  //console.log(d);
		  if (board[iy*GameGlobals.NB_COLUMNS+ix]!==0){
			//console.log(`(${x},${y})--(${ix},${iy})`);
			//console.log(`(${ix},${iy})`);
			return true;
		  }
		}
		return false;
	  };
  
	  for (const p of this.v){
		//-- Top Left
		x = p.x*GameGlobals.CELL_SIZE + this.x + 1;
		y = p.y*GameGlobals.CELL_SIZE + this.y + 1;
		if (hit(x,y)){
			//console.log(` 111(${x},${y})`);
			return true;
		}
		//-- Top Right
		x = p.x*GameGlobals.CELL_SIZE + GameGlobals.CELL_SIZE - 1 + this.x;
		y = p.y*GameGlobals.CELL_SIZE + this.y + 1;
		if (hit(x,y)){
		  //console.log(`222(${x},${y})`);
		  return true;
		}
		//-- Bottom Right
		x = p.x*GameGlobals.CELL_SIZE + GameGlobals.CELL_SIZE - 1 + this.x;
		y = p.y*GameGlobals.CELL_SIZE + GameGlobals.CELL_SIZE - 1 + this.y;
		if (hit(x,y)){
		  //console.log(`333(${this.x},${this.y})`);
		  return true;
		}
		//-- Bottom Left
		x = p.x*GameGlobals.CELL_SIZE + this.x + 1;
		y = p.y*GameGlobals.CELL_SIZE + GameGlobals.CELL_SIZE - 1 + this.y;
		if (hit(x,y)){
		  //console.log(`444(${x},${y})`);
		  return true;
		}
  
	  }    
  
	  return false;
	}
  
}
