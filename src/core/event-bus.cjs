const { EventEmitter } = require('node:events');

class SynchronizerBus extends EventEmitter {
  publish(type, payload = {}) {
    const event = {
      type,
      at: new Date().toISOString(),
      ...payload
    };
    this.emit('event', event);
    this.emit(type, event);
    return event;
  }
}

module.exports = { SynchronizerBus };
