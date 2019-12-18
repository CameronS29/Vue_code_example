import { isFunction, isEqual } from 'lodash';
import tracker from './tracker';


function EventDispatcher(el) {
  const isNative = el instanceof HTMLElement;
  return {
    on: isNative ? el.addEventListener.bind(el) : el.$on.bind(el),
    off: isNative ? el.removeEventListener.bind(el) : el.$off.bind(el),
  };
}

export class TrackRegistry {
  static getRegistry(el) {
    if (el.$tracking_registry === undefined) {
      const registry = new TrackRegistry();
      registry.bind(el);
    }
    return el.$tracking_registry;
  }

  constructor() {
    this.tracksDispatch = new Map();
  }

  on(event, handler) {
    if (this.tracksDispatch.has(event)) {
      const oldHandler = this.tracksDispatch.get(event);
      this.binder.off(event, oldHandler);
    }

    this.tracksDispatch.set(event, handler);
    this.binder.on(event, handler);
  }

  off(event) {
    const handler = this.tracksDispatch.get(event);
    if (handler !== undefined) {
      this.tracksDispatch.delete(event);
      this.binder.off(event, handler);
    }

    if (this.tracksDispatch.size === 0) {
      delete this.el.$tracking_registry;
      delete this.el;
    }
  }

  bind(el) {
    this.el = el;
    this.binder = EventDispatcher(el);
    el.$tracking_registry = this;

    this.tracksDispatch.forEach((handler, event) => this.binder.on(event, handler));
  }
}


const getEventType = (type, modifiers) => ([
  type,
  ...Object.keys(modifiers).sort(),
].join('.'));

const getTracking = (type, event, el) => (...args) => {
  if (isFunction(event)) {
    const record = event.apply(el, args);
    return tracker.record({ type, ...record });
  }

  if (event === undefined) {
    if (args.length === 1) { args = args[0]; }
    event = args;
  }
  return tracker.record({ type, event });
};

export const trackVue = (Vue) => {
  Vue.prototype.$tracker = tracker;

  Vue.directive('track', {
    bind(_el, { value, arg, modifiers }, vNode) {
      const el = vNode.componentInstance || _el;

      const registry = TrackRegistry.getRegistry(el);
      const type = getEventType(arg, modifiers);
      registry.on(arg, getTracking(type, value, el));
    },

    update(_el, { value, oldValue, arg, modifiers }, vNode) {
      if (isEqual(value, oldValue)) { return; }
      const el = vNode.componentInstance || _el;

      const registry = TrackRegistry.getRegistry(el);
      const type = getEventType(arg, modifiers);

      registry.on(arg, getTracking(type, value, el));
    },

    unbind(_el, { arg }, vNode) {
      const registry = TrackRegistry.getRegistry(vNode.componentInstance || _el);
      registry.off(arg);
    },
  });
};
