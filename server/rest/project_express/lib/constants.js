module.exports = Object.freeze({
    MY_CONSTANT: 'some value',
    ANOTHER_CONSTANT: 'another value'
});


var constants = require('./constants');

console.log(constants.MY_CONSTANT); // 'some value'

constants.MY_CONSTANT = 'some other value';

console.log(constants.MY_CONSTANT); // 'some value'