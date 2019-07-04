// get a single application
const getApplication = (z, bundle) => {
  const responsePromise = z.request({
    url: `https://hire.googleapis.com/v1beta1/${bundle.inputData.id}`,
  });
  return responsePromise
    .then(response => {
      const application = z.JSON.parse(response.content);
      application.id = application.name;
      delete application.name;
      return application;
    });
};

const listApplications = async (z, bundle) => {
  let cursor;
  if (bundle.meta.page) {
    cursor = await z.cursor.get(); // string | null
  }

  const response = await z.request(
    `https://hire.googleapis.com/v1beta1/tenants/${bundle.inputData.tenant || bundle.inputData.customTenant}/applications`,
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
  const applications = response.json.applications;
  const updatedApplications = [];
  if (applications && applications.length > 0) {
    applications.map(application => {
      application.id = application.name;
      delete application.name;
      updatedApplications.push(application);
    });
  }

  return updatedApplications;
};

module.exports = {
  key: 'application',
  noun: 'Application',

  get: {
    display: {
      label: 'Get Application',
      description: 'Gets a application.'
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
        {key: 'id', label: 'Application ID', helpText: 'Application ID returned by the Hire API', required: true, dynamic: 'applicationList.id.id'}
      ],
      perform: getApplication
    }
  },

  list: {
    display: {
      label: 'New Application',
      description: 'Lists the applications.'
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
      perform: listApplications
    }
  },

  sample: {
    id: 'tenants/*/applications/*',
    job: 'tenants/*/jobs/*',
    candidate: 'tenants/*/candidates/*',
    createTime: '2014-10-02T15:01:23.045123456Z',
    creatingUser: 'tenants/*/users/*',
    status: {
      state: 'ACTIVE',
      processStage: {
        stage: 'Final round interview',
        reportingCategory: 'INTERVIEW'
      },
      rejectionReason: '',
      updateTime: '2014-10-02T15:01:23.045123456Z'
    }
  },

  outputFields: [
    {key: 'id', label: 'Application ID'},
    {key: 'job', label: 'Job'},
    {key: 'candidate', label: 'Candidate'},
    {key: 'createTime', label: 'Created'},
    {key: 'creatingUser', label: 'Created By'},
    {key: 'status_state', label: 'Status'},
    {key: 'processStage_stage', label: 'Stage'},
    {key: 'processStage_reportingCategory', label: 'Reporting Category'},
    {key: 'status_rejectionReason', label: 'Rejection Reason'},
    {key: 'status_updateTime', label: 'Updated'}
  ]
};
