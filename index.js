#!/usr/bin/env node

'use strict';

var program = require('commander');
var request = require('request');

program
    .version('1.0.0')
    .command('def <word>')
    .description('get word definition')
    .action(def);

program
    .command('dict')
    .description('')
    .action(dict);

program.parse(process.argv);

function def(word) {
    console.log("ok");
}

function dict() {
    console.log('ok');
}