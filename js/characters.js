// ================================================ \\
// character \\
class Character {
  constructor({ game, name, direction, classes, startPosition }) {
    this.game = game;
    this.name = name;
    this.direction = direction;
    this.classes = classes;
    this.startPosition = startPosition;
    this.position = startPosition;
    this.previousPosition = -1; // previousPosition is initialised outside of the matrix
    this.ghostHomeEntrance = game.matrix.indexOf(4);
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
        return this.game.matrix[this.position - this.game.width] !== 0;
      case `down`:  // going inside the ghost home is not allowed
        return this.position === this.ghostHomeEntrance ? false : this.game.matrix[this.position + this.game.width] !== 0;
      case `left`:
        if (this.position % this.game.width === 0) {
          return this.game.matrix[this.position + (this.game.width - 1)] !== 0;
        } else {
          return game.matrix[this.position - 1] !== 0;
        }
      case `right`:
        if ((this.position + 1) % this.game.width === 0) {
          return this.game.matrix[this.position - (this.game.width - 1)] !== 0;
        } else {
          return this.game.matrix[this.position + 1] !== 0;
        }
    }
  }

  move() {
    if (!this.canMove()) {
      return;
    }

    this.previousPosition = this.position;

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

  reset() {
    this.position = this.startPosition;
    this.previousPosition = -1;
  }
}
// ================================================ \\

// ================================================ \\
// pacman \\
class PacMan extends Character {
  constructor({ game, name = `Pac-Man`, direction = `right`, startPosition = 325 }) {
    super({ game, name, direction, classes: `pacman`, startPosition });
    this.isDead = false;
  }

  getClasses() {
    return this.isDead ? `d-pacman` : super.getClasses();
  }

  die() {
    this.isDead = true;
  }

  reset() {
    this.direction = `right`;
    this.isDead = false;
    super.reset();
  }
}
// ================================================ \\

// ================================================ \\
// the ghosts \\
class Ghost extends Character {
  constructor({ game, pacman, name, direction, classes, startPosition, scatterPosition, reward }) {
    super({ game, name, direction, classes, startPosition });
    this.homePosition = startPosition;
    this.scatterPosition = scatterPosition;
    this.targetPosition = scatterPosition;
    this.eatableTimeoutId = -1;
    this.isEatable = false;
    this.isEaten = false;
    this.reward = reward;
    this.pacman = pacman;
  }

