export const BlockTypes = {
  CompanyFlight: 1,
  OCF: 2,
};

export const FlightTypes = {
  Scheduled: 1,
  Unscheduled: 2,
  Part91: 3,
};

export const ShiftTypes = {
  Flying: 1,
  Other: 2,
};

export const DutyTypes = {
  Reserve: 0,
  Office: 1,
  Training: 2,
  Travel: 3,
};

export const FlightTypeNames = {
  [FlightTypes.Scheduled]: 'Scheduled',
  [FlightTypes.Unscheduled]: 'Unscheduled',
  [FlightTypes.Part91]: 'Part 91',
};

export const DutyTypeNames = {
  [DutyTypes.Office]: 'Office',
  [DutyTypes.Reserve]: 'Reserve',
  [DutyTypes.Training]: 'Training',
  [DutyTypes.Travel]: 'Travel',
};
