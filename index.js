#!/usr/bin/env node

'use strict';

var program = require('commander');
var request = require('request');
var co = require('co');
var prompt = require('co-prompt');

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
    .action(all);

program
    .command('dict <word>')
    .description('All information about the word')
    .action(all);

program
    .command('play')
    .description('Start a word game')
    .action(play);

console.log('\nLoading...\n');
program.parse(process.argv);

// Check if a specific command has been entered or not
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

function play() {
    var randomWordUrl = 'http://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&api_key=' + API_KEY;
    getWordData(randomWordUrl, function(data) {
        var randomWord = data.word;
        var synonymsUrl = BASE_URL + randomWord + '/relatedWords?relationshipTypes=synonym&api_key=' + API_KEY;
        getWordData(synonymsUrl, function(data) {
            // check if no synonyms found then get the meaning
            if (!data[0] || data[0].words.length == 0) {
                var url = BASE_URL + randomWord + '/definitions?limit=' + WORD_DEF_LIMIT + '&api_key=' + API_KEY;
                getWordData(url, function(data) {
                    getUserInput(randomWord, null, data[0].text);
                });
            } else {
                var synonyms = data[0].words;
                getUserInput(randomWord, synonyms);
            }
        });
    });
}

function getUserInput(word, synonyms, meaning) {
    if (synonyms)
        console.log("A synonym of the word is " + word + "\n");
    else
        console.log("The meaning of the word is -\nMeaning: " + meaning);

    co(function*() {
        var ans = yield prompt('Enter the word: ');
        if ((synonyms && synonyms.indexOf(ans.toLowerCase()) > -1) || (meaning && ans.toLowerCase() == word.toLowerCase())) {
            console.log("\nCorrect answer!\n");
            process.exit(0);
        } else {
            console.log('\nWrong answer!\n');
            co(function*() {
                var reply = yield prompt('Select a choice - \n1. Try again\n2. Exit\n')
                if (reply == 1) {
                    getUserInput(word, synonyms, meaning);
                } else if (reply == 2) {
                    if (meaning)
                        console.log('The word was ' + word + '\n');
                    else
                        console.log('The word could have been any of these -\nSynonyms: ' + synonyms.join(",") + '\n');
                    all(word);
                    setTimeout(function() {
                        process.exit(0);
                    }, 5000);
                } else {
                    console.log('Incorrect input\n');
                    process.exit(0);
                }
            });
        }
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
