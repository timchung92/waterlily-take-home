export interface UnitedStatesState {
  stateName: string;
  stateAbbreviation: string;
  censusRegion: CensusRegion;
  division:
    | 'East North Central'
    | 'East South Central'
    | 'Middle Atlantic'
    | 'Mountain'
    | 'New England'
    | 'Pacific'
    | 'South Atlantic'
    | 'West North Central'
    | 'West South Central'
    | '';
}

export const UnitedStatesState: ObjectMap<UnitedStatesState> = {
  none: {
    stateName: '',
    stateAbbreviation: '',
    censusRegion: 'Other',
    division: '',
  },
  AK: {
    stateName: 'Alaska',
    stateAbbreviation: 'AK',
    censusRegion: 'West',
    division: 'Pacific',
  },
  AL: {
    stateName: 'Alabama',
    stateAbbreviation: 'AL',
    censusRegion: 'South',
    division: 'East South Central',
  },
  AR: {
    stateName: 'Arkansas',
    stateAbbreviation: 'AR',
    censusRegion: 'South',
    division: 'West South Central',
  },
  AZ: {
    stateName: 'Arizona',
    stateAbbreviation: 'AZ',
    censusRegion: 'West',
    division: 'Mountain',
  },
  CA: {
    stateName: 'California',
    stateAbbreviation: 'CA',
    censusRegion: 'West',
    division: 'Pacific',
  },
  CO: {
    stateName: 'Colorado',
    stateAbbreviation: 'CO',
    censusRegion: 'West',
    division: 'Mountain',
  },
  CT: {
    stateName: 'Connecticut',
    stateAbbreviation: 'CT',
    censusRegion: 'Northeast',
    division: 'New England',
  },
  DC: {
    stateName: 'District of Columbia',
    stateAbbreviation: 'DC',
    censusRegion: 'South',
    division: 'South Atlantic',
  },
  DE: {
    stateName: 'Delaware',
    stateAbbreviation: 'DE',
    censusRegion: 'South',
    division: 'South Atlantic',
  },
  FL: {
    stateName: 'Florida',
    stateAbbreviation: 'FL',
    censusRegion: 'South',
    division: 'South Atlantic',
  },
  GA: {
    stateName: 'Georgia',
    stateAbbreviation: 'GA',
    censusRegion: 'South',
    division: 'South Atlantic',
  },
  HI: {
    stateName: 'Hawaii',
    stateAbbreviation: 'HI',
    censusRegion: 'West',
    division: 'Pacific',
  },
  IA: {
    stateName: 'Iowa',
    stateAbbreviation: 'IA',
    censusRegion: 'Midwest',
    division: 'West North Central',
  },
  ID: {
    stateName: 'Idaho',
    stateAbbreviation: 'ID',
    censusRegion: 'West',
    division: 'Mountain',
  },
  IL: {
    stateName: 'Illinois',
    stateAbbreviation: 'IL',
    censusRegion: 'Midwest',
    division: 'East North Central',
  },
  IN: {
    stateName: 'Indiana',
    stateAbbreviation: 'IN',
    censusRegion: 'Midwest',
    division: 'East North Central',
  },
  KS: {
    stateName: 'Kansas',
    stateAbbreviation: 'KS',
    censusRegion: 'Midwest',
    division: 'West North Central',
  },
  KY: {
    stateName: 'Kentucky',
    stateAbbreviation: 'KY',
    censusRegion: 'South',
    division: 'East South Central',
  },
  LA: {
    stateName: 'Louisiana',
    stateAbbreviation: 'LA',
    censusRegion: 'South',
    division: 'West South Central',
  },
  MA: {
    stateName: 'Massachusetts',
    stateAbbreviation: 'MA',
    censusRegion: 'Northeast',
    division: 'New England',
  },
  MD: {
    stateName: 'Maryland',
    stateAbbreviation: 'MD',
    censusRegion: 'South',
    division: 'South Atlantic',
  },
  ME: {
    stateName: 'Maine',
    stateAbbreviation: 'ME',
    censusRegion: 'Northeast',
    division: 'New England',
  },
  MI: {
    stateName: 'Michigan',
    stateAbbreviation: 'MI',
    censusRegion: 'Midwest',
    division: 'East North Central',
  },
  MN: {
    stateName: 'Minnesota',
    stateAbbreviation: 'MN',
    censusRegion: 'Midwest',
    division: 'West North Central',
  },
  MO: {
    stateName: 'Missouri',
    stateAbbreviation: 'MO',
    censusRegion: 'Midwest',
    division: 'West North Central',
  },
  MS: {
    stateName: 'Mississippi',
    stateAbbreviation: 'MS',
    censusRegion: 'South',
    division: 'East South Central',
  },
  MT: {
    stateName: 'Montana',
    stateAbbreviation: 'MT',
    censusRegion: 'West',
    division: 'Mountain',
  },
  NC: {
    stateName: 'North Carolina',
    stateAbbreviation: 'NC',
    censusRegion: 'South',
    division: 'South Atlantic',
  },
  ND: {
    stateName: 'North Dakota',
    stateAbbreviation: 'ND',
    censusRegion: 'Midwest',
    division: 'West North Central',
  },
  NE: {
    stateName: 'Nebraska',
    stateAbbreviation: 'NE',
    censusRegion: 'Midwest',
    division: 'West North Central',
  },
  NH: {
    stateName: 'New Hampshire',
    stateAbbreviation: 'NH',
    censusRegion: 'Northeast',
    division: 'New England',
  },
  NJ: {
    stateName: 'New Jersey',
    stateAbbreviation: 'NJ',
    censusRegion: 'Northeast',
    division: 'Middle Atlantic',
  },
  NM: {
    stateName: 'New Mexico',
    stateAbbreviation: 'NM',
    censusRegion: 'West',
    division: 'Mountain',
  },
  NV: {
    stateName: 'Nevada',
    stateAbbreviation: 'NV',
    censusRegion: 'West',
    division: 'Mountain',
  },
  NY: {
    stateName: 'New York',
    stateAbbreviation: 'NY',
    censusRegion: 'Northeast',
    division: 'Middle Atlantic',
  },
  OH: {
    stateName: 'Ohio',
    stateAbbreviation: 'OH',
    censusRegion: 'Midwest',
    division: 'East North Central',
  },
  OK: {
    stateName: 'Oklahoma',
    stateAbbreviation: 'OK',
    censusRegion: 'South',
    division: 'West South Central',
  },
  OR: {
    stateName: 'Oregon',
    stateAbbreviation: 'OR',
    censusRegion: 'West',
    division: 'Pacific',
  },
  PA: {
    stateName: 'Pennsylvania',
    stateAbbreviation: 'PA',
    censusRegion: 'Northeast',
    division: 'Middle Atlantic',
  },
  RI: {
    stateName: 'Rhode Island',
    stateAbbreviation: 'RI',
    censusRegion: 'Northeast',
    division: 'New England',
  },
  SC: {
    stateName: 'South Carolina',
    stateAbbreviation: 'SC',
    censusRegion: 'South',
    division: 'South Atlantic',
  },
  SD: {
    stateName: 'South Dakota',
    stateAbbreviation: 'SD',
    censusRegion: 'Midwest',
    division: 'West North Central',
  },
  TN: {
    stateName: 'Tennessee',
    stateAbbreviation: 'TN',
    censusRegion: 'South',
    division: 'East South Central',
  },
  TX: {
    stateName: 'Texas',
    stateAbbreviation: 'TX',
    censusRegion: 'South',
    division: 'West South Central',
  },
  UT: {
    stateName: 'Utah',
    stateAbbreviation: 'UT',
    censusRegion: 'West',
    division: 'Mountain',
  },
  VA: {
    stateName: 'Virginia',
    stateAbbreviation: 'VA',
    censusRegion: 'South',
    division: 'South Atlantic',
  },
  VT: {
    stateName: 'Vermont',
    stateAbbreviation: 'VT',
    censusRegion: 'Northeast',
    division: 'New England',
  },
  WA: {
    stateName: 'Washington',
    stateAbbreviation: 'WA',
    censusRegion: 'West',
    division: 'Pacific',
  },
  WI: {
    stateName: 'Wisconsin',
    stateAbbreviation: 'WI',
    censusRegion: 'Midwest',
    division: 'East North Central',
  },
  WV: {
    stateName: 'West Virginia',
    stateAbbreviation: 'WV',
    censusRegion: 'South',
    division: 'South Atlantic',
  },
  WY: {
    stateName: 'Wyoming',
    stateAbbreviation: 'WY',
    censusRegion: 'West',
    division: 'Mountain',
  },
};
