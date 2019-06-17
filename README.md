# Strava to PostGIS

Loads Strava activity data to a PostGIS database.

## Strava Configuration

At minimum, the `strava` portion of the configuration must be provided. Create `config/local.json` (ignored by Git) and fill in the values from `default.json`.

`clientId` and `clientSecret`:

Go to your [Strava API Settings](https://www.strava.com/settings/api) and create an application if you have not already. You can use `localhost` for the Application Callback Domain. Once your application is registered, these configuration values will be available on the API settings page.

`code`:

Load this URL in a browser to request an OAuth code to retrieve an access token:

```
https://www.strava.com/oauth/authorize?client_id=35855&redirect_uri=http://localhost&response_type=code&scope=read,activity:read_all
```

When you approve authorization, you will be redirected. Copy the code from the redirect URL, ie:

```
http://localhost/?state=&code=<code>&scope=read,activity:read
```

`accessToken`:

Once the previous configuration values are set, run the `get-token` script to generate an access token:

```
npm run get-token
```

Save the access token to `local.json`. Note that this token will need to be updated if it expires, which should give you an authorization error when you run an ingest script.

## Database Setup

These scripts assume you already have a PostGIS instance installed, and the default config assumes you are using the [kartoza Geoserver Docker container](https://github.com/kartoza/docker-geoserver). If you are using a different database, copy the `database` config to `local.json` and update accordingly.

Using `psql`, create a new database and install the PostGIS extension:

```
CREATE DATABASE strava;
\c strava
CREATE EXTENSION postgis;
```

Next add a table to store run data:

```
CREATE TABLE runs (
  ID serial PRIMARY KEY,
  geom geometry(POINTZM, 4326),
  TIME timestamp,
  ACTIVITY_ID BIGINT NOT NULL,
  NAME VARCHAR(256),
  SHOE VARCHAR(256)
);
```

## Data Ingest

Get most recent activity ID:

```
npm run most-recent
```

Load a single activity to the database:

```
npm run load-activity <activityId>
```

Load the 10 most recent activities to the database:

```
npm run load-activities
```

To load more than 10 activities, modify `tasks/load-activities.js` accordingly. Note that the scripts do not currently check the database to avoid duplicate inserts. Loading an activity twice will insert it twice.
