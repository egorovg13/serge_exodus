const fs = require('fs');
const axios = require('axios')

const { registerFont, createCanvas, loadImage } = require('canvas');
registerFont('buky.ttf', { family: 'Buky'})

const draw = async (image, quoteObj, ctx, canvas) => {

    ctx.drawImage(image, 0, 0);

    ctx.fillStyle = '#ffffcc'
    ctx.fillRect(0, canvas.width, canvas.width,300);

    await addText(quoteObj, ctx);
}

const getBibleText = async () => {

    let randomChapter = '.' + Math.floor(Math.random() * 40);
    let randomVerse = '.' + Math.floor(Math.random() * 43);

    try {
        let responce = await axios.get('https://api.bibleonline.ru/bible?trans=rst66&q=exodus' + randomChapter + randomVerse);
        let jsonp = responce.data;
        if (jsonp.length > 10) {
            let parsedQuote = await parseJsonp(jsonp);
            return parsedQuote;
        } else {
            console.log('getBibleText: no verse found')
            let newParsedQuote = await getBibleText();
            return newParsedQuote;
        }

      } catch (error) {
        console.error(error)
      }
}

const parseJsonp = async (jsonp) => {
    let json = jsonp.slice(1, jsonp.length - 2)
    let parsedData = JSON.parse(json);

                if (parsedData[1]) {
                    let book = parsedData[0].h2;
                    let chapter = parsedData[1].v.n;
                    let verse = parsedData[1].v.t;

                    let reFil = /<\/?i>/;

                    let parsedVerse = verse.split(reFil).join('').replace('&mdash;', '');

                    parsedVerse = parsedVerse.charAt(0).toUpperCase() + parsedVerse.slice(1);
                    let quoteObj = 
                    {verse: parsedVerse, 
                    book: book}

                    return quoteObj
                } else {
                        console.log('no verse found')
                        await getBibleText();
                }
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

const addText = async (quoteObj, ctx) => {
    let book = quoteObj.book;
    let verse = quoteObj.verse;

    let linesToPrint = splitLines(verse);
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

const saveImage = async (imgName, canvas) => {
    console.log(`saveimage img name is ${imgName}`)

    const buffer = canvas.toBuffer('image/jpeg', {compressionLevel: 6, filters: canvas.PNG_ALL_FILTERS});

    fs.writeFileSync(imgName, buffer);

    console.log('saving file finished')
}

module.exports = {
    generate: async (imgName) => {
        const width = 900;
        const height = 1200;
    
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        randomImage = './sourcepics/' + Math.floor(Math.random() * 28) + '.jpg'
        const image = await loadImage(randomImage);
        randomImage = '';

        let quoteObj = await getBibleText();
        console.log('quote object in the main function:')
        console.log(quoteObj)

        await draw(image, quoteObj, ctx, canvas);
        console.log('genrate: text added')
        await saveImage(imgName, canvas);
        console.log('genrate: file saved')
    }
}