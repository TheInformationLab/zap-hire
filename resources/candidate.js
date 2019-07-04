// get a single candidate
const getCandidate = (z, bundle) => {
  const responsePromise = z.request({
    url: `https://hire.googleapis.com/v1beta1/${bundle.inputData.id}`,
  });
  return responsePromise
    .then(response => {
      const candidate = z.JSON.parse(response.content);
      candidate.id = candidate.name;
      delete candidate.name;
      return candidate;
    });
};

const listCandidates = async (z, bundle) => {
  let cursor;
  if (bundle.meta.page) {
    cursor = await z.cursor.get(); // string | null
  }

  const response = await z.request(
    `https://hire.googleapis.com/v1beta1/tenants/${bundle.inputData.tenant || bundle.inputData.customTenant}/candidates`,
    {
      // if cursor is null, it's sent as an empty query
      //   param and should be ignored by the server
      params: { pageToken: cursor }
    }
  );

  // we successfully got page 1, should store the cursor in case the user wants page 2
  if (response.json.nextPageToken) {
    await z.cursor.set(response.json.nextPageToken);
  }
  const candidates = response.json.candidates;
  const updatedCandidates = [];
  if (candidates && candidates.length > 0) {
    candidates.map(candidate => {
      candidate.id = candidate.name;
      delete candidate.name;
      updatedCandidates.push(candidate);
    });
  }

  return updatedCandidates;
};

module.exports = {
  key: 'candidate',
  noun: 'Candidate',

  get: {
    display: {
      label: 'Get Candidate',
      description: 'Gets a candidate.'
    },
    operation: {
      inputFields: [
        {key: 'tenant', label: 'Tenant', helpText: 'Choose your account tenant or enter a custom tenant ID', required: true, choices: {'my_tenant': 'My Tenant', custom: 'Custom Tenant'}, altersDynamicFields: true},
        function(z, bundle) {
          if (bundle.inputData.tenant === 'custom') {
            return [{ key: 'customTenant', label: 'Custom Tenant ID', required: true }];
          }
          return [];
        },
        {key: 'id', label: 'Candidate ID', helpText: 'Candidate ID returned by the Hire API', required: true, dynamic: 'candidateList.id.id'}
      ],
      perform: getCandidate
    }
  },

  list: {
    display: {
      label: 'New Candidate',
      description: 'Lists the candidates.'
    },
    operation: {
      canPaginate: true,
      inputFields: [
        {key: 'tenant', label: 'Tenant', helpText: 'Choose your account tenant or enter a custom tenant ID', required: true, choices: {'my_tenant': 'My Tenant', custom: 'Custom Tenant'}, altersDynamicFields: true},
        function(z, bundle) {
          if (bundle.inputData.tenant === 'custom') {
            return [{ key: 'customTenant', label: 'Custom Tenant ID', required: true }];
          }
          return [];
        }
      ],
      perform: listCandidates
    }
  },

  sample: {
    id: 'tenants/*/candidates/*',
    createTime: '2014-10-02T15:01:23.045123456Z',
    personName: {
      givenName: 'Joe',
      familyName: 'Bloggs'
    },
    email: 'joe@bloggs.com',
    additionalEmails: ['contact@bloggs.com', 'email@bloggs.com'],
    uris: ['https://www.twitter.com/joe', 'https://linkedin.com/joe'],
    phoneNumber: '+1 (201) 234 2344',
    additonalPhoneNumbers: ['+1 (201) 234 2377'],
    postalAddresses: [
      {
        revision: 0,
        regionCode: 'ES',
        languageCode: 'en',
        postalCode: '12345',
        sortingCode: 'CEDEX',
        administrativeArea: 'Barcelona',
        locality: 'Barcelona',
        sublocality: 'Cami',
        addressLines: ['123'],
        recipients: ['FAO Somebody'],
        organization: 'Acme'
      }
    ],
    employmentInfo: [
      {
        jobTitle: 'Developer',
        employer: 'Acme',
        startDate: {
          year: 2012,
          month: 3,
          day: 1
        },
        endDate: {
          year: 2019,
          month: 5,
          day: 31
        },
      }
    ],
    source: {
      type: 'APPLICATION',
      referringUser: 'tenants/*/users/*',
      label: 'Form'
    },
    visaAssistanceInfo: {
      needsAssistance: false,
      details: 'No assitance needed'
    },
    startDate: {
      year: 2019,
      month: 6,
      day: 1
    },
    applications: ['tenants/*/applications/*']
  },

  outputFields: [
    {key: 'id', label: 'Candidate ID'},
    {key: 'createTime', label: 'Created'},
    {key: 'personName_givenName', label: 'Given Name'},
    {key: 'personName_familyName', label: 'Family Name'},
    {key: 'email', label: 'Primary Email'},
    {key: 'additionalEmails[]', label: 'Additional Emails'},
    {key: 'uris[]', label: 'URIs'},
    {key: 'phoneNumber', label: 'Primary Phone Number'},
    {key: 'additonalPhoneNumbers[]', label: 'Additional Phone Numbers'},
    {key: 'postalAddresses_revision', label: 'Postal Address Revision Number', type: 'integer'},
    {key: 'postalAddresses_regionCode', label: 'Region Code'},
    {key: 'postalAddresses_languageCode', label: 'Language Code'},
    {key: 'postalAddresses_postalCode', label: 'Postal Code'},
    {key: 'postalAddresses_sortingCode', label: 'Postal Sorting Code'},
    {key: 'postalAddresses_administrativeArea', label: 'Administrative Area'},
    {key: 'postalAddresses_locality', label: 'Locality'},
    {key: 'postalAddresses_sublocality', label: 'Sub Locality'},
    {key: 'postalAddresses_addressLines[]', label: 'Address'},
    {key: 'postalAddresses_recipients[]', label: 'Recipients'},
    {key: 'postalAddresses_organization', label: 'Organisation'},
    {key: 'employmentInfo_jobTitle', label: 'Job Title'},
    {key: 'employmentInfo_employer', label: 'Employer'},
    {key: 'employmentInfo_startDate_year', label: 'Current Employment Start Date (Year)', type: 'integer'},
    {key: 'employmentInfo_startDate_month', label: 'Current Employment Start Date (Month)', type: 'integer'},
    {key: 'employmentInfo_startDate_day', label: 'Current Employment Start Date (Day)', type: 'integer'},
    {key: 'employmentInfo_startDate_year', label: 'Current Employment End Date (Year)', type: 'integer'},
    {key: 'employmentInfo_startDate_month', label: 'Current Employment End Date (Month)', type: 'integer'},
    {key: 'employmentInfo_startDate_day', label: 'Current Employment End Date (Day)', type: 'integer'},
    {key: 'source_type', label: 'Source Type'},
    {key: 'source_referringUser', label: 'Referring User'},
    {key: 'source_label', label: 'Source Label'},
    {key: 'visaAssistanceInfo_needsAssistance', label: 'Needs Visa Assistance', type: 'boolean'},
    {key: 'visaAssistanceInfo_details', label: 'Visa Assistance Details'},
    {key: 'startDate_year', label: 'Start Date (Year)', type: 'integer'},
    {key: 'startDate_month', label: 'Start Date (Month)', type: 'integer'},
    {key: 'startDate_day', label: 'Start Date (Day)', type: 'integer'},
    {key: 'applications[]', label: 'Applications'},
  ]
};
