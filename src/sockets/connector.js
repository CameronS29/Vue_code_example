import EventEmitter from 'eventemitter3';

const STATE_OPEN = 1;
const DEFAULT_TIMEOUT = 1000;
const BROADCAST_CHANNEL = 'broadcast';


export default (url) => {
  let sock = null;
  const emitter = new EventEmitter();

  let reconnectTimer = -1;
  const channels = new Map();


  const onReady = async () => {
    if (sock === null) {
      throw new Error('Connection has not been initialized');
    }

    if (sock.readyState === STATE_OPEN) {
      return Promise.resolve();
    } else if (sock.readyState < STATE_OPEN) {
      return new Promise((resolve) => {
        const onOpen = () => {
          resolve();
          sock.removeEventListener('open', onOpen);
        };
        sock.addEventListener('open', onOpen);
      });
    }

    throw new Error('Attempt to send data via closed connection');
  };

  const internalSend = async (data) => {
    try {
      await onReady();
      sock.send(JSON.stringify(data));
    } catch (e) {
      console.error(e);
      console.warn('Rejected message:', data);
      throw e;
    }
  };

  const dispatchData = (event) => {
    const { channel, payload } = JSON.parse(event.data);

    if (!channels.has(channel)) {
      console.warn(`No listeners subscribed to ${channel}, but event occurred`);
      return;
    }

    channels.get(channel).forEach((listener) => {
      try {
        listener(payload, internalSend);
      } catch (e) {
        console.warn(`Error occurred in ${listener}`, e);
      }
    });
  };

  const joinChannel = channel => internalSend({ type: 'join', channel });
  const leaveChannel = channel => internalSend({ type: 'leave', channel });

  /**
   * Subscribes {listener} to {channel}
   * if channel is not specified, subscribes listener to {BROADCAST_CHANNEL}.
   *
   * @param channel {String, undefined} channel to subscribe
   * @param listener {Function} function that accepts incoming messages.
   */
  const addListener = async (channel, listener) => {
    if (typeof channel === 'function') {
      return addListener(BROADCAST_CHANNEL, channel);
    }
    if (typeof listener !== 'function') {
      throw new Error('listener must be a function');
    }

    // join channel if the first listener will be added
    if (!channels.has(channel)) {
      channels.set(channel, new Set());

      if (channel !== BROADCAST_CHANNEL) {
        console.debug(`joining channel ${channel}`);
        await joinChannel(channel);
      }
    }

    return channels.get(channel).add(listener);
  };

  /**
   * Unsubscribes {listener} from {channel}.
   * If no listener is specified, removes all listeners from channel.
   * If no channel specified, uses {BROADCAST_CHANNEL} as default.
   *
   * @param channel {String, undefined} Channel name
   * @param listener {Function, undefined} Function to remove.
   */
  const removeListener = async (channel, listener) => {
    if (channel === undefined || typeof channel === 'function') {
      return removeListener(BROADCAST_CHANNEL, channel);
    }

    const chan = channels.get(channel);
    if (chan === undefined) {
      return console.warn('attempt to unsubscribe from unknown channel');
    }

    chan.delete(listener);

    // leave channel if no listeners left
    if (chan.size === 0 || listener === undefined) {
      channels.delete(channel);

      if (channel !== BROADCAST_CHANNEL) {
        console.debug(`leaving channel ${channel}`);
        return leaveChannel(channel);
      }
    }
    return Promise.resolve();
  };

  function clearTimer() {
    clearTimeout(reconnectTimer);
    reconnectTimer = -1;
  }

  function newConnection(timeout = DEFAULT_TIMEOUT) {
    clearTimer();

    // remove all old event handlers to ease GC
    if (sock !== null) {
      sock.close();
      sock.onmessage = null;
      sock.onclose = null;
    }

    sock = new WebSocket(url);

    sock.onmessage = dispatchData;

    sock.onclose = () => {
      console.debug(`Connection to ${url} closed, ts: ${new Date()}`);
      emitter.emit('close');

      // Exponential reconnection, in case of server unavailability
      if (navigator.onLine) {
        console.debug(`reconnecting in ${timeout}ms`);
        reconnectTimer = setTimeout(
          () => newConnection(Math.min(timeout * 2, 64000)),
          timeout,
        );
      }
    };

    sock.onopen = async () => {
      clearTimer();
      timeout = DEFAULT_TIMEOUT;
      console.debug(`Connection to ${url} established, ts: ${new Date()}`);

      emitter.emit('beforeOpen');

      // reconnect to all subscribed channels
      const chanNames = Array.from(channels.keys())
        .filter(name => (name !== BROADCAST_CHANNEL));
      await Promise.all(chanNames.map(joinChannel));

      emitter.emit('open');
    };
  }

  // try to reconnect immediately after user goes online
  window.addEventListener('online', newConnection);
  window.addEventListener('offline', () => sock.close());
  newConnection();

  return {
    subscribe: addListener,
    unsubscribe: removeListener,
    send: internalSend,

    // event attributes
    addListener: emitter.addListener.bind(emitter),
    removeListener: emitter.removeListener.bind(emitter),
  };
};
