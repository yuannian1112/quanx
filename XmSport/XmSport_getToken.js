const bodyName = '小米运动获取token'

if ($response.body) {
    const body = JSON.parse($response.body);
    const loginToken = body.token_info.login_token;
    if ($persistentStore.read('xmSportsToken')) {
        $notification.post(bodyName, '更新Token: 成功🎉', ``);
    } else {
        $notification.post(bodyName, '获取Token: 成功🎉', '');
    }
    $persistentStore.write(loginToken, 'xmSportsToken');
}

$done({})