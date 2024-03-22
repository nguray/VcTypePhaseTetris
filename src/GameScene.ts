import Phaser from 'phaser'
import GameGlobals from './GameGlobals'
import Tetromino from './Tetromino'
import GameOverScene from './GameOverScene'
import HighScoreScene from './HighScoreScene';


interface ScoreValue {
	[i: number]: number
}

export default class GameScene extends Phaser.Scene {

	private graphics!: Phaser.GameObjects.Graphics;
	
	private keySpace: Phaser.Input.Keyboard.Key | undefined;
	//private keyDown: Phaser.Input.Keyboard.Key | undefined;

	private textScore!: Phaser.GameObjects.Text;

	curTetromino: Tetromino = new Tetromino(0,80,80);

	board = new Array(GameGlobals.NB_COLUMNS*GameGlobals.NB_ROWS);
	
	fPause: boolean = false;
	fDrop: boolean = false;
	velocityX: number = 0;
	startTimeV: number = 0;
	startTimeH: number = 0;
	startTimeR: number = 0;
	horizontalMove: number = 0;
	horizontalStartColumn: number = 0;
	fFastDown: boolean = false;
	playerName: string = '';
	nbCompleteLines = 0;

	tetrisMusic: any;
	succesSound: any;


	//private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

	constructor() {
		super('scene-game')
	}

	
	newTetromino(){
		//--
		this.curTetromino.initShape(GameGlobals.nextTetromino.type);
		//this.curTetromino.initShape(4);
		this.curTetromino.x = Math.trunc(6*GameGlobals.CELL_SIZE);
		this.curTetromino.y = 0;
		this.curTetromino.y = -Math.trunc(this.curTetromino.maxY()*GameGlobals.CELL_SIZE);
		GameGlobals.nextTetromino.initShape(Tetromino.tetrisRandomizer());
		//console.log(`New(${this.curTetromino.x},${this.curTetromino.y})`);
	
	}

	computeCompleteLines(){
		let nbLines = 0;
		let fCompleted = false;
		//------------------------------
		for (let r=0;r<GameGlobals.NB_ROWS;r++){
			fCompleted = true;
			for (let c=0;c<GameGlobals.NB_COLUMNS;c++){
				if (this.board[r*GameGlobals.NB_COLUMNS+c]==0){
					fCompleted = false;
					break;
				}
			}
			if (fCompleted){
				nbLines++;
			}
		}
		return nbLines;

	}

	tblScoreValues: ScoreValue = {
		0: 0,
		1: 50,
		2: 200,
		3: 400,
		4: 1200
	}
	
	computeScore(nbLines: number): number{

		let v = this.tblScoreValues[nbLines];
		if (v==undefined){
			return 2000;
		}
		return v;

	}
	
	freezeCurTetromino(){
		let x,y;
		let ix = Math.trunc((this.curTetromino.x + 1)/GameGlobals.CELL_SIZE);
		let iy = Math.trunc((this.curTetromino.y + 1)/GameGlobals.CELL_SIZE);
		for(const p of this.curTetromino.v){
			x = p.x + ix;
			y = p.y + iy;
			if ((x>=0) && (x<GameGlobals.NB_COLUMNS) && (y>=0) && (y<GameGlobals.NB_ROWS)){
			this.board[y*GameGlobals.NB_COLUMNS+x] = this.curTetromino.type;
			}
		}
		this.nbCompleteLines = this.computeCompleteLines();
		if (this.nbCompleteLines>0) {
			GameGlobals.curScore += this.computeScore(this.nbCompleteLines);
			this.updateScoreDiplay();
			//localStorage.setItem('TetrisHighScore',this.curScore.toString());
		}

	}
	
