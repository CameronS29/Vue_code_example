import axios from 'axios';

export default {
  listActiveJobs(cb) {
    axios.get(`/api/job/active/`)
      .then(response => {
        cb(response.data);
      });
  },
  getJobsResults(uuids, cb) {
    let arg = uuids.join(',');
    return axios.get(`/api/jobs/?uuids=${arg}`).then(({data}) => data);
  },
}
