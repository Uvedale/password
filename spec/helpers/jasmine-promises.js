const {willResolve, expectToReject} = require('jasmine-promise-tools');
 
global.willResolve = willResolve;
global.expectToReject = expectToReject;