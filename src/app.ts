import http from 'http';
import { join } from 'path';
import Koa from 'koa';
import Static from 'koa-static';
import Compress from 'koa-compress';
import Bodyparser from 'koa-bodyparser';
import Router from '@/router';
import { socketServer } from '@/common/socket';
import Log from '@/utils/log';
import Timer from '@/utils/timer';
import Cfg from '@/common/cfg';
import cors from '@/common/cors';
import { cfgInit } from '@/common/cfg/modular';

(async () => {
  await cfgInit();
  const port = Cfg.get('index.port');
  const koa = new Koa();

  //onerror
  koa.on('error', (err) => Log.error(err));

  //init
  koa.use(async (ctx, next) => {
    if (ctx.request.path === '/favicon.ico') return;
    await next();
    if (ctx.request.path === '/') ctx.body = 'Copyright (c) 2021 youliso';
    Log.access(`${ctx.originalUrl} ${ctx.header['x-real-ip'] || '-'} ${ctx.header['user-agent']}`);
  });

  //cors
  const corsOpt = Cfg.get<{ [key: string]: any }>('index.cors');
  const domainWhiteList = Cfg.get<string[]>('index.domainWhiteList');
  koa.use(cors({
    origin: (ctx: Koa.ParameterizedContext) => domainWhiteList[domainWhiteList.indexOf(ctx.header.origin)] || 'false',
    allowMethods: corsOpt.allowMethods,
    allowHeaders: corsOpt.allowHeaders,
    exposeHeaders: corsOpt.exposeHeaders
  }));

  //compress
  koa.use(Compress());

  //bodyparser
  koa.use(Bodyparser());

  //static
  koa.use(Static(join(__dirname, '../resources/static')));

  //timer
  await Timer.start();

  //router
  Router(koa);

  //socket
  const server = http.createServer(koa.callback());
  socketServer.init(server);

  //listen
  server.listen(port, () => {
    console.log(
      `[success] http://127.0.0.1:${port} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
    );
  });
})();
