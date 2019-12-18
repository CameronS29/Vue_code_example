import isFunction from 'lodash/isFunction';


const getChannelName = (vm, channel) => (
  isFunction(channel)
    ? channel(vm)
    : channel
);

const subscribeStore = (vm, channel) => {
  const channelName = getChannelName(vm, channel);
  if (channelName) {
    vm.$store.dispatch('sock/subscribe', getChannelName(vm, channel));
  }
};

const unsubscribeStore = (vm, channel) => {
  const channelName = getChannelName(vm, channel);
  if (channelName) {
    vm.$store.dispatch('sock/unsubscribe', channelName);
  }
};

const updateSubscription = (vm, newChan, oldChan) => {
  unsubscribeStore(vm, oldChan);
  subscribeStore(vm, newChan);
};


/**
 * Controls channel subscription during component lifecycle.
 *
 * @param channel {String, Function} Channel name. Can be a string,
 * or function that accepts VM instance as argument and returns string.
 * If second, {connectMixin} will reactively watch on channel name changes.
 */
export const connectMixin = channel => ({
  created() {
    this.$watch(
      getChannelName.bind(null, this, channel),
      updateSubscription.bind(null, this),
      { immediate: true },
    );
  },

  destroyed() {
    unsubscribeStore(this, channel);
  },
});
