import axios from "axios/index";
import qs from "query-string";

export default {
  manifestApi: axios.create({
    baseURL: '/flightlog/api/pilot/manifests',
    paramsSerializer: params => qs.stringify(params)
  }),
  flightlogApi: axios.create({
    baseURL: '/flightlog/api/',
    paramsSerializer: params => qs.stringify(params)
  }),
  dispatchApi: axios.create({
    baseURL: '/dispatch/api',
    paramsSerializer: params => qs.stringify(params)
  }),
  securityApi: axios.create({
    baseURL: '/security_form/api/',
    paramsSerializer: params => qs.stringify(params)
  })
};
