const fs = require("fs");
const path = require('path');
const puppeteer = require('puppeteer');
const MongoClient = require('mongodb').MongoClient;
const dburl = 'mongodb://localhost:27017';
const filepath = path.join(__dirname, 'data/combine.json');
const dbName = 'mooc';
const collectionName = 'documents';

const handleData = async (page) => {
    const title = await page.$eval('.course-title', x => x.innerText);
    const startendTime = await page.$$eval('.course-enroll-info_course-info_term-info_term-time span', x => x[1].innerText.split(' ~ '));
    const startTime = startendTime[0];
    const endTime = startendTime[1];
    const creditHours = await page.$$eval(".course-enroll-info_course-info_term-workload span", x => x[1].innerText);
    const enroll = await page.$eval(".course-enroll-info_course-enroll_price-enroll_enroll-count", x => x.innerText.split(' ')[1]);
    const institution = await page.$eval(".m-teachers_school-img", x => x.getAttribute('data-label').slice(1));
    const category = await page.$$eval(".sub-category", list => list.map(x => x.innerText));
    return {
        title: title,
        startTime: startTime,
        endTime: endTime,
        creditHours: creditHours,
        enroll: enroll,
        institution: institution,
        category: category
    }
};

const handleOnePage = async (page) => {
    const comments = [];
    const username = await page.$$eval('.ux-mooc-comment-course-comment_comment-list_item_body_user-info_name', list => list.map(x => x.innerText));
    const rating = await page.$$eval('.star-point', list => list.slice(1).map(x => x.childElementCount));
    const text = await page.$$eval('.ux-mooc-comment-course-comment_comment-list_item_body_content', list => list.map(x => x.innerText));
    const time = await page.$$eval('.ux-mooc-comment-course-comment_comment-list_item_body_comment-info_time', list => list.map(x => x.innerText.split(' ')[1]));
    const term = await page.$$eval('.ux-mooc-comment-course-comment_comment-list_item_body_comment-info_term-sign', list => list.map(x => x.innerText));
    const likes = await page.$$eval('.ux-mooc-comment-course-comment_comment-list_item_body_comment-info_actions', list => list.map(x => x.innerText.trim()));
    for (index in username) {
        comments.push({
            username: username[index],
            rating: rating[index],
            text: text[index],
            time: time[index],
            term: term[index],
            likes: likes[index]
        })
    }
    return comments;
};

const handleComments = async (page) => {
    const comments = [];
    await page.click('#review-tag-button');
    let next = true;
    while (next) {
        const tmp = await handleOnePage(page);
        comments.push(...tmp);
        const btn = await page.$('.ux-pager_btn__next');
        if (!btn) {
            break;
        }
        next = await page.evaluate(x => x.children[0].className.indexOf('th-bk-disable-gh') === -1, btn);
        await btn.click();
        await page.waitFor(1000);
    }
    return comments;
};

const getOnecourse = async (browser, url) => {
    const page = await browser.newPage();
    await page.goto('https:' + url);
    const data = await handleData(page);
    const comments = await handleComments(page);
    data['comments'] = comments;
    page.close();
    return data;
};

const sleep = (time) => new Promise((res, rej) => setTimeout(res, time));

async function main() {
    const client = new MongoClient(dburl);
    let collection = null;
// Use connect method to connect to the Server
    await client.connect(function (err) {
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        collection = db.collection(collectionName);
    });
    const list = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    const browser = await puppeteer.launch({headless: true});
    let i = 6000;
    for (let url of list.slice(i, 7000)) {
        try {
            const data = await getOnecourse(browser, url);
            data['url'] = 'https:' + url;
            await collection.insertOne(data);
        } catch (e) {
            console.log('error!');
            console.log(i);
            continue;
        }
        console.log(i);
        i++;
        await sleep(2500);
    }
    await browser.close();
    await client.close();
}

main();
