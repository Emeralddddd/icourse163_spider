const fs = require("fs");
const path = require('path');

const dirpath = path.join(__dirname,'data/courses');
const files = fs.readdirSync(dirpath);
console.log(files);
const result=[];

// files.forEach((x)=>{
//     filepath = path.join(dirpath,x);
//     fs.readFile(filepath,(err,data)=>{
//         if(err){
//             return console.log(err);
//         }
//         result.push({key:x,value:data});
//         console.log('push '+x);
//     })
// });
const readone = (x)=>{
    return new Promise((resolve, reject) => {
        let filepath = path.join(dirpath, x);
        fs.readFile(filepath,'utf8',(err,data)=>{
            if(err){
                reject();
            }
            result.push({key:x.split('.')[0],value:JSON.parse(data)});
            resolve();
        })
    })
};

Promise.all(files.map(x=>readone(x))).then(()=>{
    let all = [];
    result.forEach(x=>all.push(...x.value));
    all = Array.from(new Set(all));
    const content = JSON.stringify(all);
    fs.writeFile(path.join(__dirname,'data/combine.json'),content,(err)=>{
        if(err){
            return console.log(err);
        }
        console.log('write combine.json')
    })
});
