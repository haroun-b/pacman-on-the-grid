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
  width: playground[0].length,
  height: playground.length,
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
  buildCells() {
    this.phContainer.style += `grid-template-rows: repeat(${this.width}, 1fr); grid-template-columns: repeat(${this.height}, 1fr);`
    this.spContainer.style += `grid-template-rows: repeat(${this.width}, 1fr); grid-template-columns: repeat(${this.height}, 1fr);`

    for (let i = 0; i < this.phMatrix.length; i++) {
      const phCell = document.createElement(`div`);
      const spCell = document.createElement(`div`);

      phCell.className = `cell`;
      spCell.className = `cell`;

      this.phCells.push(phCell);
      this.phContainer.appendChild(phCell);
      this.spCells.push(spCell);
      this.spContainer.appendChild(spCell);
    }
  }
}


game.buildCells();
console.log(game.width, game.height);

// visualViewport.addEventListener(`resize`, e => {
//   [game.playgroundElement, game.phContainer, game.spContainer].forEach(container => {
//     if (visualViewport.width < visualViewport.height) {
//       container.style.width = `100vw`;
//       container.style.height = `${(game.height / game.width) * 100}vw`;

      
//     }
//     if (visualViewport.width > visualViewport.height) {
//       container.style.height = `100vh`;
//       container.style.width = `${(game.width / game.height) * 100}vh`;
//     }
//   });
// });