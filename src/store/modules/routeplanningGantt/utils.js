import compareDesc from 'date-fns/compareDesc';
import { isObject, isString } from 'lodash';

export const getDeparture = flight => flight.actual_datetime_out
  || flight.estimated_departure
  || flight.scheduled_departure;

export const getArrival = flight => flight.actual_datetime_in
  || flight.estimated_arrival
  || flight.scheduled_arrival;

export const getOrigin = flight => flight.actual_origin || flight.origin;

export const getDestination = flight => flight.actual_destination || flight.destination;

export const getPIC = flight => flight.actual_pic || flight.scheduled_pic;

export const getSIC = flight => flight.actual_sic || flight.scheduled_sic;

export const pilotName = (pilot) => {
  if (isString(pilot)) {
    return pilot;
  } else if (isObject(pilot)) {
    return `${pilot.first_name} ${pilot.last_name}`;
  }

  return '';
};

export const isValid = (flight1, flight2) => {
  return (getDestination(flight1).id === getOrigin(flight2).id)
    && (compareDesc(
      getArrival(flight1),
      getDeparture(flight2),
    ) === 1);
};

export const getConflictingFlightIds = flights => flights.reduce((acc, flight, i) => {
  if (i === 0) {
    return acc;
  }

  const previousFlight = flights[i - 1];

  if (!isValid(previousFlight, flight)) {
    acc.push(flight.id);
  }

  return acc;
}, []);

export const filterBySearchQuery = (flights, query) => flights.filter((flight) => {
  if (!query.length) return true;

  const searchProps = [
    pilotName(getPIC(flight)),
    pilotName(getSIC(flight)),
    flight.flight_number,
  ].join(' ');
  return searchProps.toUpperCase().indexOf(query.toUpperCase()) > -1;
});
