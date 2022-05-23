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

// ================================================ \\

// ================================================ \\
// player \\
class Player {
  constructor(name, position, direction, classes) {
    this.name = name;
    this.position = position;
    this.direction = direction;
    this.classes = classes;
  }

  changeDirection(newDir) {
    this.direction = newDir;
  }
  getClasses() {
    return `${this.classes} ${this.direction}`;
  }
  canMove() {
    switch (this.direction) {
      case `up`:
        return game.phMatrix[this.position - game.width] !== 0;
      case `down`:
        return game.phMatrix[this.position + game.width] !== 0;
      case `left`:
        if (this.position % game.width === 0) {
          return game.phMatrix[this.position + (game.width - 1)] !== 0;
        } else {
          return game.phMatrix[this.position - 1] !== 0;
        }
      case `right`:
        if ((this.position + 1) % game.width === 0) {
          return game.phMatrix[this.position - (game.width - 1)] !== 0;
        } else {
          return game.phMatrix[this.position + 1] !== 0;
        }
    }
  }
}

// ================================================ \\

// ================================================ \\
// pacman \\
class PacMan extends Player {
  constructor(name = `Pac-Man`, position = 325, direction = `right`, classes = `pacman`) {
    super(name, position, direction, classes);
  }

  // * move is the only access point from game obj
  move() {
    if (this.canMove()) {
      game.phMatrix[this.position] = 1;

      switch (this.direction) {
        case `up`:
          this.position -= game.width;
          break;
        case `down`:
          this.position + game.width;
          break;
        case `left`:
          if (this.position % game.width === 0) {
            this.position += (game.width - 1);
          } else {
            this.position--;
          }
          break;
        case `right`:
          if ((this.position + 1) % game.width === 0) {
            this.position -= (game.width - 1);
          } else {
            this.position++;
          }
          break;
      }

      game.phMatrix[this.position] = 8;
    }
  }
}

// ================================================ \\

// ================================================ \\
// the ghosts \\
class Ghost extends Player {
  constructor(name, position, direction, reward, home) {
    super(name, position, direction);
    this.home = home;
    this.isHome = true;
    this.isEatable = false;
    this.isEaten = false;
    this.reward = reward;
  }

  hunt() {  //! ghost spesific

  }

  scatter() {  //! ghost spesific

  }

  move() {
    // TODO move is the only access point from game obj
    // TODO move is only called at intersections
    // TODO move calls goHome() when isEaten === true
    // TODO leave home if home
    // TODO scatter when eatable
    // TODO hunt otherwise
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

  leaveHome() {
    // TODO
  }

  goHome() {
    // TODO

  }

  getEaten() {
    this.isEatable = false;
    this.isEaten = true;

    game.updateScore(this.reward);
  }

  makeEatable() {
    this.isEatable = true;

    setTimeout(() => {
      this.isEatable = false;
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


const ghostHome = {
  isClosed: true,

  open() {

  },
  close() {

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
  highScore: 0,
  score: 0,
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
    this.renderWalls();
    this.renderPh();
    this.renderSp();

    // setTimeout to allow the intro to play
    setTimeout(() => {

      setInterval(() => {
        game.refresh();
      }, 20);

      listenForInput();

    }, 3000);

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
    });
  },

  renderPh() {
    for (let i = 0; i < this.phMatrix.length; i++) {
      switch (this.phMatrix[i]) {
        case 1:
          this.phCells[i].className = `cell`;
          break;
        case 2:
          this.phCells[i].className = `cell pellet`;
          break;
        case 3:
          this.phCells[i].className = `cell power-up`;
          break;
        case 8:
          this.phCells[i].className = `cell ${pacman.getClasses()}`;
          break;
      }
    }
  },

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

      // phCell.textContent = i.toString();
      // spCell.textContent = i.toString();


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

game.buildCells();
game.renderWalls();
game.renderPh();

console.log(game.width, game.height);