import Koa from 'koa';
import Router from 'koa-router';
import { routes, ProtocolType } from '@/common/decorators';
import { socketServer } from '@/common/socket';

export * from './modular'; //载入模块

const httpRouters = new Router();
const socketRouters: { [key: string]: Function[] } = {};

/**
 * 初始化路由
 */
export default (app: Partial<Koa.DefaultState & Koa.DefaultContext>) => {
  routes.forEach((route) => {
    // 获取每个路由的前缀
    const prefix = route.constructor.prefix;
    let path = route.path;
    if (prefix) path = `${prefix}${path}`;

    // 创建路由
    switch (route.protocol) {
      case ProtocolType.HTTP:
        console.log('[modular|http]', path);
        httpRouters[route.method](path, ...route.middleware, route.handler);
        break;
      case ProtocolType.SOCKET:
        console.log('[modular|socket]', path);
        socketRouters[path] = [...route.middleware, route.handler];
        break;
    }
  });

  socketServer.setRouters(socketRouters);
  app.use(httpRouters.routes()).use(httpRouters.allowedMethods()); // 路由装箱
};
