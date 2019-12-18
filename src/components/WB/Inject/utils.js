import { debounce, identity } from 'lodash';
import { Notification } from 'element-ui';


export const handlePatch = (action, transform, timeout = 300) =>
  debounce(function(value) {
    return this[action](this[transform].call(this, value))
      .catch(() => Notification.error({
        title: 'Error',
        message: 'Something went wrong!',
      }));
  }, timeout);
