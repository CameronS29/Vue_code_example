import axios from 'axios';
import { DateTime } from 'luxon';
import APIs from '../../api/axiosAPIs';
import { store } from '../../app';

export default async ({ options, api, key, state }) => {
  try {
    const res = await (APIs[api] || axios).request(options);
    return res.data;
  } catch (e) {
    /**
     * store only NETWORK_ERROR
     */
    if (!e.response) {
      await store.dispatch('offline/addRecord', {
        options,
        api,
        key,
        state,
        timestamp: DateTime.local().toUTC().ts,
      });
    } else {
      throw {response: e.response};
    }
  }
}
