import "./style.css";
import Phaser from 'phaser'

import GameGlobals from './GameGlobals'
import TitleScene from './TitleScene'
import GameScene from './GameScene'
import GameOverScene from './GameOverScene'
import HighScoreScene from './HighScoreScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width: GameGlobals.WIN_WIDTH,
	height: GameGlobals.WIN_HEIGHT,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {x: 0,y: 200 },
		},
	},
	scene: [TitleScene,GameScene,GameOverScene,HighScoreScene],
}

function loadFont(name: string, url: string) {
	var newFont = new FontFace(name, `url(${url})`);
	newFont.load().then(function (loaded) {
		document.fonts.add(loaded);
	}).catch(function (error) {
		return error;
	});
}


//localStorage.clear();
let localHighScores = localStorage.getItem('TetrisHighScores');
if (localHighScores===null){
	GameGlobals.highScores.push({player:'------',score: 0});
	GameGlobals.highScores.push({player:'------',score: 0});
	GameGlobals.highScores.push({player:'------',score: 0});
	GameGlobals.highScores.push({player:'------',score: 0});
	GameGlobals.highScores.push({player:'------',score: 0});
	GameGlobals.highScores.push({player:'------',score: 0});
	GameGlobals.highScores.push({player:'------',score: 0});
	GameGlobals.highScores.push({player:'------',score: 0});
	GameGlobals.highScores.push({player:'------',score: 0});
	GameGlobals.highScores.push({player:'------',score: 0});
}else{
	let s = localStorage.getItem('TetrisHighScores');
	if (s){
		GameGlobals.highScores = JSON.parse(s);
	}
}

loadFont("sansation", "public/assets/sansation.ttf");

console.log(GameGlobals.highScores);

export default new Phaser.Game(config)
