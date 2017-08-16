window.matchMedia =
  window.matchMedia ||
  (() => {
    return { matches: false, addListener: () => {}, removeListener: () => {} };
  });

// storage
var localStorage = require('localStorage')
window.localStorage = window.sessionStorage = localStorage;

// site
require('../../src/assets/js/settings');

// connect
const _ = require('lodash');
const {connect} = require('dva');
jest.mock('dva', () => ({
  connect: _.bind(connect, {}, _, _, _, {withRef: true})
}));
