const fs = require("fs");
const puppeteer = require('puppeteer');

// const base_url = 'https://www.icourse163.org';
// (async () => {
//     const browser = await puppeteer.launch({headless:false});
//     const page = await browser.newPage();
//     await page.goto('https://www.icourse163.org/university/PKU');
//     let next = true;
//     const results = [];
//     while (next){
//         const tmp = await page.$$eval('#newCourseList > div > div:nth-child(2)> div> a',input=>input.map(x=>x.getAttribute('href')));
//         const btn = await page.$('.znxt');
//         results.push(...tmp);
//         next = await page.evaluate(x=>x.className.indexOf('js-disabled')=== -1,btn);
//         await btn.click();
//     }
//     await browser.close();
// })();

// const getCourses = async (university_url)=>{
//     const url = base_url+university_url;
//     const browser = await puppeteer.launch({headless:true});
//     const page = await browser.newPage();
//     await page.goto('https://www.icourse163.org/university/PKU');
// };

class spider{
    constructor() {
        this.browser = null;
        this.base_url = 'https://www.icourse163.org';
    }
    async openBrowser(){
        this.browser = await puppeteer.launch({headless:true});
    }
    async closeBrowser(){
        this.browser.close()
    }
    getCourse = async (university_url)=>{
        const url = this.base_url+university_url;
        const page = await this.browser.newPage();
        await page.goto(url);
        let next = true;
        const results = [];
        while (next){
            const tmp = await page.$$eval('#newCourseList > div > div:nth-child(2)> div> a',input=>input.map(x=>x.getAttribute('href')));
            const btn = await page.$('.znxt');
            results.push(...tmp);
            next = await page.evaluate(x=>x.className.indexOf('js-disabled')=== -1,btn);
            await btn.click();
        }
        await page.close();
        return results;
    };
}