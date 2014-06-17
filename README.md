nodebeats
======
A node.js wrapper for [Beats Music Developer API](https://developer.beatsmusic.com/). Module is still under development so *there are bugs*. Feel free to file an issue.
Getting Started
======
#### 1. Install Via npm

Install the module via the npm CLI tool.

```
npm install nodebeats --save
```

#### 2. Get Beats Music credentials

To use **nodebeats** you must first register a developer account through the [developer portal](https://developer.beatsmusic.com/) and create a new application. Each application will have a key and secret which you will use later.

#### 3. Initialize Client

Using the credentials from the previous step, you can now initialize **nodebeats** and start making API calls through the returned client.

The Beats API has both public and private endpoints. Providing the clientSecret is optional but provides you access to all the functionality of the Beats API.
```
var Beats = require('nodebeats');

var beatsClient = Beats.init(clientId, clientSecret);
```
If `init()` is called without passing in parameters, **nodebeats** looks for the environmental variables `process.env.BEATS_CLIENT_ID` and `process.env.BEATS_CLIENT_SECRET`.

#### 4. Make Requests

Once you obtain the client, you can use it to start making requests to the Beats API. To see what you can do refer the the [docs](#) (coming soon)

```
beatsClient.getSearchResults('Dr. Dre', 'artist', function (err, data) {
  // Do something
});
```

Authenticated Requests
======
**Nodebeats** also lets you access user resources. This includes getting user information, editing playlists, and getting recommendations. To access these resources, you must login with the user's credentials. The entire OAuth process is handled for you including getting a token and refreshing it when necessary.

```
beatsClient.login(username, password, function(err, data) {
  beatsClient.getPlaylistsForUser(function (err, data) {
    // Do something
  });
});
```

Once the user has been logged in, there is no need to login for future authenticated requests.
