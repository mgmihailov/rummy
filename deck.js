POINT_THRESHOLD = 11;

/**
 * Constants for each possible sign. Used for readability instead of
 * using literals or indices.
 */
const SIGN_TWO = 0;
const SIGN_THREE = 1;
const SIGN_FOUR = 2;
const SIGN_FIVE = 3;
const SIGN_SIX = 4;
const SIGN_SEVEN = 5;
const SIGN_EIGHT = 6;
const SIGN_NINE = 7;
const SIGN_TEN = 8;
const SIGN_KNIGHT = 9;
const SIGN_QUEEN = 10;
const SIGN_KING = 11;
const SIGN_ACE = 12;
const SIGN_JOKER = 13;

/**
 * Constants for each possible suit. Used for readability instead of
 * using literals or indices.
 */
const SUIT_SPADES = 14;
const SUIT_HEARTS = 15;
const SUIT_DIAMONDS = 16;
const SUIT_CLUBS = 17;
const SUIT_NEUTRAL = 18;

/**
 * Constants for each possible rank. Used for readability instead of
 * using literals or indices.
 */
const RANK_ONE = 1;
const RANK_TWO = 2;
const RANK_THREE = 3;
const RANK_FOUR = 4;
const RANK_FIVE = 5;
const RANK_SIX = 6;
const RANK_SEVEN = 7;
const RANK_EIGHT = 8;
const RANK_NINE = 9;
const RANK_TEN = 10;
const RANK_KNIGHT = 11;
const RANK_QUEEN = 12;
const RANK_KING = 13;
const RANK_ACE = 14;
const RANK_JOKER = -1;

/**
 * A map of all the possible signs. Used for readibility instead of
 * using literals.
 */
const cardSigns = new Map([
  [SIGN_TWO, 2],
  [SIGN_THREE, 3],
  [SIGN_FOUR, 4],
  [SIGN_FIVE, 5],
  [SIGN_SIX, 6],
  [SIGN_SEVEN, 7],
  [SIGN_EIGHT, 8],
  [SIGN_NINE, 9],
  [SIGN_TEN, 10],
  [SIGN_KNIGHT, 11],
  [SIGN_QUEEN, 12],
  [SIGN_KING, 13],
  [SIGN_ACE, 14],
  [SIGN_JOKER, 16],
]);

/**
 * A map of all the possible suits. Used for readibility instead of
 * using literals.
 */
const cardSuits = new Map([
  [SUIT_SPADES, 16],
  [SUIT_HEARTS, 17],
  [SUIT_DIAMONDS, 18],
  [SUIT_CLUBS, 19],
  [SUIT_NEUTRAL, 20],
]);

const cardRanks = new Map([
  //[SIGN_ONE, 1],
  [SIGN_TWO, 2],
  [SIGN_THREE, 3],
  [SIGN_FOUR, 4],
  [SIGN_FIVE, 5],
  [SIGN_SIX, 6],
  [SIGN_SEVEN, 7],
  [SIGN_EIGHT, 8],
  [SIGN_NINE, 9],
  [SIGN_TEN, 10],
  [SIGN_KNIGHT, 11],
  [SIGN_QUEEN, 12],
  [SIGN_KING, 13],
  [SIGN_ACE, 14],
  [SIGN_JOKER, -1],
]);

let cardCounter = 0;

/** @class */
class Card {
  /** @member {number} */
  #id;
  /** @member {boolean} */
  #isJoker;
  /** @member {string} */
  sign;
  /** @member {string} */
  suit;
  /** @member {boolean} */
  isFaceUp;
  /** @member {number} */
  rank;

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
    this.#id = cardCounter++;
    this.#isJoker = (sign === cardSigns.get(SIGN_JOKER));
    this.sign = sign;
    this.suit = suit;
    this.isFaceUp = isFaceUp || false;
    this.rank = this.sign;
  }

  /**
   * Obtain info about the card's sign and suit.
   * @returns {Object} An object containing the `sign` and `suit` of the card and whether
   * it's face up or not.
   */
  getInfo() {
    return { sign: this.sign, suit: this.suit, isFaceUp: this.isFaceUp };
  }

  get id() {
    return this.#id;
  }

  get isJoker() {
    return this.#isJoker;
  }

  get points() {
    return rank % POINT_THRESHOLD;
  }

  toString() {
    return this.sign + "-" + this.suit;
  }
}

/** @class */
class CardProxy {
  /** @member */
  #instance;
  /** @member */
  sign;
  /** @member */
  suit;
  /** @member */
  isFaceUp;
  /** @member */
  rank;
  
  constructor(card) {
    this.#instance = card;
    this.sign = card.sign;
    this.suit = card.suit;
    this.isFaceUp = card.isFaceUp;
    this.rank = card.rank;
  }

  get instanceId() {
    return this.#instance.id;
  }

  get isJoker() {
    return this.#instance.isJoker;
  }

  get points() {
    return this.rank % POINT_THRESHOLD;
  }

  toString() {
    return this.#instance.toString();
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

  /**
   * Go through the cards in the deck and apply a function to each of them.
   * @param {Function} callback The function to be called for each card. It
   * takes the following parameters:
   * - idx (a number representing the position of the card in the deck)
   * - card (the Card itself)
   */
  iterate(callback) {
    for(let i = 0; i < this.#cards.length; ++i) {
      callback(i, this.#cards[i]);
    }
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
  CardProxy: CardProxy,
  Constants: {
    Signs: cardSigns,
    Suits: cardSuits,
    // Signs
    SIGN_TWO: SIGN_TWO,
    SIGN_THREE: SIGN_THREE,
    SIGN_FOUR: SIGN_FOUR,
    SIGN_FIVE: SIGN_FIVE,
    SIGN_SIX: SIGN_SIX,
    SIGN_SEVEN: SIGN_SEVEN,
    SIGN_EIGHT: SIGN_EIGHT,
    SIGN_NINE: SIGN_NINE,
    SIGN_TEN: SIGN_TEN,
    SIGN_KNIGHT: SIGN_KNIGHT,
    SIGN_QUEEN: SIGN_QUEEN,
    SIGN_KING: SIGN_KING,
    SIGN_ACE: SIGN_ACE,
    SIGN_JOKER: SIGN_JOKER,
    // Suits
    SUIT_SPADES: SUIT_SPADES, 
    SUIT_HEARTS: SUIT_HEARTS,
    SUIT_DIAMONDS: SUIT_DIAMONDS,
    SUIT_CLUBS: SUIT_CLUBS,
    SUIT_NEUTRAL: SUIT_NEUTRAL,
    // Ranks
    RANK_ONE: RANK_ONE,
    RANK_TWO: RANK_TWO,
    RANK_THREE: RANK_THREE,
    RANK_FOUR: RANK_FOUR,
    RANK_FIVE: RANK_FIVE,
    RANK_SIX: RANK_SIX,
    RANK_SEVEN: RANK_SEVEN,
    RANK_EIGHT: RANK_EIGHT,
    RANK_NINE: RANK_NINE,
    RANK_TEN: RANK_TEN,
    RANK_KNIGHT: RANK_KNIGHT,
    RANK_QUEEN: RANK_QUEEN,
    RANK_KING: RANK_KING,
    RANK_ACE: RANK_ACE,
    RANK_JOKER: RANK_JOKER,
  },
  Deck: Deck,
}