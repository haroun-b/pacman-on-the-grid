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
// the game \\

const game = {
  hasStarted: false,  // !might go unused
  isOnMute: false,
  intervalIds: [],
  highScore: 0,
  highScoreElement: document.querySelector(`.high.score span`),
  score: 0,
  refreshCounter: 0, 
  scoreElement: document.querySelector(`.player.score span`),
  wave: 0,
  pillsLeft: { pellets: 179, powerUps: 4 },
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

    const newPillsCount = this.countPills();

    if (newPillsCount.pellets < this.pillsLeft.pellets) {
      this.updateScore((this.pillsLeft.pellets - newPillsCount.pellets) * 10);
      this.pillsLeft.pellets = newPillsCount.pellets;
      // TODO play appropriate sound
    }
    if (newPillsCount.powerUps < this.pillsLeft.powerUps) {
      this.updateScore((this.pillsLeft.powerUps - newPillsCount.powerUps) * 50);
      this.pillsLeft.powerUps = newPillsCount.powerUps;
      // TODO play appropriate sound

      ghosts.forEach(ghost => { ghost.makeEatable() });
      // TODO play appropriate sound
    }

    if (this.pillsLeft.pellets === 0 && this.pillsLeft.powerUps === 0) {
      this.win();
      return;
    }

    // encounter = an array of ghosts in the same position as pacman who are not eaten
    const encounters = this.detectEncounter();

    if (encounters.length) {
      for (let ghost of encounters) {
        if (ghost.isEatable) {
          ghost.getEaten();
        } else {
          this.lose();
          return;
        }
      }
    }
    

    this.renderPh();
    this.renderSp();

    this.refreshCounter > 10 ? this.refreshCounter = 0 : this.refreshCounter++;
  },

  start() {
    this.buildCells();
    this.renderWalls();
    this.renderPh();
    this.renderSp();

    // setTimeout to allow the intro to play
    setTimeout(() => {

      const refreshIntervalId = setInterval(() => {
        game.refresh();
      }, 190);
      // !when wave % 5 === 0 scatter
      const waveIntervalId = setInterval(() => { this.wave++ }, 5000);

      this.intervalIds = [...[refreshIntervalId, waveIntervalId]];

      listenForInput();

    }, 3000);

  },

  end() {
    this.intervalIds.forEach(id => { clearInterval(id) });
  },

  win() {
    // TODO
  },

  lose() {
    // TODO
    this.end();
    pacman.die();

    // TODO: update then show pop up

  },
  // *checked
  renderSp() {
    ghosts.forEach(ghost => {
      this.spCells[ghost.position].className = `cell ghost ${ghost.getClasses()}`;
      // resets previous cell
      if (ghost.previousPosition >= 0) {
        this.spCells[ghost.previousPosition].className = `cell ghost`;
      }
    });
  },
  // *checked
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
  // *checked
  buildCells() {
    this.phContainer.style += `grid-template-rows: repeat(${this.height}, 1fr); grid-template-columns: repeat(${this.width}, 1fr);`
    this.spContainer.style += `grid-template-rows: repeat(${this.height}, 1fr); grid-template-columns: repeat(${this.width}, 1fr);`

    for (let i = 0; i < this.phMatrix.length; i++) {
      const phCell = document.createElement(`div`);
      const spCell = document.createElement(`div`);

      phCell.className = `cell`;
      spCell.className = `cell ghost`;

      // phCell.textContent = i.toString(); // TODO: delete this line
      // spCell.textContent = i.toString(); // TODO: delete this line


      this.phCells.push(phCell);
      this.phContainer.appendChild(phCell);
      this.spCells.push(spCell);
      this.spContainer.appendChild(spCell);
    }
  },
  // *checked
  countPills() {
    let newPelletCount = 0,
      newPowerUpCount = 0;

    this.phMatrix.forEach(cell => {
      switch (cell) {
        case 2:
          newPelletCount++;
          break;
        case 3:
          newPowerUpCount++;
      }
    });

    return { pellets: newPelletCount, powerUps: newPowerUpCount };
  },
  // *checked
  updateScore(points) {
    this.score += points;

    this.scoreElement.textContent = this.score.toString();

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highScoreElement.textContent = this.highScore.toString();
    }
  },
  // *checked
  // returns an array
  detectEncounter() {
    const encounters = [];

    for (let ghost of ghosts) {
      if (ghost.position !== pacman.position || ghost.isEaten) {
        continue;
      }

      encounters.push(ghost);
    }
    
    return encounters;
  }
}



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
  // *checked
  getClasses() {
    return `${this.classes} ${this.direction}`;
  }
  // *checked
  canMove(direction = this.direction) {
    switch (direction) {
      case `up`:
        return this.game.phMatrix[this.position - this.game.width] !== 0;
      case `down`:  // going inside the ghost home is not allowed
        // TODO dry this one
        return this.position === 157 ? false : this.game.phMatrix[this.position + this.game.width] !== 0;
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
        this.position += this.game.width;
        break;
      case `left`:
        this.position % this.game.width === 0 ? this.position += (this.game.width - 1) : this.position--;
        break;
      case `right`:
        (this.position + 1) % this.game.width === 0 ? this.position -= (this.game.width - 1) : this.position++
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
    this.position = game.phMatrix.indexOf(numberInGame);
  }

  // * move is the only access point from game obj
  move() {
    console.log(this.position, this.direction);
    if (this.canMove()) {
      this.game.phMatrix[this.position] = 1;

      super.move();

      this.game.phMatrix[this.position] = 9;
    }
  }

  die () {
    // TODO
  }
}

