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
  show() {

  }
  hide() {

  }
}

class PacMan extends Player {
  constructor(name = `Pac-Man`, position = 629, direction = `r`) {
    super(name, position, direction);
    this.score = 0;
  }
}

class Ghost extends Player {
  constructor(name, position, direction) {
    super(name, position, direction, reward);
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
  show() {

  }
  hide() {

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
  renderWalls() {

  },
}