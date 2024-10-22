/*
[task_local]
20 0,6,12,18 * * * https://raw.githubusercontent.com/xzxxn777/quanx/main/MEIZU/MEIZU.js, tag=魅族社区, img-url=https://raw.githubusercontent.com/xzxxn777/quanx/main/picture/meizu.png, enabled=true
*/
const $ = new Env('魅族社区');
let arr = ($.isNode() ? process.env.MEIZU : $.getjson("MEIZU")) || [];
let delay = 10000;
let app_version= "6.2.8"
!(async () => {
    if (arr.length == 0) {
        console.log("请先登录")
        return
    }
    for (let i = 0; i < arr.length; i++) {
        console.log("\n")
        console.log("用户："+arr[i].user_id + " 开始任务")
        await loginByToken(arr[i].token);
        if (isLogin == 0) {
            continue
        }
        // 任务列表
        let taskDate = await commonPost("/myplus-muc/u/user/point/task/M_COIN");
        // let newVar = await signin();
        let taskList = taskDate.list;
        for (const task of taskList) {
            if (!task.complete) {
                console.log(`开始任务 ${task.taskName}   ${task.remark}`)
                switch (task.taskName) {
                    case "点赞":
                        await likeTask()
                        break;
                    case "关注用户":
                        await followUser();
                        break;
                    case "关注话题":
                        await focusTopics();
                        break;
                    case "加入圈子":
                         await forum();
                        break;
                    case "发表评论":
                        await comment();
                        break;
                    case "收藏主题":
                        await contentFav();
                        break;
                    case "发布主题":
                        break;
                    case "获得 10 个关注":
                        await crossCorrelation()
                        break;
                    case "每日签到":
                        await signin();
                        break
                }
                await $.wait(Math.floor(Math.random() * delay + 2000));
            }
        }
        console.log(`开始商城任务`)
        await mzStore(arr[i].user_id, arr[i].token)
        await countBenefits(arr[i].user_id)
    }
})().catch((e) => {$.log(e)}).finally(() => {$.done({});});

// 判断日期是不是今天、昨天、明天
const isToday = (str) => {
    let d = new Date(str).setHours(0, 0, 0, 0);
    let today = new Date().setHours(0, 0, 0, 0);
    return d - today === 0;
};

