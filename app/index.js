const React = require('react');
const ReactDOM = require('react-dom');
require('normalize.css/normalize.css');
require('./index.css');
import _ from "lodash";


const createArray = (size) => Array.from({ length: size }, (_, i) => i);

class Cell extends React.Component {
  backgroundColor = () => {
    if (this.props.showAsSelected) {
      return this.props.cellIsChallenge ? 'green' : 'red';
    }
    if (this.props.showAsChallenge) {
      return 'blue';
    }
    return 'white';
  };
  handleClick = () => {
    this.props.onClick(this.props.id);
  };
  render() {
    return (
      <div
        className="cell"
        style={{
          width: `${this.props.width}%`,
          backgroundColor: this.backgroundColor(),
        }}
        onClick={this.handleClick}
      />
    );
  }
}

class Game extends React.Component {
  static messages = {
    new: 'Click the Start button to play',
    challenge: 'Memorize these blue cells',
    playing: 'Recall the cells that were blue',
    won: 'You Win!',
    lost: 'Game Over!',
  };
  state = {
    gameStatus: 'new', // new, challenge, playing, won, lost
    selectedCells: [],
  };
  grid = createArray(this.props.gridSize * this.props.gridSize);
  cellWidthPercentage = 100 / this.props.gridSize;
  challengeCells = [];

  startGame = () => {
    clearTimeout(this.timerId);
    this.challengeCells = _.sampleSize(this.grid, this.props.challengeSize);
    this.setState(
      { gameStatus: 'challenge', selectedCells: [] },
      () =>
        (this.timerId = setTimeout(
          () => this.setState({ gameStatus: 'playing' }),
          3000
        ))
    );
  };

  onCellClick = (cellId) => {
    if (this.state.gameStatus != 'playing') {
      // Can't play. Do nothing.
      return;
    }
    if (this.state.selectedCells.indexOf(cellId) >= 0) {
      // Cell is already selected. Do nothing.
      return;
    }

    this.setState((prevState) => ({
      selectedCells: [...prevState.selectedCells, cellId],
      gameStatus: this.calcNewGameStatus([...prevState.selectedCells, cellId]),
    }));
  };

  calcNewGameStatus = (newSelectedCells) => {
    if (_.difference(this.challengeCells, newSelectedCells).length === 0) {
      return 'won';
    }
    if (
      _.difference(newSelectedCells, this.challengeCells).length ===
      this.props.wrongsAllowed
    ) {
      return 'lost';
    }
    return 'playing';
  };

  showChallengeCells = () =>
    ['challenge', 'lost'].includes(this.state.gameStatus);

  showSelectedCells = () =>
    ['playing', 'won', 'lost'].includes(this.state.gameStatus);

  gameIsIdle = () => ['new', 'won', 'lost'].includes(this.state.gameStatus);

  render() {
    return (
      <div className="game">
        <div className="grid">
          {this.grid.map((cellId) => {
            const cellIsChallenge = this.challengeCells.indexOf(cellId) >= 0;
            const cellIsSelected =
              this.state.selectedCells.indexOf(cellId) >= 0;
            return (
              <Cell
                key={cellId}
                id={cellId}
                onClick={this.onCellClick}
                cellIsChallenge={cellIsChallenge}
                showAsChallenge={this.showChallengeCells() && cellIsChallenge}
                showAsSelected={this.showSelectedCells() && cellIsSelected}
                width={this.cellWidthPercentage}
              />
            );
          })}
        </div>
        {this.gameIsIdle() && (
          <button onClick={this.startGame}>
            {this.state.gameStatus === 'new' ? 'Start' : 'Play Again'}
          </button>
        )}
        <div className="message">{Game.messages[this.state.gameStatus]}</div>
      </div>
    );
  }
}

ReactDOM.render(
  <Game gridSize={5} challengeSize={6} wrongsAllowed={3} />,
  document.getElementById('root')
);
