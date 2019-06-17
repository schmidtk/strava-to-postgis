const config = require('config');
const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));

const reportError = (message) => {
  console.error(message);
  process.exit(1);
};

const accessToken = config.get('strava.accessToken');
if (!accessToken) {
  reportError('Missing Strava access token. Please run get-token and add the value to your local configuration.');
}

const loadActivity = async () => {
  const url = 'https://www.strava.com/api/v3/activities?page=1&per_page=1';
  const headers = {
    'Authorization': `Bearer ${accessToken}`
  };

  console.log(`Requesting most recent activity...`);

  const activityResponse = await request.getAsync({url: url, headers: headers});
  const activities = JSON.parse(activityResponse.body);
  if (activities.errors && activities.errors.length) {
    reportError(`Stream request failed: ${activities.message}`);
  }

  if (!activities.length) {
    reportError('No activities found.');
  }

  console.log(`Activity ID: ${activities[0].id}`);
};

loadActivity();
