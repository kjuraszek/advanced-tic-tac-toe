This project is an Advanced Tic Tac Toe game.

It's based on a React tutorial [link](https://reactjs.org/tutorial/tutorial.html).<br>
The working demo is available [here](https://portfolio.kjuraszek.pl/advanced-tic-tac-toe/).

## How to run this app ?

Create a new react project:

#### `npx create-react-app advanced-tic-tac-toe`

Replace files and catalogues with these from project:

#### `public src readme.md package.json`

Running:

#### `npm start`

in the project directory runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Running:

#### `npm run build`

builds the app for production to the `build` folder.<br>

## Game settings

This is an extended version of the game.<br>
Available settings:
* set names for Human players (the computer player is always Computer)
* set board size (width in squares, minimum: 3)
* set scoring length (between 3 and board size)
* game mode (play with Computer or Human player)
* board type - clean board or with some `powerups`

## Game controls

Game is controlled by mouse or by touchscreen (on mobile devices).

You have 3 control buttons:
* reset game - clears squares and resets score
* undo - undos Your last move
* new game - generates clear board and resets score
* change settings - stops game and shows You settings view

## Game rules

X player starts.<br>
Each `scoring length` long line (vertical, horizontal or diagonal) of exact symbols gives the same amount of points as its length.<br>

`Important!` Each square can be used only once for each direction (vertical, horizontal or diagonal).<br>

Types of squares:
* $ gives You 2 points
* ? randomly gives You OR subtracts 4 points from You
* ! is a blocked square
* @ subtracts 1 point from You but gives You additional move
* (empty field) gives You 1 point

Gameplay will be extended in the future.

## Computer player

There are two levels of a Computer player:
* easy
* hard

Easy Computer player randomly selects one square.<br>
Hard Computer player seeks for powerup squares and neighbours of "O" squares. If it's impossible to find them he behaves just like Easy Computer.

## TODO

All TODOs and ideas will be stored and updated in [this issue](https://github.com/kjuraszek/advanced-tic-tac-toe/issues/2).<br>
Feel free to comment !