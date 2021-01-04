/**
 * Constants for each possible sign. Used for readability instead of
 * using literals or indices.
 */
const SIGN_TWO = "two";
const SIGN_THREE = "three";
const SIGN_FOUR = "four";
const SIGN_FIVE = "five";
const SIGN_SIX = "six";
const SIGN_SEVEN = "seven";
const SIGN_EIGHT = "eight";
const SIGN_NINE = "nine";
const SIGN_TEN = "ten";
const SIGN_KNIGHT = "knight";
const SIGN_QUEEN = "queen";
const SIGN_KING = "king";
const SIGN_ACE = "ace";
const SIGN_JOKER = "joker";

/**
 * Constants for each possible suit. Used for readability instead of
 * using literals or indices.
 */
const SUIT_SPADES = "spades";
const SUIT_HEARTS = "hearts";
const SUIT_DIAMONDS = "diamonds";
const SUIT_CLUBS = "clubs";
const SUIT_NEUTRAL = "neutral";

/**
 * A map of all the possible signs. Used for readibility instead of
 * using literals.
 */
const cardSigns = new Map([
  [SIGN_TWO, "2"],
  [SIGN_THREE, "3"],
  [SIGN_FOUR, "4"],
  [SIGN_FIVE, "5"],
  [SIGN_SIX, "6"],
  [SIGN_SEVEN, "7"],
  [SIGN_EIGHT, "8"],
  [SIGN_NINE, "9"],
  [SIGN_TEN, "10"],
  [SIGN_KNIGHT, "Kn"],
  [SIGN_QUEEN, "Q"],
  [SIGN_KING, "K"],
  [SIGN_ACE, "A"],
  [SIGN_JOKER, "J"],
]);

/**
 * A map of all the possible suits. Used for readibility instead of
 * using literals.
 */
const cardSuits = new Map([
  [SUIT_SPADES, "S"],
  [SUIT_HEARTS, "H"],
  [SUIT_DIAMONDS, "D"],
  [SUIT_CLUBS, "C"],
  [SUIT_NEUTRAL, "N"],
]);

/** @class */
class Card {
  #sign;
  #suit;
  #isFaceUp;

  /**
   * Constructs a playing card with a specified `sign` and of a specified `suit`.
   * @param {string} sign The sign of the card (i.e. 2, 3, Kn, Q, J).
   * @param {string} suit The suit of the card (i.e. S(pades), H(earts), D(iamonds), C(lubs)
   * or empty string (no suit, i.e. jokers)).
   * @param {boolean} isFaceUp Indicates whether the card is with it's face up
   * or not. If omitted, the default value is `false`.
   */
  constructor(sign, suit, isFaceUp)
  {
    this.#sign = sign;
    this.#suit = suit;
    this.#isFaceUp = isFaceUp || false;
  }

  /**
   * Obtain info about the card's sign and suit.
   * @returns {Object} An object containing the `sign` and `suit` of the card and whether
   * it's face up or not.
   */
  getInfo() {
    return { sign: this.#sign, suit: this.#suit, isFaceUp: this.#isFaceUp };
  }
}

/** @class */
class Deck {
  #cards;

  /**
   * Constructs a standard 54 card deck by repeating each card `count` times.
   * @param {number} count Determines how many times each card will be present
   * in the deck. Passing zero as an argument will just create an empty deck.
   */
  constructor(count) {
    this.#cards = [];
    // TO DO: Make this smarter than three nested for loops
    for(let i = 0; i < count; ++i) {
      for(let [signKey, signValue] of cardSigns) {
        if (signKey === SIGN_JOKER) {
          continue;
        }
        for(let [suitKey, suitValue] of cardSuits) {
          if (suitKey === SUIT_NEUTRAL) {
            continue;
          }
          this.#cards.push(new Card(signValue, suitValue));
        }
      }
      // TO DO: Make this smarter than repeating code
      this.#cards.push(new Card(cardSigns.get(SIGN_JOKER), cardSuits.get(SUIT_NEUTRAL)));
      this.#cards.push(new Card(cardSigns.get(SIGN_JOKER), cardSuits.get(SUIT_NEUTRAL)));
    }
  }

  /**
   * Draw a card from the top of the deck. The card is removed from the deck.
   * @returns {Card} The @see {@link Card} at the top of the deck.
   */
  draw() {
    return this.#cards.pop();
  }

