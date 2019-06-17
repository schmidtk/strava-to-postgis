const getActivities = require('./get-activities.js');
const loadActivity = require('./load-activity.js');

(async function() {
  const ids = await getActivities({
    max: 10,
    perPage: 50
  });

  if (ids && ids.length) {
    for (let i = 0; i < ids.length; i++) {
      await loadActivity(ids[i]);
    }
  }
})();
