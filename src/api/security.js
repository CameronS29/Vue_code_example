import axios from 'axios';
import qs from 'query-string';
import { response } from '../utils/api';
import createTableApi from './factory/table';
import APIs from './axiosAPIs';

const { securityApi} = APIs;

export default {
  getOptions: () => response(securityApi.get("/options/")),
  saveForm: (data) => response(securityApi.post("/", data)),
  getItem: id => response(securityApi.get(`/${id}/`)),
  deleteItem: id => response(securityApi.delete(`/${id}/`)),
  startDownload: params => response(securityApi.post('/csv_download/', params)),
  getDownloadStatus: task_id => response(securityApi.get(`/csv_download/?task_id=${task_id}`)),

};

export const securityListApi = createTableApi('/security_form/api/');
