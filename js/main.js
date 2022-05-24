/*
name:  numberInGame

wall: 0,
emptySpace: 1,
pellet: 2,
powerUp: 3,
ghostHomeEntrance: 4,
blinky: 5,
pinky: 6,
inky: 7,
clyde: 8,
pacMan: 9,
*/

// ================================================ \\

// ================================================ \\
// player \\
class Player {
  constructor(game, name, direction, classes) {
    this.game = game;
    this.name = name;
    this.direction = direction;
    this.classes = classes;
  }

  changeDirection(newDir) {
    this.direction = newDir;
  }
  getClasses() {
    return `${this.classes} ${this.direction}`;
  }
  canMove(direction = this.direction) {
    switch (direction) {
      case `up`:
        return this.game.phMatrix[this.position - this.game.width] !== 0;
      case `down`:  // going inside the ghost home is not allowed
        return this.game.phMatrix[this.position] === 4 ? false : this.game.phMatrix[this.position + this.game.width] !== 0;
      case `left`:
        if (this.position % this.game.width === 0) {
          return this.game.phMatrix[this.position + (this.game.width - 1)] !== 0;
        } else {
          return game.phMatrix[this.position - 1] !== 0;
        }
      case `right`:
        if ((this.position + 1) % this.game.width === 0) {
          return this.game.phMatrix[this.position - (this.game.width - 1)] !== 0;
        } else {
          return this.game.phMatrix[this.position + 1] !== 0;
        }
    }
  }
  move() {
    switch (this.direction) {
      case `up`:
        this.position -= this.game.width;
        break;
      case `down`:
        this.position + this.game.width;
        break;
      case `left`:
        if (this.position % this.game.width === 0) {
          this.position += (this.game.width - 1);
        } else {
          this.position--;
        }
        break;
      case `right`:
        if ((this.position + 1) % this.game.width === 0) {
          this.position -= (this.game.width - 1);
        } else {
          this.position++;
        }
        break;
    }
  }
}

// ================================================ \\

// ================================================ \\
// pacman \\
class PacMan extends Player {
  constructor(game, name = `Pac-Man`, direction = `right`, classes = `pacman`, numberInGame = 9) {
    super(game, name, direction, classes);
    this.position = game.indexOf(numberInGame);
  }

  // * move is the only access point from game obj
  move() {
    if (this.canMove()) {
      this.game.phMatrix[this.position] = 1;

      super.move();

      this.game.phMatrix[this.position] = 9;
    }
  }
}

const pacman = new Pacman();

// ================================================ \\

// ================================================ \\
// the ghosts \\
class Ghost extends Player {
  constructor(game, name, direction, classes, isHome = true, homePosition, scatterPosition, position, reward) {
    super(game, name, direction, classes);
    this.homeEntrance = game.phMatrix.indexOf(4);
    this.isHome = isHome;
    this.homePosition = homePosition;
    this.scatterPosition = scatterPosition;
    this.position = this.position;
    this.previousPosition = -1;
    this.targetPosition = scatterPosition;
    this.isEatable = false;
    this.isEaten = false;
    this.reward = reward;
  }

  // TODO mutate getHuntPosition for all the different ghosts other than blinky
  getHuntPosition() {  //! ghost spesific
    return pacman.position;
  }

  move() {
    // * move is the only access point from game obj
    this.changeDirection();

    this.previousPosition = this.position;
    super.move();

  }

  canMove(direction = this.direction) {
    // eaten ghosts can move through walls
    return this.isEaten ? true : super.canMove(direction);
  }

  getTargetPosition() {
    if (isHome) {
      this.targetPosition = this.homeEntrance;
      return;
    }
    // *when a ghost is eatable it picks a random empty cell to move towards
    if (this.isEatable) {
      const notWalls =
        phMatrix
          .map((cell, index) => cell > 0 ? index : -1)
          .filter(cell => cell >= 0);

      const randomTargetPosition = notWalls[Math.floor(Math.random() * notWalls.length)];
      this.targetPosition = randomTargetPosition;
      return;
    }
    // *when eaten the ghost goes home
    if (this.isEaten) {
      this.targetPosition = this.homePosition;
      return;
    }

    // *every fifth wave the ghosts scatter
    if (this.game.wave % 5 === 0) {
      this.targetPosition = this.scatterPosition;
      return;
    }

    this.targetPosition = this.getHuntPosition();
  }

