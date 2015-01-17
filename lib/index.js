// ===========================================================================
// Setup Global Variables & Dependencies
// ===========================================================================

    // Module dependencies
var request = require('request'),
    url     = require('url'),

    // Constants
    BASE_URL  = 'https://partner.api.beatsmusic.com',
    BASE_PATH = '/v1/api',
    CLIENT_ID,
    CLIENT_SECRET,

    // OAuth 2.0
    ACCESS_TOKEN,
    REFRESH_TOKEN,
    USER_ID;

// ===========================================================================
// Initialize BeatsAPI
// ===========================================================================

var BeatsAPI = {};

// ===========================================================================
// Base API Request Functions
// ===========================================================================

// Public API Request
BeatsAPI.request = function(method, path, opt, cb) {
  var key     = paramKeyForMethod(method),
      options = {};

  options[key] = opt;

  if (!options[key]) {
    options[key] = { 'client_id': CLIENT_ID };
  } else {
    options[key].client_id = CLIENT_ID;
  }

  options.uri = BASE_URL + path;

  request[method](options, function (err, res, body) {
    cb(err, body);
  });
};

// Authenticated API Request
BeatsAPI.authedRequest = function(method, path, opt, cb) {
  var key     = paramKeyForMethod(method),
      options = {};

  options[key] = opt;

  if (!options.headers) {
    options.headers = { 'Authorization': 'Bearer ' + ACCESS_TOKEN };
  } else {
    options.headers.Authorization = 'Bearer ' + ACCESS_TOKEN;
  }

  options.url = BASE_URL + path;

  request[method](options, function (err, res, body) {
    if (res.statusCode === 401 && !opt.stop) {
      refreshToken(function () {
        opt.stop = true;
        this.authedRequest(method, path, opt, cb);
      }.bind(this));
    } else {
      cb(err, body);
    }
  }.bind(this));
};

// ===========================================================================
// Authentication Functions
// ===========================================================================

BeatsAPI.login = function (username, password, cb) {
  getCode(username, password, function (code) {
    getToken(code, function (err, data) {
      this.getMe(cb);
    }.bind(this));
  }.bind(this));
};

BeatsAPI.getMe = function (cb) {
  this.authedRequest('get', BASE_PATH + '/me', {}, function (err, data) {
    USER_ID = parseBodyResult(data).user_context;

    if (cb) cb(err, parseBodyResult(data));
  });
};

// ===========================================================================
// Basic Metadata
// ===========================================================================

BeatsAPI.getCollection = function (collection, cb) {
  this.request('get',  BASE_PATH + '/' + collection, {}, function (err, data) {
    cb(err, JSON.parse(data));
  });
};

BeatsAPI.getResourceMetadata = function(type, id, cb) {
  this.request('get',  BASE_PATH + '/' + type + '/' + id, {}, function (err, data) {
    cb(err, JSON.parse(data));
  });
};

BeatsAPI.getResourceCollection = function (type, id, collectionPath, cb) {
  this.getCollection(type + '/' + id + '/' + collectionPath, cb);
};

BeatsAPI.authedGetCollection  = function (path, cb) {
  this.authedRequest('get', BASE_PATH + '/' + path, {}, function (err, data) {
    cb(err, JSON.parse(data));
  });
};

BeatsAPI.authedGetResourceMetadata = function (type, id, cb) {
  this.authedRequest('get', BASE_PATH + '/' + type + '/' + id, function (err, data) {
    cb(err, JSON.parse(data));
  });
};

BeatsAPI.authedGetResourceCollection = function (type, id, collectionPath, cb) {
  this.authedGetCollection(type + '/' + id + '/' + collectionPath, cb);
};

// ===========================================================================
// Artists
// ===========================================================================

BeatsAPI.getArtists = function (cb) {
  this.getCollection('artists', cb);
};

BeatsAPI.getArtistMetadata = function (artist_id, cb) {
  this.getResourceMetadata('artists', artist_id, cb);
};

BeatsAPI.getArtistTracks = function (artist_id, cb) {
  this.getResourceCollection('artists', artist_id, 'tracks', cb);
};

