// ================================================ \\
/*
name:  inGameNumber

wall: 0,
emptySpace: 1,
pellet: 2,
powerUp: 3,
ghostHomeEntrance: 4,
ghostHomeCell: 5,
*/
// ================================================ \\

// ================================================ \\
const interface = {
  startBtn: document.getElementById(`start-game`),
  muteBtn: document.querySelector(`.mute`),
  controls: document.getElementById(`controls`),
  popup: document.getElementById(`popup`),
},
  audio = {
    intro: document.querySelector(`.intro`),
    chomp: document.querySelector(`.chomp`),
    intermission: document.querySelector(`.intermission`),
    eatGhost: document.querySelector(`.eat-ghost`),
    death: document.querySelector(`.death`),
  };
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
  pillsLeft: { pellets: 0, powerUps: 0 },
  highScore: 0,
  highScoreElement: document.querySelector(`.high.score span`),
  score: 0,
  scoreElement: document.querySelector(`.player.score span`),
  refreshCounter: 0,
  wave: 0,
  intervalIds: [],
  audiTimeoutIds: {},
  isOnMute: false,

  start() {
    this.renderPopup(`hidden`);
    this.playSound(`intro`);


    if (this.playgroundIsBuilt) {
      this.matrix = playground.flat();

      this.refreshCounter = 0;
      this.wave = 0;
      this.score = 0;
      pacman.reset();
      ghosts.forEach(ghost => { ghost.reset() });

      this.playgroundElement.classList.remove(`won`);
      this.updateScore(0);
    } else {
      this.buildCells();
      this.renderWalls();

      this.playgroundIsBuilt = true;
    }

    this.pillsLeft = this.countPills();
    this.renderPills();
    this.renderPacman();
    this.renderGhosts();

    // setTimeout to allow the intro to play
    setTimeout(() => {
      const refreshIntervalId = setInterval(() => { game.refresh() }, 190);
      // when wave % 5 === 0 scatter
      const waveIntervalId = setInterval(() => { this.wave++ }, 5000);

      this.intervalIds = [...[refreshIntervalId, waveIntervalId]];

      listenForInput();
    }, 3000);
  },

  refresh() {
    pacman.move();
    ghosts.forEach(ghost => { ghost.move() });

    const pacmanPreviousCell = this.matrix[pacman.previousPosition];

    if (pacmanPreviousCell === 2) {
      this.pillsLeft.pellets--;
      this.updateScore(10);

      this.playSound(`chomp`);
    } else if (pacmanPreviousCell === 3) {
      this.pillsLeft.powerUps--;
      this.updateScore(50);
      ghosts.forEach(ghost => { ghost.makeEatable() });

      this.playSound(`intermission`);
    }
    if (pacmanPreviousCell < 4 && pacmanPreviousCell > 1) {
      this.matrix[pacman.previousPosition] = 1;
    }

    this.renderPacman();
    this.renderGhosts();

    // encounter = an array of ghosts in the same position as pacman who are not eaten
    const encounters = this.detectEncounter();

    if (encounters.length) {
      for (let ghost of encounters) {
        if (ghost.isEatable) {
          ghost.getEaten();
          this.playSound(`eatGhost`);
          this.updateScore(ghost.reward);
        } else {
          this.lose();
          return;
        }
      }
    }
    if (this.pillsLeft.pellets <= 0 && this.pillsLeft.powerUps <= 0) {
      this.win();
      return;
    }

    this.refreshCounter > 10 ? this.refreshCounter = 0 : this.refreshCounter++;
  },
  // returns an array of ghosts
  detectEncounter() {
   return ghosts.filter(ghost => {
      const isThereCollision = ghost.position === pacman.position
      // this is because when they collide head to head they swap positions
      || (ghost.previousPosition === pacman.position
          && pacman.previousPosition === ghost.position);

        return !ghost.isEaten && isThereCollision;
    });
  },

  end() {
    this.intervalIds.forEach(id => { clearInterval(id) });
  },

  win() {
    this.end();
    this.playgroundElement.classList.add(`won`);  // this causes the background-color to change to white

    this.hideGhosts();
    setTimeout(() => { this.renderPopup(`won`); this.phCells[pacman.position].className = `cell`; }, 1000);
  },

  lose() {
    this.end();
    pacman.die();

    setTimeout(() => { this.hideGhosts(); this.renderPacman(); this.playSound(`death`) }, 1000);
    setTimeout(() => { this.renderPopup(`lost`) }, 2700);
  },

  buildCells() {
    this.phContainer.style += `grid-template-rows: repeat(${this.height}, 1fr); grid-template-columns: repeat(${this.width}, 1fr);`
    this.spContainer.style += `grid-template-rows: repeat(${this.height}, 1fr); grid-template-columns: repeat(${this.width}, 1fr);`

    for (let i = 0; i < this.matrix.length; i++) {
      const phCell = document.createElement(`div`);
      const spCell = document.createElement(`div`);

      phCell.className = `cell`;
      spCell.className = `cell ghost`;

      this.phCells.push(phCell);
      this.phContainer.appendChild(phCell);
      this.spCells.push(spCell);
      this.spContainer.appendChild(spCell);
    }
  },

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

  renderPills() {
    for (let i = 0; i < this.matrix.length; i++) {
      switch (this.matrix[i]) {
        case 2:
          this.phCells[i].className = `cell pellet`;
          break;
        case 3:
          this.phCells[i].className = `cell power-up`;
      }
    }
  },

  renderWalls() {
    for (let i = 0; i < this.matrix.length; i++) {
      if (this.matrix[i] === 0) {
        this.phCells[i].className = `cell wall`;
      }
    }
  },

  renderGhosts() {
    for (let ghost of ghosts) {
      if (ghost.previousPosition >= 0) {
        this.spCells[ghost.previousPosition].className = `cell ghost`;
      }

      this.spCells[ghost.position].className = `cell ghost ${ghost.getClasses()}`;
    }
  },

  hideGhosts() {
    ghosts.forEach(ghost => {
      this.spCells[ghost.position].className = `cell ghost`
    });
  },

  renderPacman() {
    if (pacman.previousPosition >= 0) {
      this.phCells[pacman.previousPosition].className = `cell`;
    }
    this.phCells[pacman.position].className = `cell ${pacman.getClasses()}`;
  },

  renderPopup(state) {
    if (state === `hidden`) {
      interface.popup.style.display = `none`;
      return;
    }

    const PopupHeading = interface.popup.querySelector(`h2`),
      instructions = interface.popup.querySelectorAll(`p, img`);

    const scoreP = document.createElement(`p`),
      msgP = document.createElement(`p`);

    for (let element of instructions) {
      element.remove();
    }

    scoreP.textContent = this.score === this.highScore ? `NEW HIGH SCORE: ${this.highScore}` : `YOU SCORED: ${this.score}`;

    switch (state) {
      case `lost`:
        PopupHeading.textContent = `YOU LOST`;
        PopupHeading.className = `lost`

        msgP.textContent = `Oh, Oh! It seems you lost this one.
      To play again, press the start button.`
        break;
      case `won`:
        PopupHeading.textContent = `YOU WON!`;
        PopupHeading.className = `won`

        msgP.textContent = `Woah! You defeated the ghosts. Congratulations!
      To play again, press the start button.`
    }

    interface.popup.insertBefore(scoreP, interface.startBtn);
    interface.popup.insertBefore(msgP, interface.startBtn);

    interface.popup.style = null;
  },

  updateScore(points) {
    this.score += points;

    this.scoreElement.textContent = this.score.toString();

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highScoreElement.textContent = this.highScore.toString();
    }
  },

  playSound(sound) {
    if (this.isOnMute) {
      return;
    }

    switch (sound) {
      case `chomp`:
        clearTimeout(this.audiTimeoutIds.chomp);

        this.audiTimeoutIds.chomp = setTimeout(() => {
          audio.chomp.pause();
          audio.chomp.currentTime = 0;
        }, 500);

        audio.chomp.play();
        return;
      case `eatGhost`:
        audio.eatGhost.currentTime = 0;
        audio.eatGhost.play();
        return;
      case `intermission`:
        clearTimeout(this.audiTimeoutIds.intermission);

        this.audiTimeoutIds.intermission = setTimeout(() => {
          audio.intermission.pause();
          audio.intermission.currentTime = 0;
        }, 7000);

        audio.intermission.play();
        return;
      case `death`:
        audio.death.currentTime = 0;
        audio.death.play();
        return;
      case `intro`:
        audio.intro.currentTime = 0;
        audio.intro.play();
    }
  },

  toggleSound() {
    if (this.isOnMute) {
      this.isOnMute = false;
      interface.muteBtn.className = `mute off`;
      return;
    }
    
    this.isOnMute = true;
    interface.muteBtn.className = `mute on`;
  }
}
// ================================================ \\

