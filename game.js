const { app, BrowserWindow } = require("electron")
const crypto = require("crypto");

const { Player, PlayerProxy } = require("./player");
const { State } = require("./state");
const { GUI } = require("./gui");
const { Deck, Card, Constants } = require("./deck");

// TODO: Remove, this is only for debug purposes
let debugHand = [
  new Card(
    Constants.Signs.get(Constants.SIGN_SEVEN),
    Constants.Suits.get(Constants.SUIT_CLUBS),
  ),
  new Card(
    Constants.Signs.get(Constants.SIGN_THREE),
    Constants.Suits.get(Constants.SUIT_SPADES),
  ),
  new Card(
    Constants.Signs.get(Constants.SIGN_FOUR),
    Constants.Suits.get(Constants.SUIT_SPADES),
  ),
  new Card(
    Constants.Signs.get(Constants.SIGN_FIVE),
    Constants.Suits.get(Constants.SUIT_SPADES),
  ),
  new Card(
    Constants.Signs.get(Constants.SIGN_SIX),
    Constants.Suits.get(Constants.SUIT_SPADES),
  ),
  new Card(
    Constants.Signs.get(Constants.SIGN_SEVEN),
    Constants.Suits.get(Constants.SUIT_SPADES),
  ),
  new Card(
    Constants.Signs.get(Constants.SIGN_SEVEN),
    Constants.Suits.get(Constants.SUIT_HEARTS),
  ),
  new Card(
    Constants.Signs.get(Constants.SIGN_SEVEN),
    Constants.Suits.get(Constants.SUIT_DIAMONDS),
  ),
  new Card(
    Constants.Signs.get(Constants.SIGN_EIGHT),
    Constants.Suits.get(Constants.SUIT_DIAMONDS),
  ),
  new Card(
    Constants.Signs.get(Constants.SIGN_NINE),
    Constants.Suits.get(Constants.SUIT_DIAMONDS),
  ),
  new Card(
    Constants.Signs.get(Constants.SIGN_TEN),
    Constants.Suits.get(Constants.SUIT_DIAMONDS),
  ),
  new Card(
    Constants.Signs.get(Constants.SIGN_ACE),
    Constants.Suits.get(Constants.SUIT_CLUBS),
  ),
  new Card(
    Constants.Signs.get(Constants.SIGN_TWO),
    Constants.Suits.get(Constants.SUIT_CLUBS),
  ),
  new Card(
    Constants.Signs.get(Constants.SIGN_THREE),
    Constants.Suits.get(Constants.SUIT_CLUBS),
  ),
];

let debugTopCard = new Card(
  Constants.Signs.get(Constants.SIGN_KING),
  Constants.Suits.get(Constants.SUIT_HEARTS),
);

// TO DO: Make this smarter and prettier
function getCardStyle(topOffset, leftOffset, rotation, zIndex, transformOrigin) {
  return "position: absolute;\
    border: 1px solid black;\
    border-radius: 1vh;\
    top: " + topOffset + "vh;\
    left: " + leftOffset + "vw;\
    width: 15vh;\
    height: 20vh;\
    display: inline-block;\
    background-color: rgba("
      + Math.round(Math.random() * 255) + ", "
      + Math.round(Math.random() * 255) + ", "
      + Math.round(Math.random() * 255) + ", 1.0);\
    transform: rotate3d(0, 0, 1, " + rotation + "deg);\
    transform-origin: " + transformOrigin + ";\
    z-index: " + zIndex + ";";
};


let debugLogMessages = [];

const algorithm = 'aes-256-ctr';
const secretKey = 'R3m1i54verYn1c3g4mE';
const iv = crypto.randomBytes(16);

function debugLog(msg) {
  return;

  setTimeout(function() {
    let output = document.getElementById("debug-log");
    if (!output) {
      output = document.createElement("div");
      output.id = "debug-log";
      output.style.width = "100%";
      output.style.height = "100%";
      output.style.border = "1px solid black";
      output.style.overflowX = "scroll";
      output.style.overflowY = "scroll";
      output.style.fontFamily = "sans-serif";
      output.style.fontSize = "14px";
      output.style.display = "inline-block";
      document.body.appendChild(output);
    }

    let now = new Date();
    let dateString = now.getDate() + "/" + now.getMonth() + "/" + now.getFullYear()
      + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds();
    debugLogMessages.push("[" + dateString + "] " + msg + "\n------------------------\n");
  }, 0);
}

