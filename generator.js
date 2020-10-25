const fs = require('fs');
const https = require('https');

const { registerFont, createCanvas, loadImage } = require('canvas');
registerFont('buky.ttf', { family: 'Buky'})

const width = 900;
const height = 1200;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

const draw = (image) => {
    ctx.drawImage(image, 0, 0);

    ctx.fillStyle = '#ffffcc'
    ctx.fillRect(0,width,width,300);
}
// 

const addRandomQuote = () => {

let randomChapter = '.' + Math.floor(Math.random() * 40);
let randomVerse = '.' + Math.floor(Math.random() * 43);

console.log('startng getQuote')

    https.get('https://api.bibleonline.ru/bible?trans=rst66&q=exodus' + randomChapter + randomVerse, resp => {
        let jsonp = ''
        resp.on('data', chunk => {
            jsonp += chunk
        })
        resp.on('end', () => {
            console.log(jsonp);
            let parsedData = JSON.parse(jsonp.slice(1, jsonp.length - 2));
                if (parsedData[1]) {
                    let book = parsedData[0].h2;
                    let chapter = parsedData[1].v.n;
                    let verse = parsedData[1].v.t;

                    let reFil = /<\/?i>/;

                    let parsedVerse = verse.split(reFil).join('').replace('&mdash;', '');

                    parsedVerse = parsedVerse.charAt(0).toUpperCase() + parsedVerse.slice(1)

                    addText(book, parsedVerse).then(saveImage());
            } else {
                console.log('no verse found')
                addRandomQuote();
            }
        })
    });
}

let splitLines = (text) => {
    let lines = [];
    let wordsArray = text.split(' ');
    let thisLine = '';
    for (let i = 0; i < wordsArray.length; i++) {
        let word = wordsArray[i];
        thisLine = thisLine.concat(word + ' ');
        if (thisLine.length > 45 || word === wordsArray[wordsArray.length-1]){
            lines.push(thisLine);
            thisLine = '';
        }
    }
    return lines;
}

const addText = async (book, text) => {

    let linesToPrint = splitLines(text);
    let fontSize = 42
    ctx.font = fontSize +'px Buky';

    let x = 16;
    let y = 954;

    ctx.fillStyle = 'black'
    ctx.fillText(book, x+650, y+200)

    for (let i = 0; i < linesToPrint.length; i++){

        ctx.fillStyle = 'black'
        let line = linesToPrint[i]
        
        ctx.fillText(line, x, y)
        if (i === 0){
            ctx.fillStyle = 'red'
            ctx.fillText(line[0], x, y)
        }

        y += 42;
    }
}

const saveImage = () => {
    const buffer = canvas.toBuffer('image/jpeg', {compressionLevel: 6, filters: canvas.PNG_ALL_FILTERS});
    fs.writeFileSync('./image2.jpeg', buffer, () => {console.log('fs finished')})
}

let randomImage = './sourcepics/' + Math.floor(Math.random() * 28) + '.jpg'

loadImage(randomImage).then((image) => {
    draw(image);
})
.then(() => addRandomQuote())


