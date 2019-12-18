import axios from 'axios';
import qs from 'query-string';

export default {
    getFlightManifest(id, cb, onError) {
        return axios.get(`/flightlog/api/manifest/${id}/`)
    },
    setManifsetStatus(data, cb) {
        axios.post(`/flightlog/api/manifest_status/`, data)
            .then(response => {
                cb(response.data);
            });
    },
    pushVORConfirmation(data, cb, onError) {
        axios.post("/flightlog/api/vor_check/", data)
            .then(response => {
                cb(response.data);
            })
            .catch(function (error) {
                onError(error.response.data);
            });
    },
    getVORConfirmation(id, cb) {
        axios.get(`/flightlog/api/vor_check/${id}/`)
            .then(response => {
                cb(response.data);
            });
    },
    deleteVORConfirmation(id, cb) {
        axios.delete(`/flightlog/api/vor_check/${id}/`)
            .then(response => {
                cb(response);
            });
    },
    pushFireConfirmation(data, cb, onError) {
        axios.post("/flightlog/api/fire_check/", data)
            .then(response => {
                cb(response.data);
            })
            .catch(function (error) {
                onError(error.response.data);
            });
    },
    getFireConfirmation(id, cb) {
        axios.get(`/flightlog/api/fire_check/${id}/`)
            .then(response => {
                cb(response.data);
            });
    },
    deleteFireConfirmation(id, cb) {
        axios.delete(`/flightlog/api/fire_check/${id}/`)
            .then(response => {
                cb(response);
            });
    },
    getManifests(params) {
      return axios.get(`/flightlog/api/manifests/?${qs.stringify(params)}`)
    },
    getManifestLogs(id) {
      return axios.get(`/flightlog/api/?manifest=${id}`)
    }
}
