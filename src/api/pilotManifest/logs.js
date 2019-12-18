import axios from 'axios';
import queryString from 'query-string';
import createTableApi from '../factory/table';

export const logsListApi = createTableApi('/flightlog/api/');
