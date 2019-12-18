import axios from 'axios';
import {response} from '../../utils/api';


const flightLogApi = axios.create({
  baseURL: '/flightlog/api',
});

export default {
  getManifest: id => response(flightLogApi.get(`/manifest/${id}/`)),
  deleteManifest: id => response(flightLogApi.delete(`/manifest/${id}/`)),
  deleteLog: id => response(flightLogApi.delete(`/flightlog/${id}/`)),
  setManifestStatus: (id, data) => response(
    flightLogApi.post('/manifest_status/', {id, ...data}),
  ),
  picConfirm: (data) => response(
    flightLogApi.post('/confirmation/', data)
  )
}