const pacman = new PacMan({ game });

const blinky = new Blinky({ game, pacman }),
  pinky = new Pinky({ game, pacman }),
  // blinky is passed to inky because inky relies on blinky's position to choose a hunt target position
  inky = new Inky({ game, pacman, blinky }),
  clyde = new Clyde({ game, pacman }),
  ghosts = [blinky, pinky, inky, clyde];

// ================================================ \\

// ================================================ \\
// event listeners \\

// hides the on screen controls \\
document.addEventListener(`keydown`, e => {
    controls = document.getElementById(`controls`);
  controls.style.display = `none`;
}, { once: true });
// ================================================ \\
// starts the game \\
interface.startBtn.addEventListener(`click`, e => { game.start() });
// ================================================ \\
// mute button \\
interface.muteBtn.addEventListener(`click`, e => { game.toggleSound() });
// ================================================ \\

function listenForInput() {
  // changes pacman's direction based on keyboard input
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
    }
  });

  // changes pacman's direction based on screen control input
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
    }
  });

  // styles the on-screen controls on tap
  interface.controls.addEventListener(`touchstart`, e => {
    e.target.style.backgroundColor = `#1e1e87`;
  });

  interface.controls.addEventListener(`touchend`, e => {
    e.target.style.backgroundColor = null;
  });
}
// ================================================ \\