	eraseFirstCompletedLine(){
		let fCompleted;
		//------------------------------------
		for (let r=0;r<GameGlobals.NB_ROWS;r++){
			fCompleted = true;
			for (let c=0;c<GameGlobals.NB_COLUMNS;c++){
				if (this.board[r*GameGlobals.NB_COLUMNS+c]==0){
					fCompleted = false;
					break;
				}
			}
			if (fCompleted){
				//-- Shift Down
				for (let r1=r;r1>0;r1--){
					let rSrc = (r1-1)*GameGlobals.NB_COLUMNS;
					let rDes = r1*GameGlobals.NB_COLUMNS;
					for (let c1=0;c1<GameGlobals.NB_COLUMNS;c1++){
					this.board[rDes+c1] = this.board[rSrc+c1];
					}
				}
				return;
			}
		}
	}
	
	isGameOver(){
		//-------------------------------------
		for (let i=0;i<GameGlobals.NB_COLUMNS;i++){
			if (this.board[i]!=0){
				return true;
			}
		}
		return false;
	}
	
	clearBoard(){
		for (let i=0;i<GameGlobals.NB_COLUMNS*GameGlobals.NB_ROWS;i++){
		  this.board[i] = 0;
		}
	}
	
	drawBoard(){
		//-----------------------------------------
		this.graphics.fillStyle(0x000030);
		this.graphics.fillRect( GameGlobals.BOARD_LEFT, GameGlobals.BOARD_TOP,
			 GameGlobals.NB_COLUMNS*GameGlobals.CELL_SIZE, GameGlobals.NB_ROWS*GameGlobals.CELL_SIZE);  
	
		let x;
		let y;
		let ityp;
		let d = GameGlobals.CELL_SIZE - 1;
		for (let j=0;j<GameGlobals.NB_ROWS;j++){
		  for (let i=0;i<GameGlobals.NB_COLUMNS;i++){
			ityp = this.board[j*GameGlobals.NB_COLUMNS+i];
			if (ityp!==0){
			  x = GameGlobals.BOARD_LEFT + i*GameGlobals.CELL_SIZE;
			  y = GameGlobals.BOARD_TOP + j*GameGlobals.CELL_SIZE;
			  this.graphics.fillStyle(Tetromino.colors[ityp]);
			  this.graphics.fillRect( x, y, d, d);  
			}
		  }
		}
	}

	initGame(){
		this.clearBoard();
		this.fDrop = false;
		this.startTimeH = 0;
		this.startTimeR = 0;
		this.startTimeV = 0;
		this.nbCompleteLines = 0;
		GameGlobals.curScore = 0;
	}	
	
	preload() {
		this.load.audio('tetrisMusic','public/assets/Tetris.ogg');
		this.load.audio('succesSound','public/assets/109662__grunz__success.wav');
	}

