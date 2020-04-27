#!/usr/bin/env node
/**
 *
Prompt 

Week 1 challenge: Create a text scrambler/descrambler.
    Level 1: a string can be inserted into the scrambler and the original string cannot (easily) be guessed by looking at the output.
    Level 2: a function can take the scrambled string plus the encryption key and unscramble it back into the original text.
    Level 3: a function can take the scrambled string without the encryption key and unscramble it back into the original text.
Example:
    Level 1: "Hello, world!"  -> scrambler ->  "b7q08aue73bax1"
    Level 2: "b7q08aue73bax1"  + encryption key -> unscrambler -> "Hello, world!"
    Level 3: "b7q08aue73bax1"  -> unscrambler -> "Hello, world!"
Bonus points:
    Somehow get a picture of a penguin involved
    Hit Trevor A’s text to QR code API (see #product-random )
    Instead of scrambled text, use sound or light patterns
Due date: Monday April 27, 9:30AM
Prize: a handmade text scrambler/unscrambler

Solution

Scrambler using a shift cipher.
To unscramble without the key I use a brute force attack and then test each attempt against a spell checker to determine the closest 
matches of the actual text.
Penguins are here as well.
 */


const meow = require("meow");
const SpellChecker = require("simple-spellchecker");
const Image = require("ascii-art-image");

function scramble(text, secret) {
    let cipher = "";
    for (let i = 0; i < text.length; i++) {
        let letter = text.charAt(i);
        cipher += String.fromCharCode(letter.charCodeAt() + secret);
    }
    return cipher;
}

function unscrambleWithSecret(cipher, secret) {
    let text = "";
    for (let i = 0; i < cipher.length; i++) {
        let letter = cipher.charAt(i);
        text += String.fromCharCode(letter.charCodeAt() - secret);
    }
    return text;
}

function unscrambleWithoutSecret(cipher) {
    let dictionary = SpellChecker.getDictionarySync("en-US");
    let possibleTexts = [];
    for(let i = 0; i < 27; i++) {
        let text = unscrambleWithSecret(cipher, i);
        // console.log(text);
        let words = text.split(" ");        
        for(let word of words) {                        
            if(dictionary.spellCheck(word)) {                
                possibleTexts.push(text);
                break;
            }
        }            
    }
    return possibleTexts;    
}

const cli = meow(`
    Usage
        $ ./scrambler.js <cmd> 
    
    Commands
        scramble    Scramble text using given secret
        unscramble  Decode cipher using given secret
        codebreaker Decode cipher without secret

    Options
        --text, -t  text to be scrambled
        --secret, -s secret to use to scramble (must be a number between 1-26)
        --cipher, -c scrambled text
        --penguin, -p penguin image (must be a number between 1-5)

    Examples
        $ ./scrambler.js scramble -t "hello" -s 5
        $ ./scrambler.js unscramble -c "ifmmp" -s 5
        $ ./scrambler.js codebreaker -c "ifmmp"
`, {
    flags: {
        cmd: {
            type: "string",
            alias: "cmd",
            default: "scramble"
        },
        text: {
            type: "string",
            alias: "t"
        },
        secret: {
            type: "number",
            alias: "s"            
        },
        cipher: {
            type: "string",
            alias: "c"
        },
        penguin: {
            type: "number",
            alias: "p",
            default: 2
        }
    }
});

switch(cli.input[0]) {
    case "scramble":
        let cipher = scramble(cli.flags.text, cli.flags.secret);
        console.log(`Scrambled Text: ${cipher}`);
        break;
    case "unscramble":
        let text = unscrambleWithSecret(cli.flags.cipher, cli.flags.secret);
        console.log(`Unscrambled Text: ${text}`);
        break;
    case "codebreaker":
        let possibleTexts = unscrambleWithoutSecret(cli.flags.cipher);
        console.log(`Possilble Original Texts: ${possibleTexts}`);
        var image = new Image({
            filepath: `${process.cwd()}/penguins/penguin-${cli.flags.penguin}.jpg`,
            alphabet:'variant4'
        });
        image.write(function(err, rendered){
            console.log(rendered);
        })
        break;
}
