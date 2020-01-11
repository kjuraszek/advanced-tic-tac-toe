import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    let insideClass;
    switch(props.value){
        case "!":
            insideClass = 'blocked';
            break;
        case "X":
            insideClass = 'player-x';
            break;
        case "O":
            insideClass = 'player-o';
            break;
        default:
            insideClass = '';
    }
    
    let squareClass =`square 
    ${props.horizontal ? 'horizontal ' : ''}
    ${props.vertical ? 'vertical' : ''}
    ${props.diagonal1 ? 'diagonal1' : ''}
    ${props.diagonal2 ? 'diagonal2' : ''}`;
    return (
        <button className={squareClass} 
        onClick={props.onClick}>
        <div className="horizontal-line"></div>
        <div className="vertical-line"></div>
        <div className="diagonal1-line"></div>
        <div className="diagonal2-line"></div>
        <div className={insideClass}>{props.value}</div>   
        </button>
    );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        vertical={this.props.vertical[i]}
        horizontal={this.props.horizontal[i]}
        diagonal1={this.props.diagonal1[i]}
        diagonal2={this.props.diagonal2[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }
  renderRow(i) {
      let w = this.props.w;
      let row = [];
      for(let j = i*w; j < w*(i+1); j++){
          row.push(this.renderSquare(j));
      }
    return (
      <div className="board-row" key={i}>
        {row}
      </div>
    );
  }
  render() {
      let w = this.props.w;
      let board = [];
      for(let i = 0; i < w; i++){
          board.push(this.renderRow(i));
      }
    return (
      <div>
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    const boardSize = this.props.settings.boardSize;
    const boardType = this.props.settings.boardType;
    this.state = {
      history: [
        {
          squares: this.generateBoard(boardSize, boardType),
          vertical: Array(boardSize ** 2).fill(null),
          horizontal: Array(boardSize ** 2).fill(null),
          diagonal1: Array(boardSize ** 2).fill(null),
          diagonal2: Array(boardSize ** 2).fill(null),
          playerX: 0,
          playerO: 0,
          currentPlayer: "X",
        xIsNext: true
            
        }
      ],
      stepNumber: 0,
        settings: this.props.settings
    };
  }

  handleClick(i) {
    const settings = this.state.settings;  
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const computerPlayer = settings.gameMode === "PvP" ? false : true;

    let playerX  = current.playerX;
    let playerO  = current.playerO;
    let currentPlayer  = current.currentPlayer;
    let xIsNext = current.xIsNext;
 
    if (squares[i] === "!" || squares[i] === "X" || squares[i] === "O") {
      return;
    } else if(squares[i] === "?") {
        let mysteryValues = [-4,4];
        if(xIsNext){
           playerX += mysteryValues[Math.floor(Math.random() * mysteryValues.length)];
        } else {
            playerO += mysteryValues[Math.floor(Math.random() * mysteryValues.length)];
        }
    } else if(squares[i] === "$") {
        if(xIsNext){
            playerX += 2;
        } else {
            playerO += 2;
        }
    } else if(squares[i] === null) {
        if(xIsNext){
            playerX += 1;
        } else {
            playerO += 1;
        }
    } else if(squares[i] === "@") {
        if(xIsNext){
            playerX -= 1;
        } else {
            playerO -= 1;
        }
    }
      

    let vertical = current.vertical.slice();
    let horizontal = current.horizontal.slice();
    let diagonal1 = current.diagonal1.slice();
    let diagonal2 = current.diagonal2.slice();
      
    
    if(squares[i] === "@") {
        squares[i] = xIsNext ? "X" : "O";
    } else {
        squares[i] = xIsNext ? "X" : "O";
        xIsNext = !xIsNext;
        
    }
    currentPlayer = squares[i];
    
    let emptySquares = [];
    let powerupsSquares = [];
    let playerOSquares = [];
    for(let j = 0; j < squares.length; j++){  
        if(squares[j] === null || squares[j] === "?" || squares[j] === "$" || squares[j] === "@"){
            // all squares left
            emptySquares.push(j);
        }
        if(squares[j] === "?" || squares[j] === "$" || squares[j] === "@"){
            // powerup squares left
            powerupsSquares.push(j);
        }
        if(squares[j] === "O" ){
            // computer player squares
            playerOSquares.push(j);
        }
    }
    
    // computer player turn
    if(!xIsNext && emptySquares.length > 0 && computerPlayer){
      
        if(settings.gameMode === "PvH"){
            // hard computer

            let possibleSquares = [];
            for(let i = 0; i < playerOSquares.length; i++){ 
                // seek for neighbours of "O" squares
                possibleSquares = possibleSquares.concat(this.checkNeighbours(squares, playerOSquares[i]));
            }
            
            possibleSquares = possibleSquares.concat(powerupsSquares);

            // remove duplicated values
            possibleSquares = possibleSquares.reduce(function(a,b){
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
              },[]);
              
            // preffered square is a powerup square or neighbour of "O"
            if(possibleSquares.length > 0){
                let num = possibleSquares[Math.floor(Math.random() * possibleSquares.length)];

                while(squares[num] === "@" && possibleSquares.length > 0){
                    squares[num] = "O";
                    playerO -= 1;
                    possibleSquares = possibleSquares.concat(this.checkNeighbours(squares, num));
                    possibleSquares.splice(possibleSquares.indexOf(num), 1);
                    possibleSquares = possibleSquares.reduce(function(a,b){
                        if (a.indexOf(b) < 0 ) a.push(b);
                        return a;
                      },[]);
                    num = possibleSquares[Math.floor(Math.random() * possibleSquares.length)];
                }
    
                if(squares[num] === null){
                    squares[num] = "O";
                    playerO += 1;
                } else if(squares[num] === "$"){
                    squares[num] = "O";
                    playerO += 2;
                } else if(squares[num] === "?"){
                    squares[num] = "O";
                    let mysteryValues = [-4,4];
                    playerO += mysteryValues[Math.floor(Math.random() * mysteryValues.length)];
                }
                xIsNext = true;
  
            } else {
                let num = emptySquares[Math.floor(Math.random() * emptySquares.length)];

                while(squares[num] === "@" && emptySquares.length > 0){
                    squares[num] = "O";
                    playerO -= 1;
                    emptySquares.splice(emptySquares.indexOf(num), 1);
                    num = emptySquares[Math.floor(Math.random() * emptySquares.length)];
                }
    
                if(squares[num] === null){
                    squares[num] = "O";
                    playerO += 1;
                } else if(squares[num] === "$"){
                    squares[num] = "O";
                    playerO += 2;
                } else if(squares[num] === "?"){
                    squares[num] = "O";
                    let mysteryValues = [-4,4];
                    playerO += mysteryValues[Math.floor(Math.random() * mysteryValues.length)];
                }
                xIsNext = true;
            }

        } else {
            //easy computer by default
            let num = emptySquares[Math.floor(Math.random() * emptySquares.length)];

            while(squares[num] === "@" && emptySquares.length > 0){
                squares[num] = "O";
                playerO -= 1;
                emptySquares.splice(emptySquares.indexOf(num), 1);
                num = emptySquares[Math.floor(Math.random() * emptySquares.length)];
            }

            if(squares[num] === null){
                squares[num] = "O";
                playerO += 1;
            } else if(squares[num] === "$"){
                squares[num] = "O";
                playerO += 2;
            } else if(squares[num] === "?"){
                squares[num] = "O";
                let mysteryValues = [-4,4];
                playerO += mysteryValues[Math.floor(Math.random() * mysteryValues.length)];
            }
            xIsNext = true;
        }
        
        
    }

    this.setState({
        history: history.concat([
        {
            squares: squares,
            vertical: vertical,
            horizontal: horizontal,
            diagonal1: diagonal1,
            diagonal2: diagonal2,
            playerX: playerX,
            playerO: playerO,
            currentPlayer: currentPlayer,
            xIsNext: xIsNext
        }
        ]),
        stepNumber: history.length
      
            
    });
}

checkNeighbours(squares, square){
    let ids = [];
    for(let i = 0; i < 9; i++){
        let neighbour = this.singleNeighbourCheck(square, i);
        if(neighbour !== false && (squares[neighbour] === null || squares[neighbour] === "?" || squares[neighbour] === "$" || squares[neighbour] === "@" )){
            ids.push(neighbour);
        }
    }
    return ids;
}

singleNeighbourCheck(square, caseToCheck){
    const boardSize = this.state.settings.boardSize;
    let neighbour;
    switch(caseToCheck){
        case 0:
            neighbour = square - boardSize - 1;
            if(Math.floor(neighbour/boardSize) !== Math.floor(square/boardSize) - 1){
                neighbour = -1;
            }
            break;
        case 1:
            neighbour = square - boardSize;
            if(Math.floor(neighbour/boardSize) !== Math.floor(square/boardSize) - 1){
                neighbour = -1;
            }
            break;
        case 2:
            neighbour = square - boardSize + 1;
            if(Math.floor(neighbour/boardSize) !== Math.floor(square/boardSize) - 1){
                neighbour = -1;
            }
            break;
        case 3:
            neighbour = square - 1;
            if(Math.floor(neighbour/boardSize) !== Math.floor(square/boardSize)){
                neighbour = -1;
            }
            break;
        case 4:
            neighbour = square + 1;
            if(Math.floor(neighbour/boardSize) !== Math.floor(square/boardSize)){
                neighbour = -1;
            }
            break;
        case 5:
            neighbour = square + boardSize - 1;
            if(Math.floor(neighbour/boardSize) !== Math.floor(square/boardSize) + 1){
                neighbour = -1;
            }
            break;
        case 6:
            neighbour = square + boardSize;
            if(Math.floor(neighbour/boardSize) !== Math.floor(square/boardSize) + 1){
                neighbour = -1;
            }
            break;
        case 7:
            neighbour = square + boardSize + 1;
            if(Math.floor(neighbour/boardSize) !== Math.floor(square/boardSize) + 1){
                neighbour = -1;
            }
            break;
        default:
            neighbour = -1;   
    }

    if(neighbour > -1 && neighbour < boardSize ** 2){
        return neighbour;
    } else {
        return false;
    }
}

jumpTo(step) {
    this.setState({
        stepNumber: step
    });
}
    
newGame(){
    const boardSize = this.state.settings.boardSize;
    const boardType = this.state.settings.boardType;
    this.setState ({
        history: [
        {
            squares: this.generateBoard(boardSize, boardType),
            vertical: Array(boardSize ** 2).fill(null),
            horizontal: Array(boardSize ** 2).fill(null),
            diagonal1: Array(boardSize ** 2).fill(null),
            diagonal2: Array(boardSize ** 2).fill(null),
            playerX: 0,
            playerO: 0,
            currentPlayer: "X",
            xIsNext: true          
        }
        ],
        stepNumber: 0
    });
    
}

calculatePoints(squares, player) {
    
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const settings = this.state.settings;
    
    const width = settings.boardSize;   
    const length = settings.scoringLength;
    
    let vertical = current.vertical;
    let horizontal = current.horizontal;
    let diagonal1 = current.diagonal1;
    let diagonal2 = current.diagonal2;

    let points = 0;
    for(let i=0;i<width**2;i++){
        if(squares[i] === player){
            
            if(i%width<=width-length && i<width**2 - (width * (length-1)) +1){
                if(!vertical[i] && this.verticalCheck(i,squares)){
                    points+=1;
                } 
                if(!horizontal[i] && this.horizontalCheck(i,squares)){
                    points+=1;
                } 
                if(!diagonal1[i] && this.diagonalFirstCheck(i,squares)){
                    points+=1;
                }
                if(i >= width * (length-1)){
                    if(!diagonal2[i] && this.diagonalSecondCheck(i,squares)){
                    points+=1;
                }
                }

            } else if(i%width<=width-length && i >= width * (length-1)){
                if(!horizontal[i] && this.horizontalCheck(i,squares)){
                    points+=1;
                } 
                if(!diagonal2[i] && this.diagonalSecondCheck(i,squares)){
                    points+=1;
                }


            } else if(i<width**2 - (width * (length-1))){
                if(!vertical[i] && this.verticalCheck(i,squares)){
                    points+=1;
                }  
            } 
        } 
    }      
  
    return points;
    
}
verticalCheck(pos,a){
    
    const settings = this.state.settings;
    
    let width = settings.boardSize;   
    let length = settings.scoringLength;
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    let vertical = current.vertical;
    let s = true;
    if(a[pos] && (a[pos] === "X" || a[pos] === "O")){
        for(let w=1;w<length;w++){
            if(vertical[pos+width*w] || a[pos+width*w] !== a[pos]){
                s = false;
                break;
            }
        }
        if(s){
            vertical[pos] = true;
            for(let w=1;w<length;w++){
                vertical[pos+width*w] = true;
            }
        }
        
    } else {
        s = false;
    }
    return s;
}

 horizontalCheck(pos,a){ 
    const settings = this.state.settings;
    let length = settings.scoringLength;
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    let horizontal = current.horizontal;
    let s = true;
    if(a[pos] && (a[pos] === "X" || a[pos] === "O")){
        for(let w=1;w<length;w++){  
            if(horizontal[pos+w] || a[pos+w] !== a[pos]){
                
                s = false;
                break;
            }
        }
        if(s){
            horizontal[pos] = true;
            for(let w=1;w<length;w++){
                horizontal[pos+w] = true;
            }
        }
    } else {
        s = false;
    }
    return s;

}

 diagonalFirstCheck(pos,a){
const settings = this.state.settings;
    
    let width = settings.boardSize;   
    let length = settings.scoringLength;
     const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    let diagonal1 = current.diagonal1;
    let s = true;
    if(a[pos] && (a[pos] === "X" || a[pos] === "O")){
        for(let w=1;w<length;w++){
            if(diagonal1[pos+w+width*w] || a[pos+w+width*w] !== a[pos]){
                s = false;
                break;
            }
        }
        if(s){
            diagonal1[pos] = true;
            for(let w=1;w<length;w++){
                diagonal1[pos+w+width*w] = true;
            }
        }
    } else {
        s = false;
    }
    return s;

}

 diagonalSecondCheck(pos,a){
const settings = this.state.settings;
    
    const width = settings.boardSize;   
    const length = settings.scoringLength;
     const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    let diagonal2 = current.diagonal2;
    let s = true;
    if(a[pos] && (a[pos] === "X" || a[pos] === "O")){
        for(let w=1;w<length;w++){
            if(diagonal2[pos+w-width*w] || a[pos+w-width*w] !== a[pos]){
                s = false;
                break;
            }
        }
        if(s){
            diagonal2[pos] = true;
            for(let w=1;w<length;w++){
                diagonal2[pos+w-width*w] = true;
            }
        }
    } else {
        s = false;
    }
    return s;

}

generateBoard(width, boardType){
    const symbols = ["!","@","$","?"];
    let board = Array(width**2).fill(null);
    
    if(boardType !== "NoPowerups"){
        const powerupsMultiplier = (boardType === "SomePowerups" ? 0.4 : 0.8);
        let ids = [];
        
        while(ids.length < Math.floor(board.length * powerupsMultiplier)){
            let id = Math.floor(Math.random() * board.length)
            if(ids.indexOf(id) === -1){
                ids.push(id);
            }
            
        }
     
        for(let i=0;i<ids.length;i++){
            board[ids[i]] = symbols[Math.floor(Math.random() * symbols.length)];
        }
    }
    return board;
}

render() {
    const settings = this.state.settings;
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const currentPlayer = current.currentPlayer;
    const computerPlayer = (settings.gameMode === "PvP" ? false : true);
   
    const width = settings.boardSize;   
    const length = settings.scoringLength;
 
    if(computerPlayer){
        current.playerX += length * this.calculatePoints(current.squares, "X");
        current.playerO += length * this.calculatePoints(current.squares, "O");
    } else if(currentPlayer === "X"){
        current.playerX += length * this.calculatePoints(current.squares, "X");
    } else{
        current.playerO += length * this.calculatePoints(current.squares, "O");
    }
    
    let emptySquares = current.squares.filter(function(x){if(x===null || x==="?" ||x==="$" ||x==="@"){return "1"}});

    let squaresLeft = "Squares left: " + (emptySquares.length);
    let scoringLength = "Scoring length: " + length;
    let playerX = current.playerX;
    let playerO = current.playerO;
    let nextPlayer;
    if(emptySquares.length > 0){
        nextPlayer = "Next player: " + (current.xIsNext ? "X" : "O");
    } else {
        if(current.playerX === current.playerO){
            nextPlayer = "It's a draw!";
        } else if(current.playerX > current.playerO) {
            nextPlayer = settings.playerXName + " won!";
        } else if(current.playerO > current.playerX) {
            nextPlayer = settings.playerOName + " won!";
        } else {
            nextPlayer = "There's no winner, try again!";
        }
    }
    
    let undoButton;
    if(this.state.stepNumber > 0 && emptySquares.length > 0){
        undoButton = <button onClick={() => this.jumpTo(this.state.stepNumber - 1)}>Undo</button> ;
    } else {
        undoButton = "";
    }
    let boardWidth = width * 34;

    return (
      <div className="game">
        <div className="game-board" style={{minWidth: boardWidth }}>
          <Board
            squares = {current.squares}
            vertical = {current.vertical}
            horizontal = {current.horizontal}
            diagonal1 = {current.diagonal1}
            diagonal2 = {current.diagonal2}
                    
            onClick={i => this.handleClick(i)}
            w = {width}
            l = {length}
          />
        </div>
        <div className="game-info">
            <h2>{nextPlayer}</h2>
            <hr></hr>
            <h2>Match highlights</h2>
            <h3>{settings.playerXName} <i>vs</i> {settings.playerOName}</h3>
          <div>Player <span style={{background: "black",color:"#e26e6e",fontFamily: "monotype",padding: "2px"}}>X</span> points: {playerX} <strong>[{settings.playerXName}]</strong></div>
          <div>Player <span style={{background: "black",color:"azure",fontFamily: "monotype",padding: "2px"}}>O</span> points: {playerO} <strong>[{settings.playerOName}]</strong></div>
          <div>{squaresLeft}</div>
          <div>{scoringLength}</div>
        <hr></hr>
            <h2>Controls</h2>
          <div><button onClick={() => this.jumpTo(0)}>Reset game</button></div>
          <div>{undoButton}</div>
        <div><button onClick={() => this.newGame(0)}>New game</button></div>
        <div><button onClick={() => this.props.changeSettings()}>Change Settings</button></div>
          <hr></hr>
            <h2>Legend</h2>
            <ul>
            <li><strong>$</strong> gives You 2 points</li>
            <li><strong>?</strong> randomly gives You OR subtracts 4 points from You</li>
            <li><strong>!</strong> is a blocked square</li>
            <li><strong>@</strong> subtracts 1 point from You but gives You additional move</li>
            <li><strong>(empty field)</strong> gives You 1 point</li>
            </ul>
    
        </div>
      </div>
    );
  }
}

class Settings extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
      playerXName: this.props.settings.playerXName,
      playerOName: this.props.settings.playerOName,
      boardSize: this.props.settings.boardSize,
      scoringLength: this.props.settings.scoringLength,
      gameMode: this.props.settings.gameMode,
      boardType: this.props.settings.boardType,
    };
      
  }
    
    inputCheck(){
        let current = this.state;
        if(current.playerXName.toString().length > 0 && current.boardSize.toString().length > 0 && current.scoringLength.toString().length > 0 && parseInt(current.scoringLength) <= parseInt(current.boardSize)){
            this.props.saveSettings(current);
        } else {
            alert("Inputs cannot be empty and scoring length cannot be higher than board size!")
        }
    }
    
    render(){
        let current = this.state;
        
        return(
            <React.Fragment>
            <div>
            <h2>Advanced Tic Tac Toe</h2>
            <div className="game-board" style={{minWidth: "102px"}}>
            <div className="board-row">
            <button className="square diagonal1">
            <div className="horizontal-line"></div>
            <div className="vertical-line"></div>
            <div className="diagonal1-line"></div>
            <div className="diagonal2-line"></div>
            <div className="">X</div>
            </button>
            <button className="square ">
            <div className="horizontal-line"></div>
            <div className="vertical-line"></div>
            <div className="diagonal1-line"></div>
            <div className="diagonal2-line"></div>
            <div className="">O</div>
            </button>
            <button className="square ">
            <div className="horizontal-line"></div>
            <div className="vertical-line"></div>
            <div className="diagonal1-line"></div>
            <div className="diagonal2-line"></div>
            <div className=""> </div>
            </button>
            </div>
            <div className="board-row">
            <button className="square ">
            <div className="horizontal-line"></div>
            <div className="vertical-line"></div>
            <div className="diagonal1-line"></div>
            <div className="diagonal2-line"></div>
            <div className="">O</div>
            </button>
            <button className="square diagonal1">
            <div className="horizontal-line"></div>
            <div className="vertical-line"></div>
            <div className="diagonal1-line"></div>
            <div className="diagonal2-line"></div>
            <div className="">X</div>
            </button>
            <button className="square ">
            <div className="horizontal-line"></div>
            <div className="vertical-line"></div>
            <div className="diagonal1-line"></div>
            <div className="diagonal2-line"></div>
            <div className=""> </div>
            </button>
            </div>
            <div className="board-row">
            <button className="square ">
            <div className="horizontal-line"></div>
            <div className="vertical-line"></div>
            <div className="diagonal1-line"></div>
            <div className="diagonal2-line"></div>
            <div className=""> </div>
            </button>
            <button className="square ">
            <div className="horizontal-line"></div>
            <div className="vertical-line"></div>
            <div className="diagonal1-line"></div>
            <div className="diagonal2-line"></div>
            <div className=""> </div>
            </button>
            <button className="square diagonal1">
            <div className="horizontal-line"></div>
            <div className="vertical-line"></div>
            <div className="diagonal1-line"></div>
            <div className="diagonal2-line"></div>
            <div className="">X</div>
            </button>
            </div>
            </div>
            </div>
            <div>
            <h3>Settings</h3>
            <p><label htmlFor="playerXName">Player X name: </label>
            <input name = "playerXName" type="text" value={current.playerXName} onChange={(e) => this.setState({playerXName: e.target.value})} />
            </p>
            <p><label htmlFor="playerOName">Player O name: </label>
            <input name = "playerOName" type="text" value={current.playerOName} onChange={(e) => this.setState({playerOName: e.target.value})} />
            </p>
            <p><label htmlFor="boardsize">Board size: </label>
            <input name = "boardsize" type="number" min = "3" value={current.boardSize} onChange={(e) => this.setState({boardSize: e.target.value})} />
            </p>
            <p><label htmlFor="scoringlength">Scoring length: </label>
            <input name = "scoringlength" type="number" min = "3" value={current.scoringLength} onChange={(e) => this.setState({scoringLength: e.target.value})} /></p>
            <p><label htmlFor="gamemode">Game mode: </label>
            <select name = "gamemode" value={current.gameMode} onChange={(e) => this.setState({gameMode: e.target.value})}>
            <option value="PvP">Player vs Player</option>
            <option value="PvE">Player vs EasyComp</option>
            <option value="PvH">Player vs HardComp</option>
            </select></p>
            <p><label htmlFor="boardtype">Board type: </label>
            <select name = "boardtype" value={current.boardType} onChange={(e) => this.setState({boardType: e.target.value})}>
            <option value="NoPowerups">Empty fields only</option>
            <option value="SomePowerups">Some powerups fields</option>
            <option value="ManyPowerups">Many powerups fields</option>
            </select></p>


            <button onClick={() => this.inputCheck()} >Save settings and play!</button>
            </div>
            </React.Fragment>
            )
    }
}
    
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      settingsPage: true,
        playerXName: "PlayerX",
        playerOName: "PlayerO",
        gameMode: "PvH",
        boardSize: 3,
        scoringLength: 3,
        boardType: "NoPowerups"
    };
  }
    saveSettings(userSettings){
        this.setState({
            settingsPage: false,
            playerXName: userSettings.playerXName,
            playerOName: userSettings.gameMode === "PvP" ? userSettings.playerOName : "Computer",
            gameMode: userSettings.gameMode,
            boardSize: userSettings.boardSize,
            boardType: userSettings.boardType,
            scoringLength: userSettings.scoringLength
        });
    }
    changeSettings(){
        this.setState({
            settingsPage: true
        });
    }
    
    render(){
        let current = this.state;
        if (this.state.settingsPage){
            return(
                
                <Settings settings = {current} saveSettings = {(e) => this.saveSettings(e)} />
            )
        } else {
            return (
                
                <Game settings = {current} changeSettings = {() => this.changeSettings()} />
            )
        }
    }
}
// ========================================

ReactDOM.render(<App />, document.getElementById("root"));
