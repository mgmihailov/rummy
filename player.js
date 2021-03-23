const { Card, CardProxy, Constants } = require("./deck.js");

const DRAW_CARD_DECK = 0;
const DRAW_CARD_DISCARD_PILE = 1;
const DRAW_CARD_UPCARD = 2;
const MAKE_COMBINATION = 3;
const SWAP_JOKER = 4;
const DISCARD_CARD = 5;
const END_TURN = 6;

const maxRecursionCalls = 5;
let recursionCalls = 0;
let cutRecursionCalls = 0;
let completedSequences = 0;
let hasFoundFullCombo = true;
let debugMsgCounter = 0;
let output = document.createElement("div");
output.style = "border: 1px solid black; width: 100%; height: 800px; overflow-x: scroll; overflow-y: scroll;";
document.body.appendChild(output);
let debugMsgBuffer = "";
let appendedTextOnce = false;

const NOT_SET = -1;
const SEQUENCE = 0;
const N_OF_A_KIND = 1;
const FIRST_CARD_JOKER = 2;
const SECOND_CARD_JOKER = 3;

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
  /** @member {Function} */
  #onActionStart;
  /** @member {Function} */
  #onActionEnd;
  #possibleCombos;

  constructor(name) {
    debugLog("Instantiated a Player.");
    this.#name = name;
    this.#hand = [];
    this.#onActionStart = null;
    this.#onActionEnd = null;
    this.#possibleCombos = new Map();
  }

  /**
   * Adds multiple cards to the player's hand.
   * @param {Array<Cards>} cards The cards to be added to the
   * player's hand.
   */
  addCardsToHand(cards) {
    this.#hand.push.apply(this.#hand, cards);
    this.#hand.sort((a, b) => {
      if (a.suit < b.suit) {
        return -1;
      } else if (a.suit > b.suit) {
        return 1;
      }

      return a.sign <= b.sign ? -1 : 1;
    });

    //console.log(this.#hand.toString());
    //let memo = {};
    //this.#updatePossibleCombos(this.#hand, [], [], memo);
    //console.log(memo);
    //console.log(recursionCalls);
  }

  /**
   * Add a card to the player's hand.
   * @param {Card} card The card to be added to the player's hand.
   */
  addCardToHand(card) {
    this.#hand.splice(0, 0, card);
    //this.#hand.push(card);
  }

  #isCardSuitPresent(cards, suit) {
    for (let card of cards) {
      if (card.suit === suit) {
        return true;
      }
    }

    return false;
  }

  #canMakeComboBetween(firstCard, secondCard) {
    let result = NOT_SET;
    if (firstCard.isJoker && !secondCard.isJoker &&
        firstCard.sign === Constants.Signs.get(Constants.SIGN_JOKER)) {
      result = FIRST_CARD_JOKER;
    } else if (!firstCard.isJoker && secondCard.isJoker) {
      result = SECOND_CARD_JOKER;
    } else if (firstCard.suit === secondCard.suit) {
      if (firstCard.rank + 1 === secondCard.rank) {
        result = SEQUENCE;
      }
    } else if (firstCard.sign === secondCard.sign) {
      result = N_OF_A_KIND;
    }

    return result;
  }

  #updatePossibleCombos(remainingCards, unusedCard, fullCombos = [], sequence = [], latestSequence = [], memo = {}) {
    const cardStr = unusedCard.toString();
    let sequenceInfo = latestSequence.length === 0 ? { length: 0, type: NOT_SET, hasJokers: false } : latestSequence.pop();

    // DEBUG_BEGIN
    if (debugMsgCounter < 1000) {
      debugMsgBuffer += "++++++ Calculating combos ++++++\n";

      debugMsgBuffer += "Sequence: ";
      let msg = "[";
      for (let combo of sequence) {
        msg += "[";
        for (let card of combo) {
          msg += card.toString() + ", ";
        }
        msg = msg.slice(0, msg.length >= 2 ? msg.length - 2 : msg.length);
        msg += "], ";
      }
      msg = msg.slice(0, msg.length >= 2 ? msg.length - 2 : msg.length);
      msg += "]\n"
      debugMsgBuffer += msg;

      debugMsgBuffer += "Latest combo: ";
      msg = "[";
      for (let card of latestSequence) {
        if (card instanceof CardProxy) {
          msg += card.toString() + ", ";
        }
      }
      msg = msg.slice(0, msg.length >= 2 ? msg.length - 2 : msg.length);
      msg += "] Type: " + sequenceInfo.type + "\n";
      debugMsgBuffer += msg;
    } //else if (!appendedTextOnce) {
      //debugMsgCounter = 0;
      //output.innerText += debugMsgBuffer;
      //appendedTextOnce = true;
      //debugMsgBuffer = "";
    //}
    // DEBUG_END

    if (memo[cardStr] !== undefined) {
      return memo[cardStr];
    }

    //if (hasFoundFullCombo) {
    //  return;
    //}

    if (remainingCards.length === 0 && sequenceInfo.length === 0) {
      if (sequence.length !== 0) {
        ++completedSequences;
        fullCombos.push(sequence);
        //hasFoundFullCombo = true;
        memo[cardStr] = fullCombos;
      }
      return;
    }

    for (let card in remainingCards) {
      let latestSequenceInfoCopy = { length: sequenceInfo.length, type: sequenceInfo.type, hasJokers: sequenceInfo.hasJokers };
      let currentCard = new CardProxy(remainingCards[card]);

      if (latestSequence.length === 0) {
        if (remainingCards[card].sign !== Constants.Signs.get(Constants.SIGN_KING)) {
          let cardProxy = new CardProxy(remainingCards[card]);

          if (cardProxy.sign === Constants.Signs.get(Constants.SIGN_ACE)) {
            cardProxy.rank = Constants.RANK_ONE;
          }
          
          let latestSequenceCopy = [
            cardProxy,
            {
              length: 1,
              type: SEQUENCE,
              hasJokers: remainingCards[card].isJoker
            }
          ];
          let remainingCardsCopy = [...remainingCards];
          remainingCardsCopy.splice(card, 1);
          let sequenceCopy = [...sequence];
          this.#updatePossibleCombos(remainingCardsCopy, unusedCard, fullCombos, sequenceCopy, latestSequenceCopy, memo);
        }
        latestSequenceInfoCopy.type = N_OF_A_KIND;
      } else {
        let lastCard = latestSequence[latestSequence.length - 1];
        let isCardPartOfCombo = lastCard !== undefined ? this.#canMakeComboBetween(lastCard, currentCard) : NOT_SET;

        if (latestSequenceInfoCopy.length !== 0 &&
            (isCardPartOfCombo === NOT_SET ||
              (isCardPartOfCombo === SEQUENCE && latestSequenceInfoCopy.type === N_OF_A_KIND) ||
              (isCardPartOfCombo === N_OF_A_KIND && latestSequenceInfoCopy.type === SEQUENCE))) {
          ++cutRecursionCalls;
          continue;
        }

        if (isCardPartOfCombo === SECOND_CARD_JOKER &&
            latestSequenceInfoCopy.hasJokers) {
          continue;
        }

        if (latestSequenceInfoCopy.length < 3) {
          if (latestSequenceInfoCopy.type === SEQUENCE &&
              isCardPartOfCombo === FIRST_CARD_JOKER &&
              currentCard.sign === Constants.Signs.get(Constants.SIGN_ACE)) {
            continue;
          }

          if (latestSequenceInfoCopy.type === N_OF_A_KIND &&
              (currentCard.sign !== lastCard.sign ||
                (currentCard.sign === lastCard.sign &&
                  this.#isCardSuitPresent(latestSequence, currentCard.suit)))) {
            continue;
          }
        }

        if (isCardPartOfCombo === FIRST_CARD_JOKER) {
          if (latestSequenceInfoCopy.type === SEQUENCE) {
            if (currentCard.sign === Constants.Signs.get(Constants.SIGN_TWO)) {
              lastCard.sign = Constants.Signs.get(Constants.SIGN_ACE);
            } else {
              lastCard.sign = currentCard.sign - 1;
            }
            lastCard.rank = currentCard.rank - 1;
            lastCard.suit = currentCard.suit;
          } else if (latestSequenceInfoCopy.type === N_OF_A_KIND) {
            lastCard.sign = currentCard.sign;
            lastCard.rank = currentCard.rank;
          }
        } else if (isCardPartOfCombo === SECOND_CARD_JOKER) {
          if (latestSequenceInfoCopy.type === SEQUENCE) {
            if (lastCard.sign === Constants.Signs.get(Constants.SIGN_ACE) &&
                lastCard.rank === Constants.RANK_ONE) {
              currentCard.sign = Constants.Signs.get(Constants.SIGN_ACE);
            } else {
              currentCard.sign = lastCard.sign + 1;
            }
            currentCard.rank = lastCard.rank + 1;
            currentCard.suit = lastCard.suit;
          } else if (latestSequenceInfoCopy.type === N_OF_A_KIND) {
            currentCard.sign = lastCard.sign;
            currentCard.rank = lastCard.rank;
          }
        }
      }
  
      ++recursionCalls;

      ++latestSequenceInfoCopy.length;
      latestSequenceInfoCopy.hasJokers |= remainingCards[card].isJoker;
      let remainingCardsCopy = [...remainingCards];
      remainingCardsCopy.splice(card, 1);
      let latestSequenceCopy = [...latestSequence];
      latestSequenceCopy.push(currentCard);
      let sequenceCopy = [...sequence];

      // Start another branch where we push the
      // already completed combo and begin a new
      // one
      if (latestSequenceInfoCopy.length >= 3) {
        let emptyLatestSequence = [];
        emptyLatestSequence.push({ length: 0, type: NOT_SET, hasJokers: false});

        let sequenceCopy2 = [...sequenceCopy];
        let completedSequence = [...latestSequenceCopy];
        sequenceCopy2.push(completedSequence);

        let remainingCardsCopy2 = [...remainingCardsCopy];

        this.#updatePossibleCombos(remainingCardsCopy2, unusedCard, fullCombos, sequenceCopy2, emptyLatestSequence, memo);
      }

      latestSequenceCopy.push(latestSequenceInfoCopy);
      this.#updatePossibleCombos(remainingCardsCopy, unusedCard, fullCombos, sequenceCopy, latestSequenceCopy, memo);
    }

    // DEBUG_BEGIN
    if (debugMsgCounter <= 1000) {
      debugMsgCounter++;

      debugMsgBuffer += "++++++ Completed combo calculation ++++++\n";
    } else if (!appendedTextOnce) {
      output.innerText += debugMsgBuffer;
      appendedTextOnce = true;
      debugMsgBuffer = "";
    }
    // DEBUG_END
  }

  canMakeComboWithCard(newCard) {
    return false;
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
  makeMoves(onActionStart, onActionEnd) {
    if ((this.#onActionStart && this.#onActionEnd) ||
        (!onActionStart && !onActionEnd)) {
      return;
    }

    this.#onActionStart = onActionStart;
    this.#onActionEnd = onActionEnd;
  }

  // IMPORTANT! TO DO: Game should listen for end turn button click
  // when human player is playing - that will mean that the human
  // player's turn is over. It should also send message to the other
  // human player that their proxy has ended its turn so that they
  // can actually start playing.

  printHand() {
    for(let card of this.#hand) {
      console.log(card.sign + " of " + card.suit + " |");
    }
  }

  // TEMP: REMOVE
  updatePossibleCombos() {
    let fullCombos = [];
    let totalTime = 0;

    //hasFoundFullCombo = false;
    for (let card in this.#hand) {
      let remainingCards = [...this.#hand];
      remainingCards.splice(card, 1);
      output.innerText += "Check combos without using " + this.#hand[card].toString() + "\n";
      let start = Date.now();
      this.#updatePossibleCombos(remainingCards, this.#hand[card], fullCombos);
      let elapsed = Date.now() - start;
      totalTime += elapsed;
    }
    console.log("Time elapsed for #updatePossibleCombos: " + totalTime + "ms");
    console.log("recursionCalls: " + recursionCalls);
    console.log("cutRecursionCalls: " + cutRecursionCalls);
    console.log("completedSequences: " + completedSequences);
    console.log(fullCombos);

    document.body.appendChild(output);
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