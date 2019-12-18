import axios from 'axios';
import {SWAP_REMOVAL} from "../store/modules/aircraft/consts";

export default {
  pushEngineSwap(data, cb) {
    let baseUrl = `/dispatch/api/engine/swap/`;
    if (data.swap_type === SWAP_REMOVAL) {
      baseUrl += 'removal/';
    }
    if (data.id) {
      return axios.put(baseUrl + `${data.id}/`, data)
        .then(({data}) => data);
    } else {
      return axios.post(baseUrl, data)
        .then(({data}) => data);
    }
  },
  recalcEngineSwap(data, cb) {
    axios.post(`/dispatch/api/engine/swap/${data.id}/recalc/`)
      .then(response => {
        cb(response.data);
      })
  },
  listEngineSwaps(aircraft, cb) {
    return axios.get(`/dispatch/api/engine/swap/?aircraft=${aircraft}`)
      .then(({data}) => data)
  },
  getEngineSwap(id, cb) {
    return axios.get(`/dispatch/api/engine/swap/${id}/`)
      .then(({data}) => data)
  },
  removeEngineSwap(id) {
    return axios.delete(`/dispatch/api/engine/swap/${id}/`);
  },
}