	create() {


		this.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }, fillStyle: { color: 0xff0000 }});

		this.tetrisMusic = this.sound.add('tetrisMusic');
		this.tetrisMusic.play({
			loop: true,
			volume: 0.10
		});

		this.succesSound = this.sound.add('succesSound');

		this.initGame();

		this.newTetromino();

		// if (this.input.keyboard){
		// 	this.input.keyboard.on('keydown-UP', (event: KeyboardEvent)=>{
		// 		console.log("Arrow UP");
		// 	});
		// }


		if (this.input.keyboard){

			this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
			this.keySpace.on('down', (event: KeyboardEvent)=>{
				this.fDrop = true;
			});

			let keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
			keyEsc.on('down', (event: KeyboardEvent)=>{
				this.tetrisMusic.stop();
				GameGlobals.idHighScore = this.isHighScore(GameGlobals.curScore);
				if ((GameGlobals.curScore!=0) && (GameGlobals.idHighScore>=0)){
					this.insertHighScore(GameGlobals.idHighScore, GameGlobals.playerName, GameGlobals.curScore);
					this.initGame();
					this.scene.start('high-score', HighScoreScene);
				}else{
					this.initGame();
					this.scene.start('gameover', GameOverScene);
				}

			});

			let keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
			keyUp.on('down', (event: KeyboardEvent)=>{
				//console.log("UP press");
				this.curTetromino.rotateLeft();
				if (this.curTetromino.hitGround(this.board)){
				  //-- Undo Rotate
				  this.curTetromino.rotateRight();
				}else if (this.curTetromino.isOutRightLimit()){
				  let backupX = this.curTetromino.x;
				  do{
					this.curTetromino.x--;
				  }while(this.curTetromino.isOutRightLimit());
				  if (this.curTetromino.hitGround(this.board)){
					//-- Undo Move
					this.curTetromino.x = backupX;
					//-- Undo Rotate
					this.curTetromino.rotateRight();
				  }
				}else if (this.curTetromino.isOutLeftLimit()){
				  let backupX = this.curTetromino.x;
				  do{
					this.curTetromino.x++;
				  }while (this.curTetromino.isOutLeftLimit());
				  if (this.curTetromino.hitGround(this.board)){
					//-- Undo Move
					this.curTetromino.x = backupX;
					//-- Undo Rotate
					this.curTetromino.rotateRight();
				  }
				}
		  
			});

			let keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
			keyLeft.on('down', (event: KeyboardEvent)=>{
				this.velocityX = -1;
			});
			keyLeft.on('up', (event: KeyboardEvent)=>{
				this.velocityX = 0;
			});

			let keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
			keyRight.on('down', (event: KeyboardEvent)=>{
				this.velocityX = 1;
			});
			keyRight.on('up', (event: KeyboardEvent)=>{
				this.velocityX = 0;
			});

			let keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
			keyDown.on('down', (event: KeyboardEvent)=>{
				this.fFastDown = true;
			});
			keyDown.on('up', (event: KeyboardEvent)=>{
				this.fFastDown = false;
			});

		}

		this.textScore = this.add.text(GameGlobals.BOARD_LEFT,
			 GameGlobals.BOARD_TOP+GameGlobals.NB_ROWS*GameGlobals.CELL_SIZE+12,
			 'SCORE : 00000', 
			 {
				fontFamily: 'sansation',
				fontSize : 18,
				fontStyle : 'bold italic',
				color: '#ffff00'
			}
		);

	}

	updateScoreDiplay(){
		const s1 = "00000" + GameGlobals.curScore;
		const s2 = s1.substring(s1.length-6);
		this.textScore.setText(`SCORE : ${s2}`);
	
	}
	
	isHighScore(newScore: number){
		//---------------------------------------
		for (let i=0;i<GameGlobals.highScores.length;i++){
			if (newScore>=GameGlobals.highScores[i].score){
				return i;
			}
		}
		return -1;
	}

	insertHighScore(id: number, playerName: string, playerScore: number){
		if ((id>=0)&&(id<10)){
			if (id==9){
				GameGlobals.highScores[9].player = playerName;
				GameGlobals.highScores[9].score = playerScore;
			}else{
				//-- Shift Down Array
				for (let i=9;i>id;i--){
					GameGlobals.highScores[i].player = GameGlobals.highScores[i-1].player;
					GameGlobals.highScores[i].score  = GameGlobals.highScores[i-1].score;	
				}
				GameGlobals.highScores[id].player = playerName;
				GameGlobals.highScores[id].score = playerScore;
			}
		}
	}

	update(timestep: number, dt: number) {

		//---------------------------------------
		let curTime = Math.trunc(timestep);

        if (this.nbCompleteLines>0){
			if ((curTime-this.startTimeV)>250){
				this.startTimeV = curTime;
				this.nbCompleteLines--;
				this.eraseFirstCompletedLine();
			  	//-- Play Sound
				this.succesSound.play({
					loop: false,
				 	volume: 0.15
				   });
		  
			}
		}else if (this.horizontalMove!==0){
			//--
			if ((curTime-this.startTimeH)>15){
				this.startTimeH = curTime;
				for (let i=0;i<4;i++){
					let backupX = this.curTetromino.x;
					this.curTetromino.x += this.horizontalMove;
					if (this.curTetromino.isOutLRLimit(this.horizontalMove)){
						this.curTetromino.x = backupX;
						this.horizontalMove = 0;
						break;
					}else if (this.curTetromino.hitGround(this.board)){
						this.curTetromino.x = backupX;
						this.horizontalMove = 0;
						break;
					}
					if (this.horizontalMove!=0){
						if (this.horizontalStartColumn!=this.curTetromino.column()){
							this.curTetromino.x = backupX;
							this.horizontalMove = 0;
							this.startTimeH = curTime;
							break;
						}
					}
				}
			}
  
		}else if (this.fDrop){
			//--
			if ((curTime-this.startTimeV)>10){
				this.startTimeV = curTime;
				for (let i=0;i<6;i++){
				//-- Move down and check
				this.curTetromino.y++;
				if (this.curTetromino.hitGround(this.board)){
					this.curTetromino.y--;
					this.freezeCurTetromino();
					this.newTetromino();
					this.fDrop = false;
				}else if (this.curTetromino.reachBottomLimit()){
					this.curTetromino.y--;
					this.freezeCurTetromino();
					this.newTetromino();
					this.fDrop = false;
				}
				if (this.fDrop){
					if (this.velocityX!=0){
						if ((curTime-this.startTimeH)>20){
							let backupX = this.curTetromino.x;
							this.curTetromino.x += this.velocityX;
							if (this.curTetromino.isOutLRLimit(this.velocityX)){
							this.curTetromino.x = backupX;
							}else if (this.curTetromino.hitGround(this.board)){
							this.curTetromino.x = backupX;
							}else{
							this.startTimeH =curTime;
							this.horizontalMove = this.velocityX;
							this.horizontalStartColumn = this.curTetromino.column();
							break;
							}
						}
					}
				}
				}
			}
  
		}else{
			//--
			let limitElapse = (this.fFastDown ? 15 : 30);
			//console.log(curTime);
			if ((timestep-this.startTimeV)>limitElapse){
				this.startTimeV = curTime;
			  //console.log(timestep);
			  for (let i=0;i<3;i++){
				this.curTetromino.y++;
				let fMove = true;
				if (this.curTetromino.hitGround(this.board)){
				  //curMode = GameMode.STAND_BY;
				  this.curTetromino.y -= 1;
				  this.freezeCurTetromino();
				  this.newTetromino();
				  fMove = false;  
				}else if (this.curTetromino.reachBottomLimit()){
				  this.curTetromino.y--;
				  this.freezeCurTetromino();
				  this.newTetromino();
				  fMove = false;
				}
	
				if (fMove){
				  if (this.velocityX!=0){
					//--
					if ((curTime-this.startTimeH)>15){
					  let backupX = this.curTetromino.x;
					  this.curTetromino.x += this.velocityX;
					  if (this.curTetromino.isOutLRLimit(this.velocityX)){
						this.curTetromino.x = backupX;
					  }else if (this.curTetromino.hitGround(this.board)){
						this.curTetromino.x = backupX;
					  }else{
						this.horizontalMove = this.velocityX;
						this.horizontalStartColumn = this.curTetromino.column();
						this.startTimeH = curTime;
						break;
					  }
					}
	
				  }
	
				}
	
			  }
	
			}
  
			//-- Check Game Over
			if (this.isGameOver()){
				this.tetrisMusic.stop();
				GameGlobals.idHighScore = this.isHighScore(GameGlobals.curScore);
				if ((GameGlobals.curScore!=0) && (GameGlobals.idHighScore>=0)){
					this.insertHighScore(GameGlobals.idHighScore, GameGlobals.playerName, GameGlobals.curScore);
					this.initGame();
					this.scene.start('high-score', HighScoreScene);
				}else{
					this.initGame();
					this.scene.start('gameover', GameOverScene);
				}

			}
  
		}
  

		//-- Rotate nextTetromino 
		if ((curTime-this.startTimeR)>750){
			this.startTimeR = curTime;
			GameGlobals.nextTetromino.rotateRight();
			this.updateScoreDiplay();
	
		}
		
		//--------------------------------------
		this.graphics.clear();
		
		this.drawBoard();

		this.curTetromino.draw(this.graphics);

		GameGlobals.nextTetromino.draw(this.graphics);


	}
}
