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
  width: playground.length,
  height: playground[0].length,
  playgroundElement: document.getElementById(`playground`),
  phMatrix: playground.flat(),
  phContainer: document.querySelector(`.physical.plane`),
  phCells: [],
  spMatrix: playground.flat().map(cell => cell <= 1 ? cell : 1),
  spContainer: document.querySelector(`.spirits.plane`),
  spCells: [],


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
    for (let i = 0; i < this.phMatrix.length; i++) {
      if (!this.phMatrix[i]) {
        this.phCells[i].classList.add(`wall`);
      }
    }
  },
  buildCells() {
    this.phContainer.style += `grid-template-rows: repeat(${this.width}, 1fr); grid-template-columns: repeat(${this.height}, 1fr);`
    this.spContainer.style += `grid-template-rows: repeat(${this.width}, 1fr); grid-template-columns: repeat(${this.height}, 1fr);`

    console.log(this.width, this.height);

    for (let i = 0; i < this.phMatrix.length; i++) {
      const phCell = document.createElement(`div`);
      const spCell = document.createElement(`div`);

      phCell.className = `cell`;
      spCell.className = `cell`;

      phCell.textContent = i.toString();
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

window.addEventListener(`keydown`, e => {
  const main = document.querySelector(`main`),
    controls = document.getElementById(`controls`);

  main.style.justifyContent = `flex-start`;
  main.style.margin = `0 auto`;

  controls.style.display = `none`;
}, { once: true });