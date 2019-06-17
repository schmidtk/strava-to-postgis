const config = require('config');
const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));
const {Client} = require('pg');

const reportError = (message) => {
  console.error(message);
  process.exit(1);
};

const accessToken = config.get('strava.accessToken');
if (!accessToken) {
  reportError('Missing Strava access token. Please run get-token and add the value to your local configuration.');
}

const loadActivity = async (activityId) => {
  if (activityId == null || isNaN(activityId)) {
    reportError(`Invalid Strava activity ID: ${activityId}`);
  }

  const headers = {
    'Authorization': `Bearer ${accessToken}`
  };

  const activityUrl = `https://www.strava.com/api/v3/activities/${activityId}`;
  const streamUrl = `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=latlng,altitude,time&key_by_type=true`;

  console.log(`Requesting activity ${activityId}...`);

  const activityResponse = await request.getAsync({url: activityUrl, headers: headers});
  const activity = JSON.parse(activityResponse.body);
  if (activity.errors && activity.errors.length) {
    reportError(`Activity request failed: ${activity.message}`);
  }

  console.log(`Requesting activity stream ${activityId}...`);

  const streamResponse = await request.getAsync({url: streamUrl, headers: headers})
  const stream = JSON.parse(streamResponse.body);
  if (stream.errors && stream.errors.length) {
    reportError(`Stream request failed: ${stream.message}`);
  }

  const latlng = stream.latlng.data;
  const lonlat = latlng.map(coord => coord.reverse());
  const altitude = stream.altitude.data;

  const startTime = new Date(activity.start_date).getTime();
  const time = stream.time.data;

  lonlat.forEach((coord, idx, arr) => {
    coord.push(altitude[idx] || 0);
    coord.push(startTime + time[idx] * 1000);
  });

  const databaseParams = config.get('database');
  const client = new Client(databaseParams);

  try {
    console.log(`Connecting to database...`);

    await client.connect();
  } catch (e) {
    reportError(`Database connect failed: ${e.message}`);
  }

  try {
    console.log(`Inserting ${lonlat.length} positions into database.`);

    for (let i = 0; i < lonlat.length; i++) {
      const coord = lonlat[i];
      const wktGeom = `POINT ZM(${coord[0]} ${coord[1]} ${coord[2]} ${coord[3]})`;
      const activityTime = new Date(coord[3]).toISOString();
      const activityName = activity.name || 'Unnamed Activity';
      const shoe = activity.gear && activity.gear.name || '';

      await client.query(
        'INSERT INTO runs(geom, ACTIVITY_ID, TIME, NAME, SHOE) values(ST_GeomFromText($1, 4326), $2, $3, $4, $5)',
        [wktGeom, activity.id, activityTime, activityName, shoe]
      );
    }

    console.log('Done!');
  } catch (e) {
    reportError(`Database insert failed: ${e.message}`);
  }

  await client.end();
};

module.exports = loadActivity;
