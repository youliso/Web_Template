'use strict';
const Router = require('koa-router');
const user = new Router();
const UserInfo = require('../info/user');

user.post('/login', async (ctx, next) => {
    ctx.body = ctx.result.success('测试');
    await next();
});

user.post('/register', async (ctx, next) => {
    ctx.body = ctx.result.success('测试');
    await next();
});

module.exports = user;
