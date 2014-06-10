require.config({
  baseUrl: 'js',
  paths: {
    'jquery': '../lib/jquery.min',
    'jquery-mousewheel': '../lib/jquery.mousewheel.min',
    'underscore': '../lib/underscore.min',
    'dat': '../lib/dat-gui'
  },
  shim: {
    'jquery-mousewheel': ['jquery'],
    'dat': {
      exports: 'dat'
    }
  }
});

require(['jquery', 'app'], function($, App) {
  'use strict';

  $(document).ready(function() {
    window.app = new App();
    window.app.init();
  });
});
