const DRAW_CARD = 0;

/**
 * A class representing a move done by a player.
 * @class
 */
class Move {
  /** @member {number} */
  #action;
  /** @member {Object} */
  #data;

  /**
   * Constructs a move with the given `action` and `data`.
   * @param {number} action The action that was performed during that move
   * @param {Object} data The data associated with the move. For example,
   * if the player's move was to discard a card, there will be a 'discarded'
   * property with the `Card` as a value.
   */
  constructor(action, data) {
    this.#action = action;
    this.#data = data;
  }

  /**
   * Returns the `action` performed during the move.
   * @returns {number} The action performed during the move;
   */
  getAction() {
    return this.#action;
  }

  /**
   * Returns the data associated with the move.
   * @returns {Object} The data associated with the move.
   */
  getData() {
    return this.#data;
  }
}

class Player {
  #name;

  constructor(name) {
    debugLog("Instantiated a Player.");
    this.#name = name;
  }

  /**
   * The player makes the moves for their turn.
   * @returns {Array<Move>} The sequence of moves the player made
   * during their turn.
   */
  makeMoves() {
    moves = [];
    return moves;
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