class Player {
  #name;

  constructor(name) {
    debugLog("Instantiated a Player.");
    this.#name = name;
  }

  getDescription() {
    return this.#name;
  }
}

class PlayerProxy extends Player {
  constructor() {
    super("Proxy");
    debugLog("Instantiated a PlayerProxy.");
  }
}

module.exports = {
  Player: Player,
  PlayerProxy: PlayerProxy
};