const pacman = new PacMan(game);

// ================================================ \\

// ================================================ \\
// the ghosts \\
class Ghost extends Player {
  constructor(game, name, direction, classes, isHome = true, homePosition, scatterPosition, position, reward, pacman) {
    super(game, name, direction, classes);
    this.homeEntrance = game.phMatrix.indexOf(4);
    this.isHome = isHome;
    this.homePosition = homePosition;
    this.scatterPosition = scatterPosition;
    this.position = position;
    this.previousPosition = -1;
    this.targetPosition = scatterPosition;
    this.isEatable = false;
    this.isEaten = false;
    this.reward = reward;
    this.pacman = pacman;
  }

  // TODO mutate getHuntPosition for all the different ghosts other than blinky
  getHuntPosition() {  //! ghost specific
    return this.pacman.position;
  }

  move() {
    if (this.isEatable && this.game.counter % 2 === 0) {
      return;
    }
    // * move is the only access point from game obj
    this.changeDirection();

    this.previousPosition = this.position;
    super.move();

  }

  canMove(direction = this.direction) {
    // eaten ghosts can move through walls
    return this.isEaten ? true : super.canMove(direction);
  }

  getDirectionOfPrevious() {
    const upIsPrevious = this.position - this.game.width === this.previousPosition,
      downIsPrevious = this.position + this.game.width === this.previousPosition,
      leftIsPrevious = this.position % this.game.width === 0 ? this.position + (this.game.width - 1) === this.previousPosition : this.position - 1 === this.previousPosition,
      rightIsPrevious = (this.position + 1) % this.game.width === 0 ? this.position - (this.game.width - 1) === this.previousPosition : this.position + 1 === this.previousPosition;

    if (upIsPrevious) {
      return `up`;
    }
    if (downIsPrevious) {
      return `down`;
    }
    if (leftIsPrevious) {
      return `left`;
    }
    if (rightIsPrevious) {
      return `right`;
    }
  }

  getTargetPosition() {
    if (isHome) {
      this.targetPosition = this.homeEntrance;
      return;
    }
    // *when a ghost is eatable it picks a random empty cell to move towards
    if (this.isEatable) {
      const notWalls =
        this.game.phMatrix
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

  changeDirection() {
    let clearPaths = this.getClearPaths();

    // *direction is only changed at intersections. ie 3 or more clearPaths
    if (clearPaths.length < 3 && this.canMove(this.direction)) {
      return;
    }

    // *so targetPosition can be changed to previous position when there's a state change
    this.getTargetPosition();

    const yDistance = Math.floor(this.position / this.game.width) - Math.floor(this.targetPosition / this.game.width),
      xDistance = this.position % this.game.width - this.targetPosition % this.game.width,
      targetIsPrevious = this.previousPosition === this.targetPosition;

    if (!targetIsPrevious) {
      clearPaths = clearPaths.filter(path => path !== this.getDirectionOfPrevious());
    }

    const absYDistance = Math.abs(yDistance),
      absXDistance = Math.abs(xDistance);

    console.log(clearPaths);  // TODO: remove this line

    this.direction = clearPaths.find((path, index) => {
      if (index === clearPaths.length - 1) {
        return true;
      }

      switch (path) {
        case `down`:
          return yDistance < 0 && absYDistance >= absXDistance;
        case `up`:
          return yDistance > 0 && absYDistance >= absXDistance;
        case `left`:
          return xDistance > 0 && absYDistance <= absXDistance;
        case `right`:
          return xDistance < 0 && absYDistance <= absXDistance;
      }
    });
  }

  getClearPaths() {
    return [`up`, `down`, `left`, `right`].filter(path => this.canMove(path));
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
      return super.getClasses();
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

const ghosts = [new Ghost(game, `Blinky`, `left`, `blinky`, isHome = false, 199, 0, 157, 200, pacman)];

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

document.addEventListener(`keydown`, e => {
  switch (e.code) {
    case `KeyH`:
      game.end();
  }
});