function loginByToken(token) {
    return new Promise(resolve => {
        const options = {
            url: `https://myplus-api.meizu.cn/myplus-login/g/app/login?token=${token}`,
            headers: {
                'User-Agent': 'android_app_myplus',
                'APP-MODE': '1',
                'ANDROID-APP-VERSION_NAME': '6.2.8',
                'ANDROID-APP-VERSION-CODE': '50000043',
                'ANDROID-APP-CHANNEL': 'meizu',
                'LOCAL-TIME': '1692514174760',
                'DARK-MODE': '0',
                'Host': 'myplus-api.meizu.cn',
                'Connection': 'keep-alive',
                'Accept-Encoding': 'gzip',
                'Cookie': 'STORE-UUID=1656286e-6783-4ca3-8c4e-b419dfee340d',
            },
        }
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    let data1 = JSON.parse(data)
                    if (data1.code == 200) {
                        isLogin = 1;
                        sid = data1.data[0].value;
                        cookie = "STORE-UUID=" + data1.data[0].value + "; MEIZUSTORESESSIONID=" + data1.data[0].value + ";";
                        console.log(cookie)
                    } else {
                        console.log(data1.msg)
                        $.msg($.name + data1.msg);
                        isLogin = 0;
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

async function mzStore(user_id,token){
    // 签到
    await mzStoreSign(user_id)
    //判断抽奖
    let left = await getLeft()
    if (left > 0) {
        // 积分抽奖
        await storeLotteryDraw(token)
    }
}

async function mzStoreSign(uid){
    return new Promise(resolve => {
        const data = {
            url: `https://app.store.res.meizu.com/mzstore/sign/add`,
            headers: {
                "Host": "app.store.res.meizu.com",
                "User-Agent": "okhttp/3.12.1",
                "mz_channel": "meizu",
                "mz_version": "5000",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: `uid=${uid}&sid=${sid}&`,
            timeout: 10000
        };
        $.post(data, (err, resp, data) => {
            try {
                if (err) {
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    console.log(data)
                    let dataObj = JSON.parse(data);
                    resolve(dataObj);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function getLeft(){
    return new Promise(resolve => {
        const data = {
            url: `https://pyramid.meizu.com/draw/getLeft?appId=1&activityId=2009`,
            headers: {
                "Host": "pyramid.meizu.com",
                "Referer": "https://hd.mall.meizu.com/activity/lottry54.html",
                "User-Agent": `Mozilla/5.0 (Linux; Android 10; Build/QKQ1.191222.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36 MzbbsApp/${app_version}MzmApp/${app_version} FlymePreApp/${app_version} AppVersionCode/50000042 MzChannel/meizu DeviceBrand/meizu DeviceModel`,
                "Connection": "keep-alive",
                "X-Requested-With":" com.meizu.flyme.flymebbs",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "cookie":cookie
            },
            timeout: 10000
        };
        $.get(data, (err, resp, data) => {
            try {
                if (err) {
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    console.log(data)
                    let dataObj = JSON.parse(data);
                    resolve(dataObj.data.left);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

// 积分抽奖
async function storeLotteryDraw(token){
    return new Promise(resolve => {
        const data = {
            url: `https://pyramid.meizu.com/m/score?activityId=2009&appId=1`,
            headers: {
                "Host": "pyramid.meizu.com",
                "Referer": "https://hd.mall.meizu.com/activity/lottry54.html",
                "User-Agent": `Mozilla/5.0 (Linux; Android 10; Build/QKQ1.191222.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36 MzbbsApp/${app_version}MzmApp/${app_version} FlymePreApp/${app_version} AppVersionCode/50000042 MzChannel/meizu DeviceBrand/meizu DeviceModel`,
                "Connection": "keep-alive",
                "X-Requested-With":" com.meizu.flyme.flymebbs",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "cookie":`token=${token}; ${cookie}`
            },
            timeout: 10000
        };
        $.get(data, (err, resp, data) => {
            try {
                if (err) {
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    console.log(data)
                    let dataObj = JSON.parse(data);
                    resolve(dataObj);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function countBenefits(user_id){
    let count = 0;
    let  lastList =[];
    let dataM_COIN = await commonPost("/myplus-muc/u/user/point/flow/M_COIN?currentPage=0");
    lastList=lastList.concat(dataM_COIN.rows)
    await $.wait(Math.floor(Math.random() * delay + 2000));
    dataM_COIN = await commonPost("/myplus-muc/u/user/point/flow/M_COIN?currentPage=1");
    lastList=lastList.concat(dataM_COIN.rows)
    dataM_COIN = await commonPost("/myplus-muc/u/user/point/flow/M_COIN?currentPage=2");
    lastList=lastList.concat(dataM_COIN.rows)
    for (const row of lastList) {
        if (isToday(row.date)){
            count+= row.point
        }
    }
    $.msg($.name + "用户："+user_id,`今日获得 煤球: ${count}`,`拥有煤球：${total}`);
    await $.wait(Math.floor(Math.random() * delay + 2000));
}

async function crossCorrelation() {
    let i = 0
    do {
        console.log(`执行关注 当前第${i}页`)
        await followUser(i)
        console.log(`执行点赞 当前第${i}页`)
        // await likeTask(i)
        i++
    } while (i < 5)

}

async function likeTask(page = 0) {
    let recommendationList = await square(page);
    let i = 0;
    for (const rec of recommendationList.blocks) {
        if (rec.type.includes('content') && rec.detail.liked == undefined) {
            await content(rec.detail.id)
            await $.wait(Math.floor(Math.random() * delay + 2000));
            let likeDate = await like(rec.detail.id);
            if (likeDate.code === 200) {
                i++
            } else {
                console.log(`点赞出现异常 ${likeDate}`)
            }
            // if (i >= 10) return
        }
    }
}

// 关注话题
async function focusTopics() {
    let recommendationList = await recommendation();
    let i = 0;
    for (const rec of recommendationList.blocks) {
        if (rec.detail.topicIds) {
            let topicInfo = await commonGet(`/myplus-qing/ug/topic/get?id=${rec.detail.topicIds[0]}`);
            if (!topicInfo.isFollowed) {
                let data = await commonTaskGet(`/myplus-qing/u/topic/follow?id=${rec.detail.topicIds[0]}`);
                if (data.code === 200) {
                    i++
                }
            }
        }
        if (i >= 2) return
    }
}

// 加入圈子
async function forum() {
    let forumPage = await commonGet(`/myplus-qing/ug/content/square/channel/data/forum?currentPage=0`);
    let i = 0;
    for (const forum of forumPage.rows) {
        if (!forum.isFollowed) {
            await commonTaskPost(`/myplus-qing/u/forum/follow?id=${forum.id}`)
            i++;
        } else {
            await commonTaskPost(`/myplus-qing/u/forum/unfollow?id=${forum.id}`)
        }
        await $.wait(Math.floor(Math.random() * delay + 2000));
        if(i>=2) return
    }
}

// 关注用户
async function followUser(page = 0) {
    let recommendationList = await square(page);
    let i = 0;
    for (const rec of recommendationList.blocks) {
        if (rec.type.includes('content') && !rec.detail.member.followed) {
            // await content(rec.detail.id)
            let followData = await commonTaskPost(`/myplus-qing/u/member/follow?uid=${rec.detail.member.uid}`)
            if (followData.code === 200) {
                i++
            } else {
                console.log(`关注用户出现异常 ${likeDate}`)
            }
            await $.wait(Math.floor(Math.random() * delay + 2000));
        }
    }
}

// 评论
// curl  "" "https://myplus-api.meizu.cn"
// https://myplus-api.meizu.cn"
async function comment() {
    let recommendationList = await square();
    let i = 0;
    for (const rec of recommendationList.blocks) {
        if (rec.type.includes('content')) {
            await content(rec.detail.id)
            await $.wait(Math.floor(Math.random() * delay + 2000));
            let rapidList = await commonGet(`/myplus-qing/ug/comment/rapid/list`)
            if (rapidList.count > 0) {
                let length = rapidList.list.length;
                let contentStr = rapidList.list[Math.floor(Math.random() * length)];
                console.log(contentStr)
                await commonTaskPostBody("/myplus-qing/u/comment/add/v2", {
                    "ats": [],
                    "content": contentStr,
                    "contentId": rec.detail.id,
                    "createTime": Math.round(new Date() / 1000),
                    "deviceName": "16th",
                    "isChp": 1,
                    "parentId": 0,
                    "replyId": 0,
                    "replyUid": 0
                });
                await $.wait(Math.floor(Math.random() * delay + 2000));
            } else {
                return
            }
            await $.wait(Math.floor(Math.random() * delay + 2000));
        }
    }
}

async function contentFav() {
    let recommendationList = await square(1);
    let i = 0;
    for (const rec of recommendationList.blocks) {
        if (rec.type.includes('content')) {
            await content(rec.detail.id)
            await $.wait(Math.floor(Math.random() * delay + 2000));
            if (i < 3) {
                let data = await commonTaskPost(`/myplus-qing/u/content/auth/fav/${rec.detail.id}?id=${rec.detail.id}`);
                if (data.code == 200) {
                    i++
                }
            } else {
                return
            }
            await $.wait(Math.floor(Math.random() * delay + 2000));
        }
    }
}

async function signin() {
    return new Promise(resolve => {
        const body = {};
        $.post(taskUrl("/myplus-muc/u/user/signin", body), (err, resp, data) => {
            try {
                if (err) {
                    console.log('\nmyplus-muc/u/user/signin: API查询请求失败 ‼️‼️');
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        console.log(data)
                        resolve(JSON.parse(data));
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

// 推荐列表
async function recommendation() {
    return commonGet("/myplus-qing/ug/content/recommendation")
}

// 广场列表
async function square(page = 0) {
    return commonGet(`/myplus-qing/ug/content/square/channel/data?sourceId=moment&sourceType=aggregation&type=content`)
}

// 推荐列表
async function content(id) {
    return commonGet(`/myplus-qing/ug/content/${id}?currentPage=0`)
}

// 点赞
async function like(id) {
    return commonTaskGet(`/myplus-qing/u/like/content/add?id=${id}`)
}

// myplus-muc/u/user/signin
async function commonPost(method, body = {}) {
    return new Promise(resolve => {
        const body = {};
        $.post(taskUrl(method, body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    let dataObj = JSON.parse(data);
                    if (dataObj.code !== 200) {
                        console.log("获取 数据失败 ")
                    }
                    total = dataObj.data.mcoin;
                    resolve(dataObj.data);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function commonTaskPost(method, body = {}) {
    return new Promise(resolve => {
        const body = {};
        $.post(taskUrl(method, body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    console.log(data)
                    let dataObj = JSON.parse(data);
                    resolve(dataObj);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function commonTaskPostBody(method, body = {}) {
    return new Promise(resolve => {
        const data = {
            url: `https://myplus-api.meizu.cn${method}`,
            headers: {
                "Host": "myplus-api.meizu.cn",
                "ANDROID-APP-CHANNEL": "meizu",
                "Origin": "https://carry.m.jd.com",
                "APP-MODE": "1",
                "Connection": "Keep-Alive",
                "Content-Type": "application/json; charset=UTF-8",
                "Accept-Encoding": "gzip",
                "LOCAL-TIME": new Date().getTime(),
                "User-Agent": "android_app_myplus",
                "ANDROID-APP-VERSION_NAME": app_version,
                "ANDROID-APP-VERSION-CODE": "50000042",
                "DARK-MODE": "0",
                "Cookie": cookie
            },
            body: JSON.stringify(body),
            timeout: 10000
        };
        $.post(data, (err, resp, data) => {
            try {
                if (err) {
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    console.log(data)
                    let dataObj = JSON.parse(data);
                    resolve(dataObj);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function commonGet(method, body = {}) {
    return new Promise(resolve => {
        const body = {};
        const data = taskUrl(method, body)
        console.log(data.url)
        $.get(data, (err, resp, data) => {
            try {
                if (err) {
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {

                        let dataObj = JSON.parse(data);
                        if (dataObj.code !== 200) {
                            console.log("获取 数据失败 ")
                        }
                        resolve(dataObj.data);
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

async function commonTaskGet(method, body = {}) {
    return new Promise(resolve => {
        const body = {};
        const data = taskUrl(method, body)
        console.log(data.url)
        $.get(data, (err, resp, data) => {
            try {
                if (err) {
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        console.log(data)
                        let dataObj = JSON.parse(data);
                        resolve(dataObj);
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

function safeGet(data) {
    try {
        if (typeof JSON.parse(data) == "object") {
            return true;
        }
    } catch (e) {
        console.log(e);
        console.log(`访问数据为空，请检查自身设备网络情况`);
        return false;
    }
}

function taskUrl(url_s, body = {}) {
    return {
        url: `https://myplus-api.meizu.cn${url_s}`,
        headers: {
            "Host": "myplus-api.meizu.cn",
            "ANDROID-APP-CHANNEL": "meizu",
            "Origin": "https://carry.m.jd.com",
            "APP-MODE": "1",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip",
            "LOCAL-TIME": new Date().getTime(),
            "User-Agent": "android_app_myplus",
            "ANDROID-APP-VERSION_NAME": app_version,
            "ANDROID-APP-VERSION-CODE": "50000042",
            "DARK-MODE": "0",
            "Cookie": cookie
        },
        timeout: 10000
    }
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
