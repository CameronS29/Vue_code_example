import axios from 'axios';
import { DateTime } from 'luxon';
import APIs from '../../api/axiosAPIs';

import RetryAndAskToMerge from './restoreScenarions/RetryAndAskToMerge.vue';
import apiCallWrapper from './apiCallWrapper';
import { getByKeys, deleteRecord } from './db';
import { sortBy } from 'lodash';

export const RetryAndAskToMergeScenario = RetryAndAskToMerge;
export const response = apiCallWrapper;

export const retryRequests = async (keys, reduce, force) => {
  const records = await getByKeys(keys);
  const reducedRecords = reduce ? reduce(records) : records;


  const responses = reducedRecords.map(record => new Promise(async (resolve, reject) => {
    const api = record.api ? APIs[record.api] : axios;
    const additionalHeaders = !force ?
      { 'Last-Known-Update': DateTime.fromMillis(record.timestamp).toISO() }
      : {};

    try {
      const response = await api.request({
        ...record.options,
        headers: {
          ...record.options.headers,
          ...additionalHeaders
        }
      });

      resolve({ response, record });
    } catch (e) {
      reject(e);
    }

  }));

  try {
    const res = await Promise.all(responses);
    records.forEach(record => deleteRecord(record.id));

    return res;
  } catch (e) {
    throw e;
  }
};

export const mergeFieldsReduce = (responses) => {
  const response = sortBy(responses, 'timestamp').reduce((acc, response) => {
    return {
      ...acc,
      state: response.state,
      timestamp: response.timestamp,
      options: { ...acc.options, data: { ...acc.options.data, ...response.options.data } }
    };
  }, responses[0]);

  return [response];
};