BeatsAPI.getArtistAlbums = function (artist_id, cb) {
  this.getResourceCollection('artists', artist_id, 'albums', cb);
};

BeatsAPI.getArtistEssentialAlbums = function (artist_id, cb) {
  this.getResourceCollection('artists', artist_id, 'essential_albums');
};

BeatsAPI.getArtistImages = function (artist_id, cb) {
  this.getResourceCollection('artists', artist_id, 'images', cb);
};

// ===========================================================================
// Albums
// ===========================================================================

BeatsAPI.getAlbums = function (cb) {
  this.getCollection('albums', cb);
};

BeatsAPI.getAlbumMetadata = function (album_id, cb) {
  this.getResourceMetadata('albums', album_id, cb);
};

BeatsAPI.getAlbumArtists = function (album_id, cb) {
  this.getResourceCollection('albums', album_id, 'artists', cb);
};

BeatsAPI.getAlbumTracks = function (album_id, cb) {
  this.getResourceCollection('albums', album_id, 'tracks', cb);
};

BeatsAPI.getAlbumReview = function (album_id, cb) {
  this.request('get', BASE_PATH + '/albums/' + album_id + '/review', cb);
};

BeatsAPI.getAlbumCompanionAlbums = function (album_id, cb) {
  this.getResourceCollection('albums', album_id, 'companion_albums', cb);
};

// ===========================================================================
// Tracks
// ===========================================================================

BeatsAPI.getTracks = function (cb) {
  this.getCollection('tracks', cb);
};

BeatsAPI.getTrackMetadata = function (track_id, cb) {
  this.getResourceMetadata('tracks', track_id, cb);
};

BeatsAPI.getTrackArtists = function (track_id, cb) {
  this.getResourceCollection('tracks', track_id, 'artists', cb);
};

// ===========================================================================
// Activities
// ===========================================================================

BeatsAPI.getActivity = function (cb) {
  this.getCollection('activities', cb);
};

BeatsAPI.getActivityMetadata = function (activity_id, cb) {
  this.getResourceMetadata('activities', activity_id, cb);
};

BeatsAPI.getActivity_editorialPlaylists = function (activity_id, cb) {
  this.getResourceCollection('activities', activity_id, 'editorial_playlists', cb);
};

// ===========================================================================
// Genres
// ===========================================================================

BeatsAPI.getGenres = function (cb) {
  this.getCollection('genres', cb);
};

BeatsAPI.getGenreMetadata = function (genre_id, cb) {
  this.getResourceMetadata('genres', genre_id, cb);
};

BeatsAPI.getGenreEditorsPicks = function (genre_id, cb) {
  this.getResourceCollection('genres', genre_id, 'editors_picks', cb);
};

BeatsAPI.getGenreFeatured = function (genre_id, cb) {
  this.getResourceCollection('genres', genre_id, 'featured', cb);
};

BeatsAPI.getGenreNewReleases = function (genre_id, cb) {
  this.getResourceCollection('genres', genre_id, 'new_releases', cb);
};

BeatsAPI.getGenreBios = function (genre_id, cb) {
  this.getResourceCollection('genres', genre_id, 'bios', cb);
};

BeatsAPI.getGenrePlaylists = function (genre_id, cb) {
  this.authedGetResourceCollection('genres', genre_id, 'playlists', cb);
};

BeatsAPI.getGenreImages = function (genre_id, cb) {
  this.getResourceCollection('genres', genre_id, 'images', cb);
};

// ===========================================================================
// Users
// ===========================================================================

BeatsAPI.getUserMetadata = function (cb) {
  this.authedGetResourceMetadata('user', USER_ID, cb);
};

BeatsAPI.getUserPlaylists = function (cb) {
  this.authedGetResourceCollection('user', USER_ID, 'playlists', cb);
};

BeatsAPI.getUserImages = function (cb) {
  this.authedGetResourceCollection('user', USER_ID, 'images', cb);
};

// ===========================================================================
// Playlists
// ===========================================================================

BeatsAPI.getPlaylistMetadata = function (playlist_id, cb) {
  this.authedGetResourceMetadata('playlist', playlist_id, cb);
};

BeatsAPI.createPlaylist = function (options, cb) {
  this.authedRequest('post', BASE_PATH + '/playlists', options, cb);
};

