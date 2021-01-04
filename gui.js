const { ipcRenderer, MessageBoxSyncOptions } = require("electron");


let objectCounter = 0;

/** @class */
class GUI {
  /** @member {Map<string, Map<string, Array<Function>>>} */
  #subscribers;
  /** @member {Array<Event>} */
  #inputEvents;
  /** @member {Map<string, Element>} */
  #renderables;
  /** @member {Array<string>} */
  #disabledInputCategories;

  /**
   * Creates a GUI object and initializes all the internal properties.
   */
  constructor(window) {
    this.#subscribers = new Map();
    this.#inputEvents = [];
    this.#renderables = new Map();
    this.#disabledInputCategories = [];

    document.body.id = "global";
    document.body.style = "width: 100%; height: 100%;";
    document.body.style.backgroundColor = "green";
    document.body.style.overflow = "hidden";
    this.#renderables.set("global", document.body);
  }

  /**
   * Creates an Animation object with the given `params` and attaches it to the element with
   * the given `id`.
   * @param {string} id The ID of the object to attach the animation to.
   * @param {Object} params The parameters for the animation. This should include two
   * properties - an array of keyframes and an object with timing options (check
   * https://developer.mozilla.org/en-US/docs/Web/API/Element/animate for more info).
   * @param {Object} callbacks Callbacks to be called upon certain animation
   * events. These are the supported ones:
   * - onfinish
   * - oncancel
   * - onremove
   * @returns {Animation} The created animation.
   */
  createAnimation(id, params, callbacks) {
    callbacks = callbacks || {};

    let element = this.#renderables.get(id);

    let anim = element.animate(params.keyframes, params.timingOptions);
    anim.pause();
    anim.currentTime = 0;
    anim.onfinish = this.#onAnimationFinish.bind(this, anim, element, params,
      callbacks.onfinish !== undefined ? callbacks.onfinish : null);
    anim.oncancel = this.#onAnimationCancel.bind(this, anim, element, params,
      callbacks.oncancel !== undefined ? callbacks.oncancel : null);
    anim.onremove = this.#onAnimationRemove.bind(this, anim, element, params,
      callbacks.onremove !== undefined ? callbacks.onremove : null);

    return anim;
  }

  /**
   * Creates a DOM element and attaches it to the document body.
   * @param {Object} options Various options describing how the DOM element
   * should look and behave when interacted with, more specifically:
   * - type (a string specifying the element's type)
   * - style (a string specifying the element's CSS style)
   * - inputHandlers (a Map<string, Array<Function>> where the key is the
   * event type and the array of functions are handlers to be called for that event)
   * - inputCategories (a Arra<string> specifying which input categories the
   * element is part of; can be used to toggle input for specific categories)
   * @param {Element} parentId The ID of the DOM element to which this newly
   * created one should be appended. If omitted or `null`, the newly created DOM
   * element will be attached to the document body.
   * @returns {string} The ID of the renderable DOM element.
   */
  createRenderable(options, parentId) {
    options.inputHandlers = options.inputHandlers || new Map();
    options.inputCategories = options.inputCategories || [];

    parentId = parentId || "global";
    let parent = this.#renderables.get(parentId);

    let el = document.createElement(options.type);
    el.style = options.style;
    el.id = "renderable-" + objectCounter++;
    for(let eventType of options.inputHandlers.keys()) {
      el.addEventListener(eventType, this.#queueInputEvent.bind(this), false);
      this.#subscribeForInputEvents(el.id, [ eventType ],options.inputHandlers.get(eventType));
    }
    for(let category of options.inputCategories) {
      el.classList.add(category);
    }
    this.#renderables.set(el.id, el);
    parent.appendChild(el);
    return el.id;
  }

  /**
   * Displays a dialog window with specified buttons and message.
   * @param {MessageBoxSyncOptions} options Options describing how the message
   * window should look - what buttons it has, what title, what message, etc.
   */
  displayDialog(options) {
    ipcRenderer.invoke("display-dialog", options).then(result => {
      console.log("Message box dismissed by clicking button with ID " + result);
    });
  }

  disableInput(category) {
    this.#disabledInputCategories.push(category);
  }

  enableInput(category) {
    let idx = this.#disabledInputCategories.indexOf(category);
    if (idx !== -1) {
      this.#disabledInputCategories.splice(idx, 1);
    }
  }

  /**
   * Calls all the handlers subscribed for events.
   */
  processInputEvents() {
    this.#inputEvents.forEach(evt => {
      let handlersForEvent = this.#subscribers.get(evt.target.id);
      let handlers = handlersForEvent.get(evt.type);
      handlers.forEach(handler => {
        handler(evt);
      });
    });
    this.#inputEvents = [];
  }

  /**
   * Add the array of `callbacks` to be called whenever an event from `eventTypes` is
   * dispatched to the document's body.
   * @param {Array<string>} eventTypes The types of event which you want to subscribe for.
   * @param {Array<Function>} callbacks Functions which you want to be called whenever
   * any of the events in `eventTypes` occurs.
   */
  subscribeForGlobalInputEvents(eventTypes, callbacks) {
    for(let eventType of eventTypes) {
      document.body.addEventListener(eventType, this.#queueInputEvent.bind(this), false);
    }
    this.#subscribeForInputEvents("global", eventTypes, callbacks);
  }

  updateStyle(id, style) {
    let elStyle = this.#renderables.get(id).style;
    let props = style.split(": ").filter((val, idx) => {
      return idx % 2 === 0;
    });
    let propValues
    newStyle.cssText = style;
    console.log(elStyle.constructor);
    console.log(newStyle.constructor);
    for(let prop in props) {
      console.log(prop);
      elStyle[prop] = newStyle[prop];
    }
  }

  #onAnimationFinish(animation, element, params, callback) {
    let lastKeyFrame = params.keyframes[params.keyframes.length - 1];
    for(let prop of Object.getOwnPropertyNames(lastKeyFrame)) {
      element.style[prop] = lastKeyFrame[prop];
    }

    if (callback !== undefined && callback !== null) {
      callback(animation, element, params);
    }
  }

  #onAnimationCancel(animation, element, params, callback) {
    if (callback !== undefined && callback !== null) {
      callback(animation, element, params);
    };
  }

  #onAnimationRemove(animation, element, params, callback) {
    if (callback !== undefined && callback !== null) {
      callback(animation, element, params);
    };
  }

  /**
   * Queues events from attached listeners for processing.
   * @param {Event} e The event to be processed.
   */
  #queueInputEvent(e) {
    for(let clss of e.target.classList) {
      if (this.#disabledInputCategories.includes(clss)) {
        return;
      }
    }

    this.#inputEvents.push(e);
  }

  /**
   * Adds the passed `callbacks` as handlers to be called for each of the `eventTypes`.
   * @param {string} id The ID of the renderable DOM element for which to
   * subscribe for events. This is the same ID assigned to the element when
   * creating it in `createRenderable`.
   * @param {Array<string>} eventTypes The types of event which you want to subscribe for.
   * @param {Array<Function>} callbacks Functions which you want to be called whenever
   * any of the events in `eventTypes` occurs.
   */
  #subscribeForInputEvents(id, eventTypes, callbacks) {
    let handlersForEvent = this.#subscribers.get(id);
    if (handlersForEvent === undefined) {
      handlersForEvent = this.#subscribers.set(id, new Map()).get(id);
    }

    for(let type of eventTypes) {
      let handlers = handlersForEvent.get(type);
      if (handlers !== undefined) {
        handlers.push.apply(handlers, callbacks);
      } else {
        handlersForEvent.set(type, callbacks);
      }
    }
  }

  promptForInput() {
    // TO BE IMPLEMENTED
    return "";
  }
}

module.exports = {
  GUI: GUI,
};