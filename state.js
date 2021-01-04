// TO DO: Create a map indicating to which state the game can transition
// from the current one.

class State {
  static #CHOOSE_MODE = 0;
  static #CHOOSE_TURN = 0;
  static #WAIT_GAME_START = 1;
  static #ENTER_DECK_SEQUENCE = 1;
  static #CHOOSE_MOVE = 2;
  static #CHOOSE_MOVE_MIRRORED = 1;
  static #CHOOSE_MOVE_OPPONENT = 1;
  static #DRAW_CARD = 3;
  static #DRAW_CARD_MIRRORED = 3;
  static #DRAW_CARD_OPPONENT = 3;
  static #DISCARD_CARD = 4;
  static #DISCARD_CARD_MIRRORED = 4;
  static #DISCARD_CARD_OPPONENT = 4;
  static #MAKE_COMBO = 5;
  static #MAKE_COMBO_MIRRORED = 5;
  static #MAKE_COMBO_OPPONENT = 5;
  static #ADD_TO_COMBO = 6;
  static #ADD_TO_COMBO_MIRRORED = 6;
  static #ADD_TO_COMBO_OPPONENT = 6;
  static #PICK_CARD_FROM_PILE = 6;
  static #PICK_CARD_FROM_PILE_MIRRORED = 6;
  static #PICK_CARD_FROM_PILE_OPPONENT = 6;
  static #PICK_BOTTOM_CARD = 7;
  static #PICK_BOTTOM_CARD_MIRRORED = 7;
  static #PICK_BOTTOM_CARD_OPPONENT = 7;
  static #SWAP_CARD_WITH_JOKER = 8;
  static #SWAP_CARD_WITH_JOKER_MIRRORED = 8;
  static #SWAP_CARD_WITH_JOKER_OPPONENT = 8;
  static #END_TURN = 9;
  static #END_TURN_MIRRORED = 9;
  static #END_TURN_OPPONENT = 9;

  #states;

  constructor() {
    debugLog("Instantiated a State.");
    this.#states = {};
  }

  getPossibleStates() {
    // TO DO: Using the map, return an array of the possible states
    // to which the game can transition from the current one
    return [];
  }

  doesAllowInput(state) {
    // TO DO: Create a list of states that allow user interaction
    // and simply check if the passed one is there or not 
    return true;
  }
}

module.exports = {
  State: State
}