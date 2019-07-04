const CandidateSearch = require('./searches/candidate');
const CandidateResource = require('./resources/candidate');
const ApplicationResource = require('./resources/application');
// You'll want to set these with either `CLIENT_ID=abc zapier test` or `zapier env 1.0.0 CLIENT_ID abc`
process.env.BASE_URL = process.env.BASE_URL || 'https://www.googleapis.com';
process.env.CLIENT_ID = process.env.CLIENT_ID || '1018531575810-09e7apkalpcttl58bsvn96rdmvqvf56s.apps.googleusercontent.com';
process.env.CLIENT_SECRET = process.env.CLIENT_SECRET || 'bkC4a4_zQr0UMIRyESLfrxRd';
process.env.SCOPE = process.env.SCOPE || 'https://www.googleapis.com/auth/hire.application.readonly https://www.googleapis.com/auth/hire.candidate.readonly https://www.googleapis.com/auth/hire.job.readwrite https://www.googleapis.com/auth/hire.user.readonly'

const authentication = require('./authentication');

// To include the Authorization header on all outbound requests, simply define a function here.
// It runs runs before each request is sent out, allowing you to make tweaks to the request in a centralized spot
const includeBearerToken = (request, z, bundle) => {
  if (bundle.authData.access_token) {
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
  }
  return request;
};

const App = {
  // This is just shorthand to reference the installed dependencies you have. Zapier will
  // need to know these before we can upload
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication: authentication,

  beforeRequest: [
    includeBearerToken
  ],

  afterResponse: [
  ],

  resources: {
    [CandidateResource.key]: CandidateResource,
    [ApplicationResource.key]: ApplicationResource,
  },

  // If you want your trigger to show up, you better include it here!
  triggers: {
  },

  // If you want your searches to show up, you better include it here!
  searches: {
    [CandidateSearch.key]: CandidateSearch,
  },

  // If you want your creates to show up, you better include it here!
  creates: {
  }
};

// Finally, export the app.
module.exports = App;
