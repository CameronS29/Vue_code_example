import curry from 'lodash/curry';
import map from 'lodash/map';
import zipObject from 'lodash/zipObject';
import {DateTime} from "luxon";

const DATE_FORMAT = "MM/DD/YYYY";
const DATETIME_FORMAT = "YYYY-MM-DDTHH:mm:ss";
const LUXON_DATE_FORMAT = "MM/dd/yyyy";

function generateGetter(getter, mutation, field, setProcessor, getProcessor) {
  return {
    get() {
      let value = this.$store.getters[getter][field];
      if (getProcessor && value) {
        return getProcessor.call(this, value);
      }
      return value;
    },
    set(value) {
      let payload = {};
      if (setProcessor) {
        value = setProcessor.call(this, value);
      }
      payload[field] = value;
      this.$store.commit(mutation, payload);
    },
  }
}

export const mapFormFields = curry(
  (getter, mutation, fieldList, setProcessor, getProcessor) => zipObject(
    fieldList,
    map(fieldList,field => (
      generateGetter(getter, mutation, field, setProcessor, getProcessor)
    )),
  ), 3,
);


export const mapFormDateField = (getter, mutation, fields) => mapFormFields(
  getter,
  mutation,
  fields,
  value => value,
  value => value,
);

export const mapFormDateTimeField = (getter, mutation, fields) => mapFormFields(
  getter,
  mutation,
  fields,
  (value) => moment.utc(value, DATETIME_FORMAT).format(),
  (value) => moment.utc(value).format(DATETIME_FORMAT),
);

export const mapFormFloatField = (getter, mutation, fields) => mapFormFields(getter, mutation, fields, parseFloat);
export const mapFormIntField = (getter, mutation, fields) => mapFormFields(getter, mutation, fields, parseInt);
export const mapFormTextField = (getter, mutation, fields) => mapFormFields(getter, mutation, fields);
export const mapFormBooleanField = (getter, mutation, fields) => mapFormFields(getter, mutation, fields);
