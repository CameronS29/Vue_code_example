import axios from 'axios';
import createTableApi from 'api/factory/table';
import { response } from '../utils/api';

const api = axios.create({ baseURL: '/feedback/api', });
export const tableApi = createTableApi('/feedback/api/records/');

export default {
  async uploadScreenShot(screenshot) {
    const formData = new FormData();
    formData.append('screenshot', screenshot, 'screenshot.png');

    const headers = { 'Content-Type': 'multipart/form-data', };
    return response(api.post('/upload_screenshot/', formData, { headers }));
  },
  async leaveFeedback(payload) {
    return response(api.post('/record/', { ...payload }));
  },
  async getFeedbackRecord(id) {
    return response(api.get(`/record/${id}/`));
  },
};