function flushLog() {
  return;

  setTimeout(function() {
    let output = document.getElementById("debug-log");

    if (!output) {
      return;
    }

    let messages = "";
    debugLogMessages.forEach(msg => {
      messages += msg;
    });
    output.innerText += messages;
    //output.scrollTop = output.scrollHeight;
    debugLogMessages = [];
  }, 0);
}

var CardID = -1;

class Game {
  static MIRRORED_MULTIPLAYER = 0;
  static NORMAL_MULTIPLAYER = 1;

  #players;
  #state;
  #inputEvents;
  #gui;
  #deck;

  constructor() {
    debugLog("Instantiated a Game.");
    this.#players = [ new Player("Mishko"), new PlayerProxy() ];
    this.#state = new State();
    this.#inputEvents = [];
    this.#gui = new GUI();
    this.#deck = new Deck(2);
    this.#deck.shuffle();
  }

  #encrypt(text)  {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
  };

  #decrypt(hash) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    return decrpyted.toString();
  };

  #handleKeyEvent(keyEvent) {
    if (keyEvent.eventPhase !== 2) {
      return;
    }
    //debugLog("Handling key event of type '" + keyEvent.type + "' and with ID " + keyEvent.target.id);
  }

  #handleMouseEvent(mouseEvent) {
    //debugLog("Handling mouse event of type '" + mouseEvent.type + "' and with ID " + mouseEvent.target.id);
    if (mouseEvent.type === "pointerup") {
      mouseEvent.target.style.boxShadow = "0 0 0.5vw 0.4vw yellow";
    }
  }

  runLoop() {
    this.#gui.processInputEvents();
    flushLog();
    requestAnimationFrame(this.runLoop.bind(this));
  }

  init(mode) {
    let keyEvents = [ "keydown", "keypress", "keyup" ];
    let keyEventHandlers = [ this.#handleKeyEvent.bind(this) ];
    this.#gui.subscribeForGlobalInputEvents(keyEvents, keyEventHandlers);

    /*let cardRotation = -30;
    let cardTopOffset = 80;
    let cardLeftOffset = 70;
    for(let i = 0; i < 15; ++i) {
      let style = getCardStyle(cardTopOffset, cardLeftOffset + i, cardRotation + i * 4, i, "bottom center");
      let handlers = new Map();
      handlers.set("pointermove", [ this.#handleMouseEvent.bind(this) ]);
      handlers.set("pointerdown", [ this.#handleMouseEvent.bind(this) ]);
      handlers.set("pointerup", [ this.#handleMouseEvent.bind(this) ]);
      let options = new RenderableOptions("div", style, handlers);
      this.#gui.createRenderable(options);

      //if (i !== 0) {
      //  continue;
      //}
      style = getCardStyle(4, 8 + i, 60 + cardRotation - i * 4, i, "top center");
      options.style = style;
      this.#gui.createRenderable(options);
    }*/

    /*let rootId = "global";
    this.#deck.iterate((idx, card) => {
      let style = getCardStyle(40 - idx * 0.01, 80 - idx * 0.01, 0, idx, "top left");
      let handlers = new Map();
      handlers.set("pointermove", [ this.#handleMouseEvent.bind(this) ]);
      handlers.set("pointerdown", [ this.#handleMouseEvent.bind(this) ]);
      handlers.set("pointerup", [ this.#handleMouseEvent.bind(this) ]);
      let inputCategories = [ "cards", "game" ];
      let options = { type: "div", style: style, inputHandlers: handlers, inputCategories: inputCategories };
      let id = this.#gui.createRenderable(options, rootId);

      if (idx !== 107) {
        return;
      }
      CardID = id;
      let animationOptions = {
        keyframes: [{
            top: (40 - idx * 0.01) + "vh",
            left: (80 - idx * 0.01) + "vw",
          },
          {
            top: "80vh",
            left: "70vw",
          }
        ],
        timingOptions: {
          duration: 250,
          easing: "ease-out"
        }};
      let anim = this.#gui.createAnimation(id, animationOptions);
      setTimeout(() => { anim.play(); }, 1000);
    });*/

    let playerCards = [];
    for (let i = 0; i < 14; ++i) {
    //for (let i = 0; i < 2; ++i) {
      let cards = this.#deck.drawMultiple(i === 0 ? 3 : 2);
      if ((i % 2) === 0) {
        //playerCards.push.apply(playerCards, cards);
        //this.#players[i % 2].addCardsToHand(cards);
      }
    }

    playerCards = debugHand;
    this.#players[0].addCardsToHand(playerCards);

    playerCards.sort((a, b) => {
      if (a.suit < b.suit) {
        return -1;
      } else if (a.suit > b.suit) {
        return 1;
      }

      return a.sign <= b.sign ? -1 : 1;
    });
    console.log("Player got cards:");
    let cardsStr = ""
    for(let card in playerCards) {
      if (card >= 1 && playerCards[card - 1].suit !== playerCards[card].suit) {
        cardsStr += "\n";
      }
      cardsStr += " | " + playerCards[card].toString();
    }

    console.log(cardsStr);

    //let topCard = this.#deck.draw();
    let topCard = debugTopCard;
    console.log("Top card is " + topCard.sign + " of " + topCard.suit);
    console.log(topCard.id);
    this.#players[0].canMakeComboWithCard(topCard);
    this.#players[0].addCardToHand(topCard);
    this.#players[0].updatePossibleCombos();

    if (mode === Game.MIRRORED_MULTIPLAYER) {

      //let encrypted = JSON.parse(this.#gui.promptForInput());
      //this.#deck.shuffle(this.#decrypt(encrypted));
      //this.#deck.shuffleTo("Kn-D|A-C|10-C|Q-D|J-N|5-H|6-S|Q-H|A-D|8-C|Q-C|Q-S|8-C|4-C|7-D|7-H|Q-H|Q-D|7-H|2-S|10-H|6-H|8-H|2-S|3-D|3-C|4-C|6-D|10-C|A-H|5-D|3-D|8-C|Q-S|6-H|7-H|Q-C|5-C|10-C|Q-S|K-C|3-H|J-N|Q-D|Kn-C|10-H|5-S|10-D|Q-C|10-D|9-H|6-H|Q-C|Kn-D|K-C|9-H|2-C|A-C|2-D|5-H|3-D|4-D|Q-C|6-C|7-D|Kn-S|10-S|K-C|9-D|4-S|8-H|9-D|A-D|7-H|Kn-D|6-H|10-D|J-N|2-H|3-H|Kn-H|5-H|A-S|10-S|Kn-C|10-D|2-H|7-C|3-S|5-C|7-D|4-H|3-S|6-C|Q-D|J-N|6-H|A-S|4-C|4-D|9-C|9-S|8-H|10-H|5-S|2-S|A-D");
      //this.#deck.print();
      //debugLog(this.#deck.drawMultipleFrom(5, 3));
      //this.#deck.split(12);
      //debugLog(this.#deck.size());
      //debugLog(this.#deck.draw());


      //this.#deck.print();
      //let dialogOptions = {
      //  type: "info",
      //  buttons: [ "Yes", "No", "Cancel" ],
      //  defaultId: 0,
      //  title: "Info",
      //  message: "Do you want to save before exiting?",
      //  cancelId: 2,
      //};
      //this.#gui.displayDialog(dialogOptions);

      this.#gui.disableInput("game");
      setTimeout(() => {
        this.#gui.enableInput("game");

        //this.#gui.updateStyle(CardID, "left: 3vw")
      }, 5000);
    } else if(mode === Game.NORMAL_MULTIPLAYER) {
      //TO BE IMPLEMENTED
    }
  }
}

let game = new Game();
game.init(Game.MIRRORED_MULTIPLAYER);
game.runLoop();