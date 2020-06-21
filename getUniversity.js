const fs = require("fs");
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    await page.goto('https://www.icourse163.org/university/view/all.htm#/');
    const results = await page.$$eval('.u-usity',input=>input.map(x=>x.getAttribute('href')));
    await browser.close();
    const filepath = path.join(__dirname,'data/university.json');
    const content = JSON.stringify(results);
    fs.writeFile(filepath,content,function (err) {
        if(err){
            return console.log(err);
        }
        console.log('write successfully')
    })
})();