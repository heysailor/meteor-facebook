Facebook = {};

var querystring = Npm.require('querystring');

// This function called by browser based FB, not cordova FB Connect pathway
OAuth.registerService('facebook', 2, null, function (query) {
  var authData = getTokenResponse(query);
  var details = getUserDetails(authData);
  console.log('Got FB details');
  return details;
}.bind(this));

function getUserDetails(authData) {
  // include all fields from facebook
  // http://developers.facebook.com/docs/reference/login/public-profile-and-friend-list/
  var whitelisted = ['id', 'email', 'name', 'first_name',
      'last_name', 'link', 'gender', 'locale', 'age_range'];

  var identity = getIdentity(authData.accessToken, whitelisted);

  var serviceData = {
    accessToken: authData.accessToken,
    expiresAt: (+new Date) + (1000 * authData.expiresIn)
  };

  var fields = _.pick(identity, whitelisted);
  fields.profilePictureURL = getProfilePicture(authData.accessToken);
  _.extend(serviceData, fields);

  return {
    serviceData: serviceData,
    options: {profile: {name: identity.name}}
  };
};

// checks whether a string parses as JSON
function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
function getTokenResponse(query) {
  console.log('Getting token response');
  var config = ServiceConfiguration.configurations.findOne({service: 'facebook'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var responseContent;
  try {
    // Request an access token
    responseContent = HTTP.get(
      "https://graph.facebook.com/v2.2/oauth/access_token", {
        params: {
          client_id: config.appId,
          redirect_uri: OAuth._redirectUri('facebook', config),
          client_secret: OAuth.openSecret(config.secret),
          code: query.code
        }
      }).content;
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Facebook. " + err.message),
                   {response: err.response});
  }

  // If 'responseContent' parses as JSON, it is an error.
  // XXX which facebook error causes this behvaior?
  if (isJSON(responseContent)) {
    throw new Error("Failed to complete OAuth handshake with Facebook. " + responseContent);
  }

  // Success!  Extract the facebook access token and expiration
  // time from the response
  var parsedResponse = querystring.parse(responseContent);
  var fbAccessToken = parsedResponse.access_token;
  var fbExpires = parsedResponse.expires;

  if (!fbAccessToken) {
    throw new Error("Failed to complete OAuth handshake with facebook " +
                    "-- can't find access token in HTTP response. " + responseContent);
  }
  console.log('Token', fbAccessToken)
  console.log('expires', fbExpires)
  return {
    accessToken: fbAccessToken,
    expiresIn: fbExpires
  };
};

function getIdentity (accessToken, fields) {
  try {
    return HTTP.get("https://graph.facebook.com/v2.4/me", {
      params: {
        access_token: accessToken,
        fields: fields
      }
    }).data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Facebook. " + err.message),
                   {response: err.response});
  }
};

function getProfilePicture (accessToken) {
  try {
    // Minimum FB profile pic size is 180x180px
    return HTTP.get('https://graph.facebook.com/v2.0/me/picture/?redirect=false&height=180&width=180', {
      params: { access_token: accessToken },
    }).data.data.url;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch profile picture from Facebook: " + err.message),
                   { response: err.response });
  }
};

Facebook.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
Facebook.getUserDetails = function(authData) {
  return getUserDetails(authData);
};