  changeDirection(priorityAxis) {
    // *direction is only changed at intersections
    if (!this.atIntersection()) {
      return;
    }

    // *so targetPosition can be changed to previous position when there's a state change
    this.getTargetPosition();

    const distance = this.position - this.targetPosition,
      targetIsOnSameRow = Math.floor(this.position / this.game.width) === Math.floor(this.targetPosition / this.game.width),
      targetIsPrevious = this.previousPosition === this.targetPosition,
      upIsPrevious = this.position - this.game.width === this.previousPosition,
      downIsPrevious = this.position + this.game.width === this.previousPosition,
      leftIsPrevious = this.position % this.game.width === 0 ? this.position + (this.game.width - 1) === this.previousPosition : this.position - 1 === this.previousPosition,
      rightIsPrevious = (this.position + 1) % this.game.width === 0 ? this.position - (this.game.width - 1) === this.previousPosition : this.position + 1 === this.previousPosition;

    if (priorityAxis === undefined) {
      priorityAxis = targetIsOnSameRow ? `xAxis` : `yAxis`;
    }
    // vertical direction
    // down
    if (priorityAxis === `yAxis`) {
      if (distance < 0 && this.canMove(`down`)) {
        if (!downIsPrevious || targetIsPrevious) {
          this.direction = `down`;
          return;
        }
      }
      // up
      if (distance > 0 && this.canMove(`up`)) {
        if (!upIsPrevious || targetIsPrevious) {
          this.direction = `up`;
          return;
        }
      }
    }

    // horizontal direction
    // left
    if (distance > 0 && this.canMove(`left`)) {
      if (!leftIsPrevious || targetIsPrevious) {
        this.direction = `left`;
        return;
      }
    }
    // right
    if (distance < 0 && this.canMove(`right`)) {
      if (!rightIsPrevious || targetIsPrevious) {
        this.direction = `right`;
        return;
      }
    }

    this.changeDirection(`yAxis`);
  }

  atIntersection() {
    let clearPaths = 0;

    [`up`, `down`, `left`, `right`].forEach(dir => {
      if (this.canMove(dir)) {
        clearPaths++;
      }
    });

    return clearPaths >= 3 ? true : false;
  }

  getEaten() {
    this.isEatable = false;
    this.isEaten = true;

    this.game.updateScore(this.reward);
  }

  makeEatable() {
    this.isEatable = true;
    this.targetPosition = this.previousPosition;

    setTimeout(() => {
      this.isEatable = false;
      this.targetPosition = this.previousPosition;
    }, 7000);
  }

  getClasses() {
    if (this.isEatable) {
      return `eatable`;
    } else if (this.isEaten) {
      return `eaten ${this.direction}`;
    } else {
      return `${this.classes} ${this.direction}`;
    }
  }
}


// TODO uncomment
// const ghosts = [
//   new Blinky(),
//   new Pinky(),
//   new Inky(),
//   new Clyde()
// ];

// ================================================ \\

// ================================================ \\
// the game \\

