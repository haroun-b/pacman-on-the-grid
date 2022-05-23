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

const ghosts = [];

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
  width: playground.length,
  height: playground[0].length,
  playgroundElement: document.getElementById(`playground`),
  phMatrix: playground.flat(),
  phContainer: document.querySelector(`.physical.plane`),
  phCells: [],
  spMatrix: playground.flat().map(cell => cell <= 1 ? cell : 1), // !find a way to not use this
  spContainer: document.querySelector(`.spirits.plane`),
  spCells: [],


  refresh() {

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

    }, 3000);

  },
  end() {

  },
  win() {

  },
  lose() {

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
    this.phContainer.style += `grid-template-rows: repeat(${this.width}, 1fr); grid-template-columns: repeat(${this.height}, 1fr);`
    this.spContainer.style += `grid-template-rows: repeat(${this.width}, 1fr); grid-template-columns: repeat(${this.height}, 1fr);`

    for (let i = 0; i < this.phMatrix.length; i++) {
      const phCell = document.createElement(`div`);
      const spCell = document.createElement(`div`);

      phCell.className = `cell`;
      spCell.className = `cell ghost`;

      // phCell.textContent = i.toString();
      spCell.textContent = i.toString();


      this.phCells.push(phCell);
      this.phContainer.appendChild(phCell);
      this.spCells.push(spCell);
      this.spContainer.appendChild(spCell);
    }
  }
}

game.buildCells();
game.renderWalls();
game.renderPh();



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

// changes pacman's direction based on keyboard input \\
document.addEventListener(`keydown`, e => {
  switch (e.code) {
    case `ArrowUp`:

      break;
    case `ArrowDown`:

      break;
    case `ArrowLeft`:

      break;
    case `ArrowRight`:

      break;
  }
});

// changes pacman's direction based on screen control input \\
document.getElementById(`controls`).addEventListener(`click`, e => {
  const targetClass = e.target.className;

  switch (targetClass) {
    case `control up`:

      break;
    case `control down`:

      break;
    case `control left`:

      break;
    case `control right`:

      break;
  }
});