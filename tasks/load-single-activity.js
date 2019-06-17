const loadActivity = require('./load-activity.js');

const reportError = (message) => {
  console.error(message);
  process.exit(1);
};

(async function() {
  const activityId = Number(process.argv[2] || NaN);
  if (isNaN(activityId)) {
    reportError(`Invalid Strava activity ID: ${activityId}`);
  }

  await loadActivity(activityId);
})();