const game = {
  hasStarted: false,  // !might go unused
  intervalIds: [],
  highScore: 0,
  score: 0,
  wave: 0,
  pillsLeft: { pellets: 0, powerUps: 0 },
  width: playground[0].length,
  height: playground.length,
  playgroundElement: document.getElementById(`playground`),
  phMatrix: playground.flat(),
  phContainer: document.querySelector(`.physical.plane`),
  phCells: [],
  spMatrix: playground.flat().map(cell => cell <= 1 ? cell : 1), // !find a way to not use this
  spContainer: document.querySelector(`.spirits.plane`),
  spCells: [],


  refresh() {
    pacman.move();
    ghosts.forEach(ghost => { ghost.move() });

    this.countPills();
    // TODO check if ghost is eatable if so update score and sendHome else lose
    const isLost = ghosts.some(ghost => ghost.position === pacman.position);  // TODO replace with detectEncounter()

    if (isLost) {
      this.lose();
    }
    if (this.pillsLeft.pellets === 0 && this.pillsLeft.powerUps === 0) {
      this.win();
    }

    this.renderPh();
    this.renderSp();
    this.updateScore(); //TODO
  },

  start() {
    this.buildCells();
    this.renderWalls();
    this.renderPh();
    this.renderSp();

    // setTimeout to allow the intro to play
    // setTimeout(() => {

    //   const refreshIntervalId = setInterval(() => {
    //     game.refresh();
    //   }, 20);
    //   // !when wave % 5 === 0 scatter
    //   const waveIntervalId = setInterval(() => { this.wave++ }, 5000);

    //   this.intervalIds = [...[refreshIntervalId, waveIntervalId]];

    //   listenForInput();

    // }, 3000);

  },

  end() {
    // TODO
  },

  win() {
    // TODO
  },

  lose() {
    // TODO
  },

  renderSp() {
    ghosts.forEach(ghost => {
      this.spCells[ghost.position].className = `cell ghost ${ghost.getClasses()}`;
      this.spCells[ghost.previousPosition].className = `cell ghost`;
    });
  },

  renderPh() {
    for (let i = 0; i < this.phMatrix.length; i++) {
      switch (this.phMatrix[i]) {
        case 1:
        case 4:
          this.phCells[i].className = `cell`;
          break;
        case 2:
          this.phCells[i].className = `cell pellet`;
          break;
        case 3:
          this.phCells[i].className = `cell power-up`;
          break;
        case 9:
          this.phCells[i].className = `cell ${pacman.getClasses()}`;
          break;
      }
    }
  },
  // *checked
  renderWalls() {
    for (let i = 0; i < this.phMatrix.length; i++) {
      if (this.phMatrix[i] === 0) {
        this.phCells[i].className = `cell wall`;
      }
    }
  },

  buildCells() {
    this.phContainer.style += `grid-template-rows: repeat(${this.height}, 1fr); grid-template-columns: repeat(${this.width}, 1fr);`
    this.spContainer.style += `grid-template-rows: repeat(${this.height}, 1fr); grid-template-columns: repeat(${this.width}, 1fr);`

    for (let i = 0; i < this.phMatrix.length; i++) {
      const phCell = document.createElement(`div`);
      const spCell = document.createElement(`div`);

      phCell.className = `cell`;
      spCell.className = `cell ghost`;

      phCell.textContent = i.toString();
      spCell.textContent = i.toString();


      this.phCells.push(phCell);
      this.phContainer.appendChild(phCell);
      this.spCells.push(spCell);
      this.spContainer.appendChild(spCell);
    }
  },

  countPills() {
    let newPelletCount = 0,
      newPowerUpCount = 0;

    this.phMatrix.forEach(cell => {
      if (cell === 2) {
        newPelletCount++;
      }
      if (cell === 3) {
        newPowerUpCount++;
      }
    });

    if (this.pillsLeft.pellets > newPelletCount) {
      this.updateScore((this.pillsLeft.pellets - newPelletCount) * 10);
      this.pillsLeft.pellets = newPelletCount;
      // TODO play appropriate sound
    }
    if (this.pillsLeft.powerUps > newPowerUpCount) {
      this.score((this.pillsLeft.powerUps - newPowerUpCount) * 50);
      this.pillsLeft.powerUps = newPowerUpCount;

      ghosts.forEach(ghost => { ghost.makeEatable() });
      // TODO play appropriate sound
    }
  },
  // TODO it takes points and adds them to the score updates the high score and displays them
  // TODO it displays +reward next to the score when a ghost is eaten
  updateScore() {

  },

  detectEncounter() {
    ghosts.forEach(ghost => {
      if (ghost.position !== pacman.position) {
        return;
      }

      if (!ghost.isEatable && !isEaten) {
        this.lose();
      } else {
        ghost.getEaten();
      }
    });
  }
}



// ================================================ \\

// ================================================ \\
// event listeners \\

// hides the on screen controls \\
document.addEventListener(`keydown`, e => {
  const main = document.querySelector(`main`),
    controls = document.getElementById(`controls`);

  main.style.justifyContent = `flex-start`;
  main.style.margin = `0 auto`;

  controls.style.display = `none`;
}, { once: true });

// ================================================ \\
// starts the game \\
document.getElementById(`start-game`).addEventListener(`click`, e => {
  game.start();
});

// ================================================ \\

function listenForInput() {
  // changes pacman's direction based on keyboard input \\
  document.addEventListener(`keydown`, e => {
    switch (e.code) {
      case `ArrowUp`:
        pacman.changeDirection(`up`);
        break;
      case `ArrowDown`:
        pacman.changeDirection(`down`);
        break;
      case `ArrowLeft`:
        pacman.changeDirection(`left`);
        break;
      case `ArrowRight`:
        pacman.changeDirection(`right`);
        break;
    }
  });

  // changes pacman's direction based on screen control input \\
  document.getElementById(`controls`).addEventListener(`click`, e => {
    const targetClass = e.target.className;

    switch (targetClass) {
      case `control up`:
        pacman.changeDirection(`up`);
        break;
      case `control down`:
        pacman.changeDirection(`down`);
        break;
      case `control left`:
        pacman.changeDirection(`left`);
        break;
      case `control right`:
        pacman.changeDirection(`right`);
        break;
    }
  });
}

// ================================================ \\

// ================================================ \\
// testing zone \\

// game.buildCells();
// game.renderWalls();
// game.renderPh();

game.start();
console.log(game.width, game.height);