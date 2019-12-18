import { DateTime } from 'luxon';
import { sortBy, filter, omit, map, get, flatten } from 'lodash';

const parseDate = date => DateTime.fromISO(date, { setZone: true });

export const getInvalidFlights = (flights) => {
  return flights.reduce((acc, flight, i) => {
    if (i === 0) {
      return acc;
    }

    const previousFlight = flights[i - 1];
    const arrivalDate = parseDate(previousFlight.scheduled_arrival);
    const departureDate = parseDate(flight.scheduled_departure);

    const isInvalidInterval = (arrivalDate > departureDate);
    const isInvalidRoute = (previousFlight.destination !== flight.origin);

    if (isInvalidInterval || isInvalidRoute) {
      acc.push(flight);
    }

    return acc;
  }, []);
};

export const isValidPairing = flights => !getInvalidFlights(flights).length;
export const sortByDeparture = flights => sortBy(flights, flight => parseDate(flight.scheduled_departure));

export const transformToDateFree = (flight, dayOffset = 0) => {
  const departure = parseDate(flight.scheduled_departure);
  const arrival = parseDate(flight.scheduled_arrival);
  flight = {
    ...flight,
    scheduled_departure: departure
      .set({
        year: 2018,
        month: 1,
        day: 1 + dayOffset,
      })
      .toISO(),
    scheduled_arrival: arrival
      .set({
        year: 2018,
        month: 1,
        day: departure.hour <= arrival.hour ? 1 + dayOffset : 2 + dayOffset,
      })
      .toISO(),
  };
  return flight;
};

export const getFlightListByTemplate = (template) => {
  const flightData = get(template, 'flights', []);
  const flights = get(template, 'distinct_flights', []);

  const todayData = filter(flightData, ({ next_day }) => (next_day !== true));
  const tomorrowData = map(
    filter(flightData, { next_day: true }),
    tpl => omit(tpl, 'next_day'),
  );

  const transform = data => flatten(map(data, tpl => filter(flights, tpl)));
  const todayFlights = transform(todayData);
  const tomorrowFlights = map(
    transform(tomorrowData),
    flight => ({ ...flight, isNextDayFlight: true }),
  );

  return sortByDeparture(todayFlights)
    .concat(sortByDeparture(tomorrowFlights));
};

