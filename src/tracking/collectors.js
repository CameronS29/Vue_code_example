import axios from 'axios';
import qs from 'query-string';


export class RESTTracksCollector {
  constructor() {
    this.api = axios.create({
      baseURL: '/tracking',
      paramsSerializer: qs.stringify,
    });
  }

  async collect(record) {
    return this.api.post('/track/', record);
  }
}


export class SocketTracksCollector {
  constructor(transport) {
    this.transport = transport;
  }

  async collect(record) {
    return this.transport.send({ type: 'track', record });
  }
}
