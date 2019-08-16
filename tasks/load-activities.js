const {getActivities, getStoredActivityIds} = require('./get-activities.js');
const loadActivity = require('./load-activity.js');

(async function() {
  const ids = await getActivities({
    max: 20,
    perPage: 50
  });

  const existing = await getStoredActivityIds();

  if (ids && ids.length) {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];

      if (existing.includes(id)) {
        console.log(`Activity ID ${id} found in database. Skipping.`);
      } else {
        console.log(`Adding activity ID ${id} to database.`);
        await loadActivity(id);
      }
    }
  }
})();
