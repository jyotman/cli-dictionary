#!/usr/bin/env node

'use strict';

var program = require('commander');
var request = require('request');

var API_KEY = 'a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';
var BASE_URL = 'http://api.wordnik.com/v4/word.json/';
var WORD_DEF_LIMIT = 2;
var WORD_EX_LIMIT = 3;
var commandFound = false;

program
    .version('1.0.0')
    .command('def <word>')
    .description('get word definition')
    .action(def);

program
    .command('syn <word>')
    .description('get word synonyms')
    .action(syn);

program
    .command('ant <word>')
    .description('get word antonyms')
    .action(ant);

program
    .command('ex <word>')
    .description('get word examples')
    .action(ex);

program
    .arguments('<word>')
    .description('All information about the word')
    .action(all)

program
    .command('dict <word>')
    .description('All information about the word')
    .action(all)

console.log('\nLoading...\n');
program.parse(process.argv);

if (!commandFound) {
    wordOfTheDay();
}

function def(word) {
    var url = BASE_URL + word + '/definitions?limit=' + WORD_DEF_LIMIT + '&api_key=' + API_KEY;
    getWordData(url, function(data) {
        if (data.length > 0)
            console.log('Meaning: ' + data[0].text + '\n');
        else
            noResultsFound('Meaning');
    });
}

function syn(word) {
    var url = BASE_URL + word + '/relatedWords?relationshipTypes=synonym&api_key=' + API_KEY;
    getWordData(url, function(data) {
        if (data[0] && data[0].words.length > 0)
            console.log('Synonyms: ' + data[0].words.join(",") + '\n');
        else
            noResultsFound('Synonyms');
    });
}

function ant(word) {
    var url = BASE_URL + word + '/relatedWords?relationshipTypes=antonym&api_key=' + API_KEY;
    getWordData(url, function(data) {
        if (data[0] && data[0].words.length > 0)
            console.log('Antonyms: ' + data[0].words.join(",") + '\n');
        else
            noResultsFound('Antonyms');
    });
}

function ex(word) {
    var url = BASE_URL + word + '/examples?limit=' + WORD_EX_LIMIT + '&api_key=' + API_KEY;
    getWordData(url, function(data) {
        if (data.examples && data.examples.length > 0) {
            console.log('Examples: \n')
            for (var i = 0; i < data.examples.length; i++)
                console.log((i + 1) + '. ' + data.examples[i].text + '\n');
        } else
            noResultsFound('Examples');
    });
}

function all(word) {
    // Not in any particular order
    def(word);
    syn(word);
    ant(word);
    ex(word);
}

function wordOfTheDay() {
    var url = 'http://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=' + API_KEY;
    getWordData(url, function(data) {
        var word = data.word;
        console.log('Word of the day - ' + word + '\n');
        all(word);
    });
}

function getWordData(url, callback) {
    commandFound = true;
    var options = {
        url: url,
        json: true
    };
    request(options, function(err, res, body) {
        if (err)
            console.log(err);
        else
            callback(body);
    });
}

function noResultsFound(action) {
    console.log(action + ': Not found!\n');
}
