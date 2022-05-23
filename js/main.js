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
}

// ================================================ \\

// ================================================ \\
// pacman \\
class PacMan extends Player {
  constructor(name = `Pac-Man`, position = 325, direction = `right`, classes = `pacman`) {
    super(name, position, direction, classes);
    this.score = 0;
  }

  // TODO move is the only access point from game obj
  move() {

  }
  canMove() {
    switch (this.direction) {
      case `up`:
        return game.phMatrix[this.position - game.width]
        break;
      case `down`:
        pacman.changeDirection(`down`);
        break;
      case `left`:
        pacman.changeDirection(`left`);
        break;
      case `right`:
        pacman.changeDirection(`right`);
        break;
    }
  }
}

// ================================================ \\

// ================================================ \\
// the ghosts \\
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
    // TODO move is the only access point from game obj
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
  isLost: true,
  highScore: 0,
  pillsLeft: 0, // pills includes both the pellets and powerUps
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
    ghosts.forEach(ghost => { ghost.move() });  // TODO when pacman moves it updates the phMatrix; when the ghosts move they only set game.isLost to true when they catch pacman 

    if (this.isLost) {
      this.lose();
    }
    if (this.pillsLeft === 0) {
      this.win();
    }

    this.renderPh();
    this.renderSp();
  },

  start() {
    this.countPills();
    this.renderWalls();
    this.renderPh();
    this.renderSp();

    // setTimeout to allow the intro to play
    setTimeout(() => {

      setInterval(() => {
        game.refresh();
      }, 20);

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
      this.spCells[ghost.position].className = `cell ghost ${ghost.getClasses}`;
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
          this.phCells[i].className = `cell ${pacman.getClasses}`;
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

      phCell.textContent = i.toString();
      spCell.textContent = i.toString();


      this.phCells.push(phCell);
      this.phContainer.appendChild(phCell);
      this.spCells.push(spCell);
      this.spContainer.appendChild(spCell);
    }
  },

  countPills() {
    let totalPills = 0;

    this.phMatrix.forEach(cell => {
      if (cell === 2 || cell === 3) {
        totalPills++;
      }
    });

    this.pillsLeft = totalPills;
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

// starts the game \\
document.getElementById(`start-game`).addEventListener(`click`, e => {
  game.start();
});

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

// ================================================ \\

// ================================================ \\
// testing zone \\

game.buildCells();
game.renderWalls();
game.renderPh();

console.log(game.width, game.height);