## 网易严选
### QX(圈叉)使用方法
#### 重写获取ck
打开网易严选app-个人-积分-获取ck
多账号微信打开 https://m.you.163.com/ -个人-积分-获取ck
[MITM]
```
hostname = m.you.163.com
```
[rewrite_local]
```
# 网易严选获取cookie
^https:\/\/m\.you\.163\.com\/xhr\/points\/index.json/? url script-request-header https://raw.githubusercontent.com/xzxxn777/quanx/main/WYYX/WYYX.js
```
#### 活动名：领鸡蛋
活动入口：网易严选app-个人-领鸡蛋

[task_local]
```
2 0,23 * * * https://raw.githubusercontent.com/xzxxn777/quanx/main/WYYX/WYYX.js, tag=网易严选-领鸡蛋, enabled=true
```
#### 活动名：赚积分
活动入口：网易严选app-个人-积分

[task_local]
```
10 0,23 * * * https://raw.githubusercontent.com/xzxxn777/quanx/main/WYYX/WYYX_JF.js, tag=网易严选-积分, enabled=true
```
#### 活动名：严选家园
活动入口：网易严选app-个人-严选家园

[task_local]
```
20 0-23/3 * * * https://raw.githubusercontent.com/xzxxn777/quanx/main/WYYX/WYYX_TOWN.js, tag=网易严选-严选家园, enabled=true
```