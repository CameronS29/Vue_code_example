import Dexie from "dexie/dist/dexie";

const db = new Dexie("StoredAPICalls");
db.version(1).stores({ records: "++id,key" });

export default db;
export const addRecord = props => db.records.add(props);
export const deleteRecord = id => db.records.where({ id }).delete();
export const deleteRecordsByKeys = keys => db.records.where('key').anyOf(keys).delete();
export const getByKeys = keys => db.records.where('key').anyOf(keys).toArray();
export const getList = () => db.records.toArray();
