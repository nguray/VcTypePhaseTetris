import Tetromino from './Tetromino'

export default class GameGlobals {
    
    static readonly WIN_WIDTH = 480;
    static readonly WIN_HEIGHT = 560;

    static readonly NB_COLUMNS = 12;
    static readonly NB_ROWS = 20;
    static readonly BOARD_LEFT = 10;
    static readonly BOARD_TOP = 10;

    static CELL_SIZE = Math.trunc(GameGlobals.WIN_WIDTH/(GameGlobals.NB_COLUMNS+7));

    static curScore = 0;

    static highScore = 0;

    static idHighScore = 1;
    static highScores = new Array();

    static playerName = "";

	static nextTetromino = new Tetromino(
            Tetromino.tetrisRandomizer(),
            (GameGlobals.NB_COLUMNS+3)*GameGlobals.CELL_SIZE,
            10*GameGlobals.CELL_SIZE
        );
  
}