import tracker from './tracker';

export const trackAction = ({ leading = true, trailing = false } = {}) =>
  function (target, property, descriptor) {
    const original = descriptor.value;

    descriptor.value = async function (...args) {
      if (leading) {
        const event = {
          action: property,
          arguments: args[1],
          leading: true,
        };

        // noinspection JSIgnoredPromiseFromCall
        tracker.record({ type: 'action', event });
      }

      const actionPromise = original.apply(this, args);
      if (!trailing) {
        return actionPromise;
      }

      const result = await actionPromise;
      const event = {
        action: property,
        arguments: args[1],
        trailing: true,
        result,
      };

      // noinspection JSIgnoredPromiseFromCall
      tracker.record({ type: 'action', event });
      return result;
    };
  };


export const trackMutation = function (target, property, descriptor) {
  const original = descriptor.value;

  descriptor.value = function (...args) {
    const event = { mutation: property, arguments: args[1] };

    // noinspection JSIgnoredPromiseFromCall
    tracker.record({ type: 'mutation', event });

    return original.apply(this, args);
  };
};
