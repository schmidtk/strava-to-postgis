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

const getActivities = async (options) => {
  options = options || {};

  const ids = [];
  const max = options.max || 50;
  let perPage = Math.min(max, options.perPage || 50);

  const afterParam = options.after ? `&after=${options.after}` : '';
  const beforeParam = options.before ? `&before=${options.before}` : '';

  const headers = {
    'Authorization': `Bearer ${accessToken}`
  };

  let page = 1;

  while (perPage > 0 && ids.length < max) {
    console.log(`Requesting next ${perPage} activities...`);

    const url = `https://www.strava.com/api/v3/activities?page=${page}&per_page=${perPage}${afterParam}${beforeParam}`;
    const activityResponse = await request.getAsync({url: url, headers: headers});
    const activities = JSON.parse(activityResponse.body);
    if (activities.errors && activities.errors.length) {
      reportError(`Stream request failed: ${activities.message}`);
    }

    if (!activities.length) {
      break;
    }

    const newIds = activities.map(activity => activity.id);
    ids.push(...newIds);

    perPage = Math.max(Math.min(perPage, max - ids.length), 0);
    page++;
  }

  console.log(`Retrieved ${ids.length} activity IDs.`);

  return ids;
};

module.exports = getActivities;
