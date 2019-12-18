import axios from 'axios';
import qs from 'query-string';
import {response} from '../utils/api';

export default {
  getFilteredResults: params => response(
    axios.get('/flightlog/api/elog/', {
      params,
      paramsSerializer: params => qs.stringify(params)
    })
  ),
  startDownload: params => response(
    axios.post('/flightlog/elog_download/', params)
  ),
  getDownloadStatus: taskId => response(
    axios.get(`/flightlog/elog_download/?task_id=${taskId}`)
  )
};
