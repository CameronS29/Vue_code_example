import Dexie from 'dexie';
import { map, filter } from 'lodash';
import { RESTTracksCollector } from './collectors';


const db = new Dexie('TrackedEntries');
db.version(1).stores({ records: '++id,type,event,at' });
db.open();


export const createTracker = (collector = new RESTTracksCollector()) => {
  const pushRecord = async ({ id, ...entry }) => {
    if (!navigator.onLine) {
      return undefined;
    }

    try {
      await collector.collect(entry);
      return id;
    } catch (e) {
      console.error(e);
    }
    return undefined;
  };

  const flush = async () => {
    try {
      const records = await db.records.toArray();
      const toDelete = await Promise.all(map(records, pushRecord));
      await db.records.bulkDelete(filter(toDelete));
    } catch (e) {
      console.warn(e);
    }
  };

  const record = async ({ type, at, event = null }) => {
    try {
      await db.records.add({ type, event, at: (at || new Date()) });
    } catch (e) {
      console.error(e);
    }
    return flush();
  };

  window.addEventListener('online', flush);

  return { record, flush };
};

export default createTracker();
