const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');

class Spider{
    constructor() {
        this.browser = null;
        this.base_url = 'https://www.icourse163.org';
    }
    async openBrowser(){
        this.browser = await puppeteer.launch({headless:true});
    }
    async closeBrowser(){
        await this.browser.close()
    }
    getCourse = async (university_url)=>{
        const url = this.base_url+university_url;
        const page = await this.browser.newPage();
        await page.goto(url);
        let next = true;
        const results = [];
        while (next){
            //await page.content();
            await page.waitFor(2000);
            //await page.waitForSelector('.znxt');
            const tmp = await page.$$eval('#newCourseList > div > div:nth-child(2)> div> a',input=>input.map(x=>x.getAttribute('href')));
            results.push(...tmp);
            const btn = await page.$('#j-courses .znxt');
            if(!btn){
                break;
            }
            try{
                next = await page.evaluate(x=>x.className.indexOf('js-disabled')=== -1,btn);
                await btn.click();
            }catch (e) {
                console.log(e);
            }
            await page.waitFor(2000);
        }
        await page.close();
        return results;
    };
}

(async ()=>{
    const sleep = (time) => new Promise((res, rej) => setTimeout(res, time));
    filepath = path.join(__dirname,'data/university.json');
    let list = JSON.parse(fs.readFileSync(filepath,'utf8')).slice(54);
    const spider = new Spider();
    await spider.openBrowser();
    for (let university_url of list){
        const key = university_url.split('/').pop();
        const value = await spider.getCourse(university_url);
        const filepath = path.join(__dirname,'data/courses/'+key+'.json');
        const content = JSON.stringify(value);
        fs.writeFile(filepath,content,function (err) {
            if(err){
                return console.log(err);
            }
            console.log(key+' write successfully')
        });
        await sleep(2500);
    }
    // const university_url="/university/PKU";
})();