BeatsAPI.updatePlaylist = function (playlist_id, options, cb) {
  this.authedRequest('put', BASE_PATH + '/playlists/' + playlist_id, options, cb);
};

BeatsAPI.deletePlaylist = function (playlist_id, cb) {
  this.authedRequest('delete', BASE_PATH + '/playlists/' + playlist_id, {}, cb);
};

BeatsAPI.getPlaylistTracks = function (playlist_id, cb) {
  this.authedGetResourceCollection('playlists', playlist_id, 'tracks', cb);
};

BeatsAPI.appendPlaylistTracks = function (playlist_id, track_ids, cb) {
  var options = {
      'track_ids': track_ids
  };

  this.authedRequest('post', BASE_PATH + '/playlists/' + playlist_id + '/tracks', options, cb);
};

BeatsAPI.updatePlaylistTracks = function (playlist_id, track_ids, cb) {
  var options = {
      'track_ids': track_ids
  };

  this.authedRequest('put', BASE_PATH + '/playlists/' + playlist_id + '/tracks', options, cb);
};

BeatsAPI.getPlaylistSubscribers = function (playlist_id, cb) {
  this.authedGetResourceCollection('playlists', playlist_id, 'subscribers', cb);
};

BeatsAPI.getPlaylistsForUser = function (cb) {
  this.authedGetResourceCollection('users', USER_ID, 'playlists', cb);
};

BeatsAPI.getPlaylistSubscriptionsForUser = function (cb) {
  this.authedGetResourceCollection('users', USER_ID, 'playlist_subscriptions', cb);
};

BeatsAPI.subscribeToPlaylist = function (item_id, cb) {
  this.authedRequest('put', BASE_PATH + '/users/' + USER_ID + '/playlist_subscriptions/' + item_id, {}, cb);
};

BeatsAPI.unsubscribeFromPlaylist = function (item_id, cb) {
  this.authedRequest('delete', BASE_PATH + '/users/' + USER_ID + '/playlist_subscriptions/' + item_id, {}, cb);
};

BeatsAPI.bulkSubscribeToPlaylists = function (item_ids, cb) {
  var options = {
      'ids': item_ids
  };
  this.authedRequest('post', BASE_PATH + '/users/' + USER_ID + '/playlist_subscriptions', options, cb);
};

BeatsAPI.bulkUnsubscribeFromPlaylists = function (item_ids, cb) {
  var options = {
      'ids': item_ids
  };
  this.authedRequest('delete', BASE_PATH + '/users/' + USER_ID + '/playlist_subscriptions'.format(USER_ID), options, cb);
};

// ===========================================================================
// Recommendations
// ===========================================================================

BeatsAPI.getFeaturedContent = function (cb) {
  this.getCollection('discoveries/featured', cb);
};

BeatsAPI.getEditorsPicks = function (cb) {
  this.getCollection('discoveries/editor_picks', cb);
};

BeatsAPI.getJustForYou = function (cb) {
  this.authedGetResourceCollection('user', USER_ID, 'recs/just_for_you', cb);
};

// ===========================================================================
// Search
// ===========================================================================

BeatsAPI.getSearchResults = function (query, searchType, cb) {
  var options = { 'q' : query, 'type' : searchType };
  this.request('get', BASE_PATH + '/search', options, function (err, data) {
    cb(err, JSON.parse(data));
  });
};

BeatsAPI.getPredictiveSearchResults = function (query, cb) {
  var options = { 'q' : query };
  this.request('get', BASE_PATH + '/search/predictive', options, function (err, data) {
    cb(err, JSON.parse(data));
  });
};

// ===========================================================================
// Library
// ===========================================================================

BeatsAPI.getMyLibraryTracks = function (cb) {
  this.authedGetResourceCollection('users', USER_ID, 'mymusic/tracks', cb);
};

BeatsAPI.getMyLibraryAlbums = function (cb) {
  this.authedGetResourceCollection('users', USER_ID, 'mymusic/albums', cb);
};

BeatsAPI.getMyLibraryArtists = function (cb){
  this.authedGetResourceCollection('users', USER_ID, 'mymusic/artists', cb);
};

