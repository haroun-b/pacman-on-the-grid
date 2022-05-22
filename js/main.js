/*
wall: 0,
emptySpace: 1,
pellet: 2,
powerUp: 3,
blinky: 4,
pinky: 5,
inky: 6,
clyde: 7,
pacMan: 8,
*/

class Player {
  constructor(name, position, direction) {
    this.name = name;
    this.position = position;
    this.direction = direction;
  }

  changeDirection() {

  }
  move() {

  }
  canMove() {

  }
}

class PacMan extends Player {
  constructor(name = `Pac-Man`, position = 629, direction = `r`) {
    super(name, position, direction);
    this.score = 0;
  }
}

class Ghost extends Player {
  constructor(name, position, direction, reward) {
    super(name, position, direction);
    this.isEatable = false;
    this.isEaten = false;
    this.isHome = true;
    this.reward = reward;
  }

  hunt() {

  }
  withdraw() {

  }
  changeDirection() {

  }
  move() {

  }
  canMove() {

  }
  respawn() {

  }
}

const ghostHome = {
  isClosed: true,

  open() {

  },
  close() {

  }
}

const game = {
  hasStarted: false,
  highScore: 0,
  pelletsLeft: 0,
  grid: playground.flat(),
  gridElement: document.getElementById(`playground`),
  cellElements: [],

  refresh() {

  },
  start() {

  },
  end() {

  },
  win() {

  },
  lose() {

  },
  renderAll() {

  },
  buildCells() {
    for (let i = 0; i < this.grid.length; i++) {
      console.log(i);
      const cell = document.createElement(`div`);
      cell.className = `cell`;

      this.cellElements.push(cell);
      this.gridElement.appendChild(cell);
    }
  }
}
console.log(game.grid.length);
game.buildCells();