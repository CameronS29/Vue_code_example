import { find, findKey, flatten, values } from 'lodash';

let elements = [];
let scrollPositions = {};
let unlocked = null;

const handleMouseEnter = function (e) {
  unlocked = e.currentTarget;
};

const handleTouchStart = function (e) {
  unlocked = e.currentTarget;
};

const updateScroll = record => () => {
  record.el.scroll({
    left: record.x ? scrollPositions[record.id].x : undefined,
    top: record.y ? scrollPositions[record.id].y : undefined,
    behavior: 'instant',
  });
};

const handleScroll = function (e) {
  const el = e.currentTarget;

  if (el === unlocked) {
    const ids = elements.filter(record => record.el === el).map(record => record.id);
    const sameIdRecords = elements.filter(record => (ids.indexOf(record.id) > -1) && record.el !== el);

    sameIdRecords.forEach((record) => {
      const id = record.id;

      if (record.x) {
        scrollPositions[id].x = unlocked.scrollLeft;
      }
      if (record.y) {
        scrollPositions[id].y = unlocked.scrollTop;
      }

      window.requestAnimationFrame(updateScroll(record));
    });
  }
};


export default (Vue) => {
  Vue.directive('scroll-sync', {
    inserted(el, { value }) {
      if (!value) return;

      const { id, x = true, y = true } = value;
      const record = { el, id, x, y };
      elements.push(record);

      scrollPositions[id] = {
        x: 0,
        y: 0,
      };

      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('touchstart', handleTouchStart);
      el.addEventListener('scroll', handleScroll);
    },

    unbind(el) {
      elements = elements.filter(record => record.el !== el);

      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('scroll', handleScroll);
    },
  });
};
