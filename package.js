Package.describe({
  name: 'heysailor:facebook',
  summary: "Facebook OAuth flow",
  version: "1.2.3"
});

Package.onUse(function(api) {
  api.use('oauth2@1.1.5', ['client', 'server']);
  api.use('oauth@1.1.6', ['client', 'server']);
  api.use('http@1.1.1', ['server']);
  api.use('templating@1.1.5', 'client');
  api.use('underscore@1.0.4', 'server');
  api.use('random@1.0.5', 'client');
  api.use('service-configuration@1.0.5', ['client', 'server']);

  api.export('Facebook');

  api.addFiles(
    ['facebook_configure.html', 'facebook_configure.js'],
    'client');

  api.addFiles('facebook_server.js', 'server');
  api.addFiles('facebook_client.js', 'client');
});
