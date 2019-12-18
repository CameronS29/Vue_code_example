import some from 'lodash/some';
import values from 'lodash/values';
import omit from 'lodash/omit';


export const persistentFields = ['id', 'seat_number', 'wb_log'];

export function passengerFilled(passenger) {
  return some(
    values(omit(passenger, persistentFields)),
    Boolean,
  );
}
