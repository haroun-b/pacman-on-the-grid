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
// buttons

const interface = {
  startBtn: document.getElementById(`start-game`),
  mute: document.querySelector(`.mute`),
  controls: document.getElementById(`controls`),
  popup: document.getElementById(`popup`),
  audio: {
    chomp: document.querySelector(`.chomp`),
  }
}

// ================================================ \\

// ================================================ \\
// the game \\

const game = {
  matrix: playground.flat(),
  width: playground[0].length,
  height: playground.length,
  playgroundElement: document.getElementById(`playground`),
  playgroundIsBuilt: false,
  phContainer: document.querySelector(`.physical.plane`),
  phCells: [],
  spContainer: document.querySelector(`.spirits.plane`),
  spCells: [],
  pillsLeft: { pellets: 179, powerUps: 4 },
  highScore: 0,
  highScoreElement: document.querySelector(`.high.score span`),
  score: 0,
  scoreElement: document.querySelector(`.player.score span`),
  refreshCounter: 0,
  wave: 0,
  intervalIds: [],
  isOnMute: false,


  refresh() {
    pacman.move();
    this.matrix[pacman.position] = 9;
    ghosts.forEach(ghost => { ghost.move() });

    const newPillsCount = this.countPills();

    if (newPillsCount.pellets < this.pillsLeft.pellets) {
      this.updateScore((this.pillsLeft.pellets - newPillsCount.pellets) * 10);
      this.pillsLeft.pellets = newPillsCount.pellets;
      // TODO play appropriate sound
      interface.audio.chomp.play();
      interface.audio.chomp.loop = false;
    }
    if (newPillsCount.powerUps < this.pillsLeft.powerUps) {
      this.updateScore((this.pillsLeft.powerUps - newPillsCount.powerUps) * 50);
      this.pillsLeft.powerUps = newPillsCount.powerUps;
      // TODO play appropriate sound

      ghosts.forEach(ghost => { ghost.makeEatable() });
      // TODO play appropriate sound
    }


    // encounter = an array of ghosts in the same position as pacman who are not eaten
    const encounters = this.detectEncounter();

    if (encounters.length) {
      for (let ghost of encounters) {
        if (ghost.isEatable) {
          ghost.getEaten();
        } else {
          this.lose(ghost);
          this.renderPlayground();
          return;
        }
      }
    }

    this.renderPlayground();
    this.renderSp();

    if (this.pillsLeft.pellets === 0 && this.pillsLeft.powerUps === 0) {
      this.win();
      return;
    }

    this.refreshCounter > 10 ? this.refreshCounter = 0 : this.refreshCounter++;
  },

  start() {
    this.renderPopup(`hidden`);

    this.matrix = playground.flat();
    this.pillsLeft = this.countPills();
    this.refreshCounter = 0;
    this.wave = 0;
    this.score = 0;
    this.updateScore(0);
    pacman.reset();
    ghosts.forEach(ghost => { ghost.reset() });

    this.playgroundElement.classList.remove(`won`);

    if (!this.playgroundIsBuilt) {
      this.buildCells();
      this.renderWalls();

      this.playgroundIsBuilt = true;
    }

    this.renderPlayground();
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

  renderPopup(state) {
    if (state === `hidden`) {
      interface.popup.style.display = `none`;
      return;
    }

    let delay = 1700;

    const PopupHeading = interface.popup.querySelector(`h2`),
      instructions = interface.popup.querySelectorAll(`p, img`);

    const scoreP = document.createElement(`p`),
      msgP = document.createElement(`p`);

    for (let element of instructions) {
      element.remove();
    }

    scoreP.textContent = this.score === this.highScore ? `NEW HIGH SCORE: ${this.highScore}` : `YOU SCORED: ${this.score}`;

    if (state === `lost`) {
      PopupHeading.textContent = `YOU LOST`;
      PopupHeading.className = `lost`

      msgP.textContent = `Oh, Oh! It seems you lost this one.
      To play again, press the start button.`
    }
    if (state === `won`) {
      delay = 1000;
      PopupHeading.textContent = `YOU WON!`;
      PopupHeading.className = `won`

      msgP.textContent = `Woah! You defeated the ghosts. Congratulations!
      To play again, press the start button.`
    }


    interface.popup.insertBefore(scoreP, interface.startBtn);
    interface.popup.insertBefore(msgP, interface.startBtn);

    setTimeout(() => {
      interface.popup.style = null;
    }, delay);
  },

  renderDayingPacman() {
    setTimeout(() => {
      this.phCells[pacman.position].className = `cell d-pacman`;
    }, 300);
  },

  win() {
    this.end();
    this.playgroundElement.classList.add(`won`);
    this.renderPopup(`won`);
  },

  lose(killerGhost) {
    this.end();
    pacman.die(killerGhost); //!might go unused
    // this.renderDayingPacman();
    this.renderPopup(`lost`);
  },

  renderPacman() {
    this.phCells[pacman.previousPosition].className = `cell`;
    this.phCells[pacman.position].className = `cell ${pacman.getClasses()}`;
  },
  renderSp() {
    for (let ghost of ghosts) {
      if (ghost.previousPosition >= 0) {
        this.spCells[ghost.previousPosition].className = `cell ghost`;
      }

      this.spCells[ghost.position].className = `cell ghost ${ghost.getClasses()}`;
    }
  },
  // *checked
  renderPlayground() {
    for (let i = 0; i < this.matrix.length; i++) {
      switch (this.matrix[i]) {
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
      }
    }
  },
  // *checked
  renderWalls() {
    for (let i = 0; i < this.matrix.length; i++) {
      if (this.matrix[i] === 0) {
        this.phCells[i].className = `cell wall`;
      }
    }
  },
  // *checked
  buildCells() {
    this.phContainer.style += `grid-template-rows: repeat(${this.height}, 1fr); grid-template-columns: repeat(${this.width}, 1fr);`
    this.spContainer.style += `grid-template-rows: repeat(${this.height}, 1fr); grid-template-columns: repeat(${this.width}, 1fr);`

    for (let i = 0; i < this.matrix.length; i++) {
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

    this.matrix.forEach(cell => {
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
      if (
        ghost.position !== pacman.position
        && ghost.previousPosition !== pacman.position
        && pacman.previousPosition !== ghost.position
        || ghost.isEaten
      ) {
        continue;
      }

      encounters.push(ghost);
    }

    return encounters;
  }
}



// ================================================ \\

const pacman = new PacMan({ game });


const blinky = new Blinky({ game, pacman });
const ghosts = [
  blinky,
  new Pinky({ game, pacman }),
  new Inky({ game, pacman, blinky }),
  new Clyde({ game, pacman })
];

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
interface.startBtn.addEventListener(`click`, e => {
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
  interface.controls.addEventListener(`click`, e => {
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
// game.renderPlayground();

// game.start();

document.addEventListener(`keydown`, e => {
  switch (e.code) {
    case `KeyH`:
      game.end();
  }
});