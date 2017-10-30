const Client = {
  _ws: null,

  /** @type {{[key: string]: Function[]}} */
  _listeners: {},

  init() {
    this._ws = new WebSocket('ws://localhost:8080');
    this._ws.onmessage = (msg) => {
      let parsed = JSON.parse(msg.data);

      if (parsed.type) {
        let handlers = [];

        for (let key in Client._listeners) {
          if (key == parsed.type) {
            handlers = Client._listeners[key];
            break;
          }
        }

        if (handlers.length == 0) {
          console.warn(`No handlers for message type "${parsed.type}"`);
          return;
        }

        for (let handler of handlers) {
          handler(parsed);
        }
      }
    };
  },

  on(key, fn) {
    let index = -1;

    if (!this._listeners[key]) {
      this._listeners[key] = [fn];
      index = 0;
    } else {
      index = this._listeners[key].push(fn) - 1;
    }

    return {
      remove: (function remove(key, index) {
        Client._listeners[key].splice(index, 1);
      }).bind(key, index)
    };
  },

  send(type, data) {
    this._ws.send(JSON.stringify({
      type,
      ...data
    }));
  },

  joinArena(arenaId) {
    this.send('join arena', { arenaId });
  }
};

export default Client;