BeatsAPI.getMyLibraryAlbumTracks = function (album_id, cb) {
  this.authedGetCollection('/users/' + USER_ID +'/mymusic/' + album_id + '/tracks', cb);
};

BeatsAPI.getMyLibraryArtistTracks = function (artist_id, cb) {
  this.authedGetCollection('/users/' + USER_ID + '/mymusic/' + artist_id + '/tracks', cb);
};

BeatsAPI.getMyLibraryArtistAlbums = function (artist_id, cb) {
  this.authedGetCollection('/users/' + USER_ID + '/mymusic/' + artist_id + '/albums', cb);
};

BeatsAPI.addToMyLibrary = function (item_id, cb) {
  this.authedRequest('put', BASE_PATH + '/users/' + USER_ID + '/mymusic/' + item_id, {}, cb);
};

BeatsAPI.removeFromMyLibrary = function (item_id, cb) {
  this.authedRequest('delete', BASE_PATH + '/users/' + USER_ID + '/mymusic/' + item_id, {}, cb);
};

BeatsAPI.bulkAddToMyLibrary = function (item_ids, cb) {
  var options = {
      'ids': item_ids
  };
  this.authedRequest('post', BASE_PATH + '/users/' + USER_ID + '/mymusic', options, cb);
};

BeatsAPI.bulkRemoveFromMyLibrary = function (item_ids, cb) {
  var options = {
      'ids': item_ids
  };
  this.authedRequest('delete', BASE_PATH + '/users/' + USER_ID + '/mymusic', options, cb);
};

// ===========================================================================
// Audio
// ===========================================================================

BeatsAPI.getAudioAsset = function (track_id, cb) {
  this.authedRequest('get', BASE_PATH + '/tracks/' + track_id + '/audio', {}, cb);
};

// ===========================================================================
// Utility Functions
// ===========================================================================

// HTTP
function paramKeyForMethod(method) {
  return method === 'get' || method === 'delete' ? 'qs' : 'json';
}
function parseBodyData(body) {
  return JSON.parse(body).data;
}
function parseBodyResult(body) {
  return JSON.parse(body).result;
}

// OAuth 2.0
function getCode(username, password, cb) {
  var options = {
    uri: 'https://partner.api.beatsmusic.com/api/o/oauth2/approval',
    qs: {
      login: username,
      password: password,
      redirect_uri: 'http://www.example.com',
      client_id: CLIENT_ID,
      response_type: 'code',
      state: ''
    },
    headers: {
      Referer: 'https://partner.api.beatsmusic.com/oauth2/authorize'
    }
  };

  request.post(options, function (err, res) {
    if (err) return console.error(err);
    var location = res.headers.location,
        code     = url.parse(location, true).query.code;

    if (cb) cb(code);
  });
}
function getToken(code, cb) {
  var options = {
    code: code,
    redirect_uri: 'http://www.example.com',
    client_secret: CLIENT_SECRET,
    grant_type: 'authorization_code'
  };

  BeatsAPI.request('post', '/oauth2/token', options, function (err, data) {
    REFRESH_TOKEN = data.result.refresh_token;
    ACCESS_TOKEN  = data.result.access_token;

    if (cb) cb(err, data);
  });
}
function refreshToken(cb) {
  var data = {
    'redirect_uri': 'http://www.example.com',
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET,
    'grant_type': 'refresh_token',
    'refresh_token': REFRESH_TOKEN
  };

  BeatsAPI.request(
    'post',
    '/oauth2/token',
    data,
    function (err, data) {
      if (data) {
        REFRESH_TOKEN = data.result.refresh_token;
        ACCESS_TOKEN  = data.result.access_token;
      }

      cb(err, data);
  });
}

// ===========================================================================
// Expose BeatsAPI
// ===========================================================================

module.exports = {
  init: function (clientId, clientSecret) {
    CLIENT_ID     = CLIENT_ID ||
                    clientId  ||
                    process.env.BEATS_CLIENT_ID;

    CLIENT_SECRET = CLIENT_SECRET ||
                    clientSecret  ||
                    process.env.BEATS_CLIENT_SECRET;

    return BeatsAPI;
  }
};