  isHome() {
    return this.game.matrix[this.position] === 5;
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

  canMove(direction = this.direction) {
    // eaten ghosts can move through walls
    return this.isEaten ? true : super.canMove(direction);
  }

  move() {
    if (this.isEatable && this.game.refreshCounter % 2 === 0) {
      return;
    }

    this.changeDirection();
    super.move();
  }

  getPathToPrevious() {
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

  updateTargetPosition() {
    if (this.isHome()) {
      if (this.isEaten) {
        this.isEaten = false;
      }

      this.targetPosition = this.ghostHomeEntrance;
      return;
    }

    // when a ghost is eatable it picks a random empty cell to move towards
    if (this.isEatable) {
      const notWalls =
        this.game.matrix
          .map((cell, index) => cell > 0 ? index : -1)
          .filter(cell => cell >= 0);

      const randomTargetPosition = notWalls[Math.floor(Math.random() * notWalls.length)];
      this.targetPosition = randomTargetPosition;
      return;
    }

    // when eaten the ghost goes home
    if (this.isEaten) {
      this.targetPosition = this.homePosition;
      return;
    }

    // every fifth wave the ghosts scatter
    if (this.game.wave % 5 === 0) {
      this.targetPosition = this.scatterPosition;
      return;
    }

    this.targetPosition = this.getHuntPosition();
  }

  getHuntPosition() {
    return this.pacman.position;
  }

  getClearPaths() {
    return [`up`, `down`, `left`, `right`].filter(path => this.canMove(path));
  }

  changeDirection() {
    let clearPaths = this.getClearPaths();

    // direction is only changed at intersections. ie 3 or more clearPaths
    if (clearPaths.length < 3 && this.canMove()) {
      return;
    }

    this.updateTargetPosition();

    const targetIsPrevious = this.previousPosition === this.targetPosition,
      pathToPrevious = this.getPathToPrevious();

    if (targetIsPrevious) {
      this.direction = pathToPrevious;
      return;
    }

    clearPaths = clearPaths.filter(path => path !== pathToPrevious);

    const yDistance = Math.floor(this.position / this.game.width) - Math.floor(this.targetPosition / this.game.width),
      xDistance = this.position % this.game.width - this.targetPosition % this.game.width,
      absYDistance = Math.abs(yDistance),
      absXDistance = Math.abs(xDistance);

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

  makeEatable() {
    if (this.isEaten) {
      return;
    }
    this.isEatable = true;
    this.targetPosition = this.previousPosition;

    // to avoid prematurely making uneatable by a previously consumed powerUp
    if (this.eatableTimeoutId > 0) {
      clearTimeout(this.eatableTimeoutId);
    }

    this.eatableTimeoutId = setTimeout(() => {
      this.isEatable = false;
      this.targetPosition = this.previousPosition;
      this.eatableTimeoutId = -1;
    }, 7000);
  }

  getEaten() {
    this.isEatable = false;
    this.isEaten = true;

    this.updateTargetPosition()
  }
}
class Blinky extends Ghost {
  constructor({ game, pacman, startPosition = 157, homePosition = 199 }) {
    super({ game, pacman, name: `Blinky`, direction: `left`, classes: `blinky`, startPosition, scatterPosition: (game.width - 1), reward: 200 });
    this.homePosition = homePosition;
  }

  reset() {
    this.position = this.startPosition;
  }
}

class Pinky extends Ghost {
  constructor({ game, pacman }) {
    super({ game, pacman, name: `Pinky`, direction: `up`, classes: `pinky`, startPosition: 199, scatterPosition: 0, reward: 400 });
  }

  getHuntPosition() {
    switch (this.pacman.direction) {
      case `up`:
        return this.pacman.position - (this.game.width * 4);
      case `down`:
        return this.pacman.position + (this.game.width * 4);
      case `left`:
        return this.pacman.position % this.game.width === 0 ? (this.pacman.position + this.game.width - 4) : (this.pacman.position - 4);
      case `right`:
        return (this.pacman.position + 1) % this.game.width === 0 ? this.pacman.position - (this.game.width - 4) : (this.pacman.position - 4);
    }
  }
}

class Inky extends Ghost {
  constructor({ game, pacman, blinky }) {
    super({ game, pacman, name: `Inky`, direction: `up`, classes: `inky`, startPosition: 198, scatterPosition: game.matrix.length - 1, reward: 800 });
    this.blinky = blinky;
  }

  getHuntPosition() {
    let twoAheadOfPacman;

    switch (this.pacman.direction) {
      case `up`:
        twoAheadOfPacman = this.pacman.position - (this.game.width * 2);
        break;
      case `down`:
        twoAheadOfPacman = this.pacman.position + (this.game.width * 2);
        break;
      case `left`:
        twoAheadOfPacman = this.pacman.position % this.game.width === 0 ? (this.pacman.position + this.game.width - 2) : (this.pacman.position - 2);
        break;
      case `right`:
        twoAheadOfPacman = (this.pacman.position + 1) % this.game.width === 0 ? this.pacman.position - (this.game.width - 2) : (this.pacman.position - 2);
    }

    const yDistance = Math.floor(this.blinky.position / this.game.width) - Math.floor(twoAheadOfPacman / this.game.width),
      xDistance = this.blinky.position % this.game.width - twoAheadOfPacman % this.game.width;

    return this.blinky.position - (this.game.width * yDistance * 2) - (xDistance * 2);
  }

  move() {
    if (this.isHome() && this.game.score < 300) {
      return;
    }

    super.move();
  }
}

class Clyde extends Ghost {
  constructor({ game, pacman }) {
    super({ game, pacman, name: `Clyde`, direction: `up`, classes: `clyde`, startPosition: 200, scatterPosition: game.matrix.length - game.width, reward: 1600 });
  }

  updateTargetPosition() {
    const absYDistance = Math.abs(Math.floor(this.position / this.game.width) - Math.floor(this.pacman.position / this.game.width)),
      absXDistance = Math.abs(this.position % this.game.width - this.pacman.position % this.game.width),
      targetPosition = super.updateTargetPosition();

    if (absXDistance <= 8 || absYDistance <= 8) {
      if (targetPosition === this.pacman.position) {
        return this.scatterPosition;
      }
    }

    return targetPosition;
  }

  move() {
    if (this.isHome() && this.game.score < 800) {
      return;
    }

    super.move();
  }
}
// ================================================ \\