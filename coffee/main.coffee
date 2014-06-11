'use strict'

$ = require 'jquery'
App = require './app.coffee'

$(document).ready ->
  window.app = new App
  window.app.init()
