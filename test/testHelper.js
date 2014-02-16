"use strict";

var express = require('express');
var userMock = require('./userMock');
var i18n = require('i18next');
var jade = require("jade");

module.exports = function (internalAppName, configuredBeans) {
  var appName = internalAppName;
  var beans = configuredBeans || require('./configureForTest').get('beans');

  i18n.init({
    supportedLngs: ['de'],
    preload: ['de'],
    fallbackLng: 'de',
    resGetPath: 'locales/__ns__-__lng__.json'
  });

  return {
    createApp: function (memberID, middleware) {
      var app = express();
      app.use(express.cookieParser());
      app.use(express.urlencoded());
      app.use(express.session({secret: 'secret', cookie: {maxAge: 10000}, store: null}));
      if (middleware) {
        app.use(middleware);
      }

      if (memberID) {
        var Member = beans.get('member');
        app.use(userMock({member: new Member({id: memberID})}));
      }
      app.use(beans.get('accessrights'));
      app.use(i18n.handle);
      app.use(beans.get('expressViewHelper'));
      app.use('/', beans.get(appName)(express()));

      i18n.registerAppHelper(app);
      i18n.addPostProcessor("jade", function (val, key, opts) {
        return jade.compile(val, opts)();
      });
      return app;
    }
  };
};

