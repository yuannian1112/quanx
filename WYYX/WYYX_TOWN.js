/*
[task_local]
30 0,23 * * * https://raw.githubusercontent.com/xzxxn777/quanx/main/WYYX/WYYX_TOWN.js, tag=网易严选-严选家园, enabled=true
*/
const $ = new Env('网易严选-严选家园');
let ckStr = ($.isNode() ? process.env.WYYX : $.getdata("WYYX")) || "";
let noticeBody = '';
!(async () => {
    let ckArr = await Variable_Check(ckStr, "WYYX");
    for (let index = 0; index < ckArr.length; index++) {
        let num = index + 1;
        console.log(`\n-------- 开始【第 ${num} 个账号】--------`);
        cookie = ckArr[index];
        await queryInfo(cookie);
        await queryTown(cookie);
        await $.wait(2000)
        console.log("\n开始做任务")
        await taskList(cookie);
    }
})().catch((e) => {$.log(e)}).finally(() => {$.done({});});

function queryInfo(cookie) {
    return new Promise(resolve => {
        const options = {
            url: `https://m.you.163.com/act/napi/wishtown/assets/query.json?csrf_token=365761ff59bfc2e276233dd9f7de0fa4&__timestamp=1668835881560&`,
            headers: {
                'X-Requested-With' : `XMLHttpRequest`,
                'x-csrf-token' : ``,
                'Connection' : `keep-alive`,
                'Accept-Encoding' : `gzip, deflate, br`,
                'Content-Type' : `application/json`,
                'Origin' : `https://act.you.163.com`,
                'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 yanxuan/7.6.8 device-id/ed179fedbfda9a7c5c9d462616c7bd96 app-chan-id/AppStore trustId/ios_trustid_781b2e99fe3a488eab858e05e4d48d63`,
                'Cookie' :cookie,
                'Referer' : `https://m.you.163.com/wishland`,
                'Host' : `m.you.163.com`,
                'Accept-Language' : `zh-CN,zh-Hans;q=0.9`,
                'Accept' : `application/json, text/javascript, */*; q=0.01`
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    let data1 = JSON.parse(data)
                    for (let i=0;i<data1.result.length;i++) {
                        if (data1.result[i].level!=null) {
                            let count = data1.result[i].count;
                            let nextLevelThreshold=data1.result[i].nextLevelThreshold;
                            console.log("当前等级："+data1.result[i].level+" 经验："+count+"/"+nextLevelThreshold)
                        }
                        if (data1.result[i].type==1) {
                            let count = data1.result[i].count;
                            console.log("拥有金币："+count)
                        }
                        if (data1.result[i].type==3) {
                            let count = data1.result[i].count;
                            console.log("拥有钻石："+count)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function queryTown(cookie,taskId,title) {
    return new Promise(resolve => {
        const options = {
            url: `https://m.you.163.com/act/napi/wishtown/town/query.json?csrf_token=365761ff59bfc2e276233dd9f7de0fa4&__timestamp=1668835881333&`,
            headers: {
                'Cookie':cookie,
                'Host': 'm.you.163.com',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                'referer': 'https://m.you.163.com/wishland'
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    let data1 = JSON.parse(data)
                    //console.log(data1.result.buildings)
                    let downList = data1.result.buildings;
                    for (let i = 0; i < downList.length; i++) {
                        let downName = downList[i].buildName;
                        let downLevel = downList[i].level;
                        let buildId = downList[i].buildId;
                        console.log("\n建筑：" + downName + " 当前等级：" + downLevel)
                        let upgradeRequire = downList[i].upgradeRequire;
                        let price = upgradeRequire.price;
                        if (upgradeRequire.userMaterialDTOList != null) {
                            let materialName = upgradeRequire.userMaterialDTOList[0].materialName;
                            let count = upgradeRequire.userMaterialDTOList[0].count;
                            console.log("升级需要：金币：" + price + " " + materialName + "：" + count + "个")
                        } else {
                            console.log("升级需要：" + "金币：" + price)
                        }
                        await $.wait(2000)
                        if (buildId==1){
                            console.log("开始升级")
                            await upgrade(cookie,buildId);
                        }
                        if (buildId==2&&downLevel<=10){
                            console.log("开始升级")
                            await upgrade(cookie,buildId);
                        }
                    }
                    console.log("\n开始收集金币")
                    await $.wait(2000)
                    for (let i = 0; i < downList.length; i++) {
                        let buildId = downList[i].buildId;
                        await collectCoin(cookie, buildId);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function collectCoin(cookie,buildId) {
    return new Promise(resolve => {
        const options = {
            url: `https://m.you.163.com/act/napi/wishtown/assets/collectCoin.json?csrf_token=365761ff59bfc2e276233dd9f7de0fa4`,
            headers: {
                'Host': 'm.you.163.com',
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'accept-language': 'zh-CN,zh-Hans;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'origin': 'https://m.you.163.com',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 yanxuan/7.6.8 device-id/ed179fedbfda9a7c5c9d462616c7bd96 app-chan-id/AppStore trustId/ios_trustid_781b2e99fe3a488eab858e05e4d48d63',
                'referer': 'https://m.you.163.com/wishland',
                'content-length': '9',
                'Cookie':cookie
            },
            body: `buildId=${buildId}`,
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    let data1 = JSON.parse(data)
                    if (data1.code == 200) {
                        console.log("收集金币成功")
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function upgrade(cookie,buildId) {
    return new Promise(resolve => {
        const options = {
            url: `https://m.you.163.com/act/napi/wishtown/building/upgrade.json`,
            headers: {
                'Host': 'm.you.163.com',
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'accept-language': 'zh-CN,zh-Hans;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'origin': 'https://m.you.163.com',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 yanxuan/7.6.8 device-id/ed179fedbfda9a7c5c9d462616c7bd96 app-chan-id/AppStore trustId/ios_trustid_781b2e99fe3a488eab858e05e4d48d63',
                'referer': 'https://m.you.163.com/wishland',
                'content-length': '9',
                'Cookie':cookie
            },
            body: `buildId=${buildId}`,
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    let data1 = JSON.parse(data)
                    if (data1.code == 200) {
                        console.log("升级成功！")
                    } else {
                        console.log("升级失败，金币不足！")
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function taskList(cookie) {
    return new Promise(resolve => {
        const options = {
            url: `https://m.you.163.com/act/napi/wishtown/task/list.json?__timestamp=1668842426949&`,
            headers: {
                'Host': 'm.you.163.com',
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'Cookie':cookie,
                'accept-language': 'zh-CN,zh-Hans;q=0.9',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 yanxuan/7.6.8 device-id/ed179fedbfda9a7c5c9d462616c7bd96 app-chan-id/AppStore trustId/ios_trustid_781b2e99fe3a488eab858e05e4d48d63',
                'referer': 'https://m.you.163.com/wishland',
                'accept-encoding': 'gzip, deflate, br'
            },
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    let data1 = JSON.parse(data)
                    let tasks = data1.result;
                    //console.log(tasks)
                    for (let i = 0; i < tasks.length; i++) {
                        let taskId = tasks[i].taskId;
                        let title = tasks[i].title;
                        let coin = tasks[i].reward;
                        //await doTask(cookie, taskId, title,reward);
                        await $.wait(2000)
                        await reward(cookie, taskId,coin);
                        //await doTask1(cookie, taskId, title,reward);
                        await $.wait(2000)
                        //await reward(cookie, taskId);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function doTask(cookie,taskId,title,reward) {
    return new Promise(resolve => {
        const options = {
            url: `https://m.you.163.com/act/napi/wishtown/task/trigger.json`,
            headers: {
                'Host': 'm.you.163.com',
                'content-type': 'application/json',
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'accept-language': 'zh-CN,zh-Hans;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'origin': 'https://m.you.163.com',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 yanxuan/7.6.8 device-id/ed179fedbfda9a7c5c9d462616c7bd96 app-chan-id/AppStore trustId/ios_trustid_781b2e99fe3a488eab858e05e4d48d63',
                'referer': 'https://m.you.163.com/wishland',
                'content-length': '14',
                'Cookie':cookie,
            },
            body:JSON.stringify({"taskId":taskId})
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    let data1 = JSON.parse(data)
                    console.log("开始任务："+title)
                    console.log(data1.msg)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function doTask1(cookie,taskId,title,reward) {
    return new Promise(resolve => {
        const options = {
            url: `https://act.you.163.com/napi/play/web/taskT/task/trigger?_=1668843957963`,
            headers: {
                'Host': 'act.you.163.com',
                'content-type': 'application/json',
                'accept': 'application/json',
                'accept-language': 'zh-CN,zh-Hans;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'origin': 'https://act.you.163.com',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 yanxuan/7.6.8 device-id/ed179fedbfda9a7c5c9d462616c7bd96 app-chan-id/AppStore trustId/ios_trustid_781b2e99fe3a488eab858e05e4d48d63',
                'referer': 'https://act.you.163.com/act/pub/ssr/yHp8vH6SGRbi.html?appConfig=1_1_1&award=2000&schemaId=15&taskId=316&taskType=2',
                'content-length': '16',
                'Cookie':cookie,
            },
            body:JSON.stringify({"taskId":taskId})
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    let data1 = JSON.parse(data)
                    console.log("开始任务："+title)
                    console.log(data1.msg)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function reward(cookie,taskId,coin) {
    return new Promise(resolve => {
        const options = {
            url: `https://m.you.163.com/act/napi/wishtown/task/reward.json?csrf_token=742dbee4b5d37a5edf9799fa86003fc8`,
            headers: {
                'Cookie':cookie,
                'Host': 'm.you.163.com',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                'Origin': 'https://m.you.163.com'
            },
            body:JSON.stringify({"taskId":taskId})
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    let data1 = JSON.parse(data)
                    if (data1.code == 200) {
                        console.log("获得金币"+coin)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

//获取当前日期函数
function getNowFormatDate() {
    let date = new Date(),
        year = date.getFullYear(), //获取完整的年份(4位)
        month = date.getMonth() + 1, //获取当前月份(0-11,0代表1月)
        strDate = date.getDate() // 获取当前日(1-31)
    if (month >= 1 && month <= 9) month = '0' + month // 如果月份是个位数，在前面补0
    if (strDate >= 0 && strDate <= 9) strDate = '0' + strDate // 如果日是个位数，在前面补0

    let currentdate = `${year}${month}${strDate}`
    return currentdate
}

/**
 * 变量检查
 */
async function Variable_Check(ck, Variables) {
    return new Promise((resolve) => {
        let ckArr = [];
        if (ck) {
            if (ck.indexOf("?") !== -1) {
                ck.split("?").forEach((item) => {
                    ckArr.push(item);
                });
            } else {
                ckArr.push(ck);
            }
            resolve(ckArr);
        } else {
            console.log(` ${$.name}:未填写变量 ${Variables} ,请仔细阅读脚本说明!`);
            $.done()
        }
    });
}

// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}