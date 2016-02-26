Meteor Facbook package
======================

An implementation of the Facebook OAuth flow. See the [project page](https://www.meteor.com/accounts) on Meteor Accounts for more details.

Replaces the Meteor package `facebook` to also include the user's `profilePictureURL` in the Facebook serviceData, and expose a helper API.

API
---

Exports a `Facebook` object on the server only, with two methods:

### retrieveCredential(credentialToken, credentialSecret)

### getUserDetails(authData)
`authdata` must be an object with the FB access token as `accessToken` attribute, and `expiresIn` in seconds.
