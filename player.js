const DRAW_CARD_DECK = 0;
const DRAW_CARD_DISCARD_PILE = 1;
const DRAW_CARD_UPCARD = 2;
const MAKE_COMBINATION = 3;
const SWAP_JOKER = 4;
const DISCARD_CARD = 5;


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
  /** @member {Array<Cards>} */
  #hand;

  constructor(name) {
    debugLog("Instantiated a Player.");
    this.#name = name;
    this.#hand = [];
  }

  /**
   * Adds multiple cards to the player's hand.
   * @param {Array<Cards>} cards The cards to be added to the
   * player's hand.
   */
  addCardsToHand(cards) {
    this.#hand.push.apply(this.#hand, cards);
  }

  /**
   * Add a card to the player's hand.
   * @param {Card} card The card to be added to the player's hand.
   */
  addCardToHand(card) {
    this.#hand.push(card);
  }

  /**
   * Discards a card with ID `cardId` from the player's hand.
   * @param {number} cardId The ID of the card to discard from
   * the player's hand.
   * @returns {(Card|undefined)} The card that is discarded from
   * the player's hand or `undefined` if there's no card with
   * ID `cardId` in the player's hand.
   */
  discardCardFromHand(cardId) {
    return this.#hand.find(card => {
      return card.id == cardId;
    });
  }

  /**
   * Discards the cards which have their IDs present in `cardIds`
   * from the player's hand.
   * @param {Array<number>} cardIds An array containing the IDs of
   * the cards to be discarded from the player's hand.
   * @returns {Array<Card>} An array containing the discarded `Card`s.
   * The array will be empty if none of the `cardIds` matches with
   * a card ID from the player's hand. 
   */
  discardCardsFromHand(cardIds) {
    let discarded = [];
    cardIds.forEach(id => {
      let card = this.#hand.find(id);
      if (card) {
        discarded.push(card);
      }
    });
    return discarded;
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