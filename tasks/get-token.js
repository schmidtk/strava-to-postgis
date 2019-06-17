const config = require('config');
const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));

const reportError = (message) => {
  console.error(message);
  process.exit(1);
};

const strava = config.get('strava');

if (!strava.clientId) {
  reportError('Missing Strava client ID. Please add the value to your local configuration.');
}

if (!strava.clientSecret) {
  reportError('Missing Strava client secret. Please add the value to your local configuration.');
}

if (!strava.code) {
  reportError('Missing Strava authorization code. Please add the value to your local configuration.');
}

const url = 'https://www.strava.com/oauth/token';
const formData = {
  client_id: strava.clientId,
  client_secret: strava.clientSecret,
  code: strava.code,
  grant_type: 'authorization_code'
};

request.postAsync({url: url, formData: formData}).then((response) => {
  const jsonResponse = JSON.parse(response.body);
  console.log(`Auth Token: ${jsonResponse.access_token}`);
});
