//Project 6 Build a content Scraper
//Kody Broussard
//10/4/2018
//Using NPM, Node.js, vanilla js
//NPM Packages Scrape-it and CSV

//General variables
const scrapeIt = require('scrape-it');
const csv = require ('csv');
const stringify = require('csv-stringify');
const generate = require('csv-generate');
const assert = require('assert-plus');
const http = require('http');
const fs = require("fs");
const path = require('path');
let dataUrl = '';
let dataUrlArrayLength = '';
let shirtDataArray = [];


//Setting up NPM scrape-it promise interface, which is the Command Line Application for the content scraper. The first scraper.js promise collects the url data for all the shirt sites.
scrapeIt("http://shirts4mike.com/shirts.php", {
  pages: {
        listItem: ".products > li"
      , name: "shirt pages"
      , data: {
           url: {
                selector: "a"
              , attr: "href"
              , convert: x => 'http://shirts4mike.com/' + x
            }
        }
    }

}).then(({ data, response }) => {
    if (response.statusCode == 200) {
      dataUrl = data.pages;
      dataUrlArrayLength = dataUrl.length;
      dataUrl.forEach((url, index) => {
      shirtData(url.url, index);
      })
    } else {
      console.log(`There was an error with Status Code: ${response.statusCode} sorry for the inconvenience.`);
    }
}).catch(function onError (error){
    if(error.code === 'ENOTFOUND') {
      console.error(`Node.js Error Code: ${error.code}. Hostname ${error.hostname} was not found. Please make sure this address information is correct or check internet connection.`);
    } else {
      console.error(`Node.js Error Code: ${error.code} sorry for the inconvenience.`)
    }
});


//Second scrape-it promise process each url site and collects the required data for the price, title, time, url, and image url.
function shirtData(url, index) {
  scrapeIt(url, {
    shirtDetails: {
        listItem: ".shirt-details"
      , data: {
            price: {
                selector: ".price"
            }
          , title: {
              selector: "h1"
            , texteq: 0
            }
          , time: {
              selector: "h1"
            , convert: x => new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds()
            }
        }
    }
  , imageDetails: {
      listItem: ".shirt-picture"
    , data: {
        image: {
           selector: "img"
         , attr: "src"
        }
      }
    }

  }).then(({ data, response }) => {
        if (response.statusCode == 200) {
          let popData = data.shirtDetails.pop();
          let popImg = data.imageDetails.pop().image;
          popData.url = url;
          popData.image = popImg;
          console.log(popData);
          if((shirtDataArray.length) < (dataUrlArrayLength - 1)){
            shirtDataArray.push(popData);
          } else {
            shirtDataArray.push(popData);
            csvConvert(shirtDataArray);
          }
        } else {
          console.log(`There was an error with Status Code: ${response.statusCode} sorry for the inconvenience.`);
        }
  })
}

//Create a folder called data if it does not exist (done)
const mkdirSync = function (dirPath) {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.log(`${dirPath} already exist` );
    }
  }
}
mkdirSync(path.resolve('./data'));


//Create date for folder name
var fileNameFull = new Date();
var dateString = fileNameFull.getFullYear() + '-' + (fileNameFull.getMonth() + 1) + '-' + fileNameFull.getDate();
 var fileName = dateString.toString();

//Write information to data folder
function writeData (data) {
  var stream = fs.createWriteStream(`./data/${fileName}.csv`);
  stream.once('open', function(fd) {
    stream.write(data);
    stream.end();
  });
}


//Creating the CSV file using NPM package CSV
function csvConvert(data1) {
  stringify(
      data1
    , {
        header: true,
        delimiter: ';',
        columns: [
          'title',
          'price',
          'image',
          'url',
          'time'
       ]}, function(err, data) {
            writeData(data);
       })
}