  /**
   * Draw a `count` amount of cards from the top of the deck. The cards are removed from the deck.
   * @param {number} count The amount of cards to draw from the top of the deck.
   * @returns {Array<Card>} The first `count` @see {@link Card}s at the top of the deck.
   */
  drawMultiple(count) {
    return this.#cards.splice(this.#cards.length - count, count);
  }

  /**
   * Draw a `count` amount of cards starting from the given `position` (inclusive) in the deck.
   * The cards are removed from the deck.
   * @param {number} position The position in the deck from where to draw the cards.
   * @param {number} count The amount of cards to draw from the deck.
   * @returns {Array<Card>} The first `count` @see {@link Card}s at `position` in the deck.
   */
  drawMultipleFrom(position, count) {
    return this.#cards.splice(position, count);
  }

  /**
   * Inserts a card at the top of the deck.
   * @param {Card} card The @see {@link Card} to add to the top of the deck.
   */
  insert(card) {
    this.#cards.push(card);
  }

  /**
   * 
   * @param {Function} callback 
   */
  iterate(callback) {
    for(let i = 0; i < this.#cards.length; ++i) {
      callback(i, this.#cards[i]);
    }
  }

  /**
   * Inserts multiple cards at the top of the deck.
   * @param {Array<Card>} cards An array of @see {@link Card}s to add to the top of the deck.
   */
  insertMultiple(cards) {
    this.#cards.push.apply(this.#cards, cards);
  }

  /**
   * Inserts multiple cards in the deck at `position`.
   * @param {Array<Card>} cards An array of @see {@link Card}s to add.
   * @param {number} position The position in the deck where the cards will be added.
   */
  insertMultipleAt(cards, position) {
    this.#cards.splice(position, 0, cards);
  }

  print() {
    let sequence = "";
    for(let card of this.#cards) {
      let info = card.getInfo();
      sequence += info.sign + "-" + info.suit + "-" + info.isFaceUp + "|";
    }
    debugLog(sequence);
  }

  /**
   * Randomly shuffles the deck and returns the sequence as a string.
   * @returns {string} A string specifying the order in which the cards are arranged
   * in the deck. The string has the format:
   * 
   * (sign)-(suit)|(sign)-(suit)|(sign)-(suit)|...|(sign)-(suit)
   */
  shuffle() {
    let sequence = "";
    let currentIndex = this.#cards.length - 1;
    let temp, randomIndex;
    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * this.#cards.length);
      temp = this.#cards[currentIndex];
      this.#cards[currentIndex] = this.#cards[randomIndex];
      this.#cards[randomIndex] = temp;
      sequence += this.#cards[currentIndex].getInfo()["sign"] + "-" + this.#cards[currentIndex].getInfo()["suit"] + (--currentIndex > 0 ? "|" : "");
    }
    return sequence;
  }

  /**
   * Shuffle the deck to match the given `sequence`.
   * 
   * **Warning**: This will create a whole new array of @see {@link Card} (complexity of O(n))
   * internally instead of rearranging the current one (complexity of O(n^2)).
   * @param {string} sequence A string specifying the order in which the cards in the
   * deck should be arranged. It should follow the following pattern:
   * 
   * (sign)-(suit)|(sign)-(suit)|(sign)-(suit)|...|(sign)-(suit)
   */
  shuffleTo(sequence) {
    this.#cards = [];
    let splitSequence = sequence.split("|");
    console.log(splitSequence);
    for(let card of splitSequence) {
      let signSuitPair = card.split("-");
      this.#cards.push(new Card(signSuitPair[0], signSuitPair[1]));
    }
  };

  /**
   * Returns the amount of cards currently contained in the deck.
   * @returns {number} The amount of cards in the deck.
   */
  size() {
    return this.#cards.length;
  }

  /**
   * Splits the deck in two halves specified by `position` and swaps their order.
   * Note that the card at `position` will go to the bottom of the deck after splitting it.
   * @param {number} position The position where to split the deck.
   */
  split(position) {
    let secondHalf = this.#cards.splice(position);
    this.#cards = secondHalf.concat(this.#cards);
  }
}

module.exports = {
  Card: Card,
  Deck: Deck,
}