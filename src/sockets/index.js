import curry from 'lodash/curry';
import trimStart from 'lodash/trimStart';
import trimEnd from 'lodash/trimEnd';
import isArray from 'lodash/isArray';

import createSock from './connector';

export default createSock;
export { connectMixin } from './connectMixin';

/**
 * Vue plugin, connects remote VMs with socket broker.
 *
 * @param sock: Sockets broker instance
 * @example
 * Vue.use(connectWith(sock));
 *
 * // in VM:
 * this.$sock.subscribe(...);
 * this.$sock.send(...);
 * this.$sock.unsubscribe(...);
 */
export const connectWith = sock => (Vue) => {
  Vue.prototype.$sock = sock;
};

/**
 * Connects remote Vuex stores with socket broker.
 * Allows to broadcast actions and mutations across channels.
 * Please use connectMixin and dispatch helpers instead of
 * direct 'sock' module access.
 *
 * @param sock: Sockets broker instance
 * @example
 * new Vuex.Store({
 *  plugins: [connectStore(sock)],
 * });
 */
export const connectStore = sock => (store) => {
  const ACTION_TYPE = 'vuex:action';
  const MUTATION_TYPE = 'vuex:mutation';

  const dispatchIncomingMessage = (message) => {
    switch (message.type) {
      case ACTION_TYPE:
        return store.dispatch(message.action, message.payload);
      case MUTATION_TYPE:
        return store.commit(message.mutation, message.payload);
      default:
        return Promise.reject();
    }
  };

  const constructMessage = (channel, payload) => ({
    type: 'dispatch',
    channel,
    payload,
  });

  const SUBSCRIBE_TO = 'SUBSCRIBE_TO';
  const UNSUBSCRIBE_FROM = 'UNSUBSCRIBE_FROM';
  const SET_STATUS = 'SET_STATUS';

  const STATUS_CONNECTING = 0;
  const STATUS_OPEN = 1;
  const STATUS_CLOSED = 2;

  const setStatus = store.commit.bind(store, `sock/${SET_STATUS}`);
  sock.addListener('beforeOpen', () => setStatus(STATUS_CONNECTING));
  sock.addListener('open', () => setStatus(STATUS_OPEN));
  sock.addListener('close', () => setStatus(STATUS_CLOSED));


  store.registerModule('sock', {
    namespaced: true,

    state: {
      connectionStatus: STATUS_CONNECTING,
      channels: new Map(),
    },

    getters: {
      isConnecting: state => (state.connectionStatus === STATUS_CONNECTING),
      isOpen: state => (state.connectionStatus === STATUS_OPEN),
      isClosed: state => (state.connectionStatus === STATUS_CLOSED),
    },

    actions: {
      subscribe({ state: { channels }, commit }, channel) {
        if (!channels.has(channel)) {
          sock.subscribe(channel, dispatchIncomingMessage);
        }
        commit(SUBSCRIBE_TO, channel);
      },
      unsubscribe({ state: { channels }, commit }, channel) {
        commit(UNSUBSCRIBE_FROM, channel);

        if (!channels.has(channel)) {
          sock.unsubscribe(channel, dispatchIncomingMessage);
        }
      },

      broadcastAction(_ctx, { channel, action, payload }) {
        const message = constructMessage(channel, { type: ACTION_TYPE, action, payload });
        sock.send(message);
      },

      broadcastMutation(_ctx, { channel, mutation, payload }) {
        const message = constructMessage(channel, { type: MUTATION_TYPE, mutation, payload });
        sock.send(message);
      },
    },

    mutations: {
      [SUBSCRIBE_TO]({ channels }, channel) {
        channels.set(channel, (channels.get(channel) || 0) + 1);
      },
      [UNSUBSCRIBE_FROM]({ channels }, channel) {
        const subscriptionCount = (channels.get(channel) || 0) - 1;
        channels.set(channel, subscriptionCount);

        if (subscriptionCount <= 0) {
          channels.delete(channel);
        }
      },
      [SET_STATUS](state, status) {
        state.connectionStatus = status;
      },
    },
  });

  store.dispatch('sock/subscribe', 'broadcast');
};

function namespacedType(namespace, type) {
  const prepNs = (isArray(namespace)
    ? namespace.join('/')
    : namespace);
  const formattedNs = trimEnd(prepNs, '/');
  return trimStart(`${formattedNs}/${type}`, '/');
}

/**
 * @typedef {Function} Broadcaster
 * @param   {String}   channel - Channel name.
 * @param   {String}   type - Action/Mutation type.
 * @param   {*}        payload - Action/Mutation payload, must be JSON-serializable.
 */

/**
 * @typedef  {Object}      BoundBroadcasters
 * @property {Broadcaster} broadcastAction - Bound action broadcaster.
 * @property {Broadcaster} broadcastMutation - Bound mutation broadcaster.
 */

/**
 * Creates broadcast helpers, which are bound to specific Vuex {namespace}
 *
 * @param  {String} namespace Vuex namespace
 * @return {BoundBroadcasters}
 */
export const namespacedBroadcasters = (namespace = '') => ({
  broadcastAction: curry(
    (channel, type, payload) => ({
      type: 'sock/broadcastAction',
      action: namespacedType(namespace, type),
      channel,
      payload,
    }),
    2,
  ),
  broadcastMutation: curry(
    (channel, type, payload) => ({
      type: 'sock/broadcastMutation',
      mutation: namespacedType(namespace, type),
      channel,
      payload,
    }),
    2,
  ),
});


export const {
  /**
   * broadcastAction - Nice helper for broadcasting remote actions.
   * Supports currying up to two arguments.
   *
   * @type {Broadcaster}
   * @example
   *
   * dispatch(broadcastAction(channel, actionType, data), { root: true });
   *
   * // curried example, useful inside components:
   * const wbAction = broadcastAction('wb');
   * this.$store.dispatch(wbAction(actionType, data));
   */
  broadcastAction,

  /**
   * broadcastMutation - Nice helper for broadcasting remote mutations.
   * Supports currying up to two arguments.
   *
   * @type {Broadcaster}
   * @example
   *
   * dispatch(broadcastMutation(channel, mutationType, data), { root: true });
   *
   * // curried example:
   * const wbMutation = broadcastMutation('wb');
   * this.$store.dispatch(wbMutation(mutationType, data));
   */
  broadcastMutation,
} = namespacedBroadcasters();

