import { readFile } from '@/lib/file';
import { resolve, basename } from 'path';
type Obj<Value> = {} & {
  [key: string]: Value | Obj<Value>;
};

/**
 * Cfg
 */
export class Cfg {
  private static instance: Cfg;

  public sharedObject: { [key: string]: any } = {};

  static getInstance() {
    if (!Cfg.instance) Cfg.instance = new Cfg();
    return Cfg.instance;
  }

  constructor() {}

  async setCfg(path: string) {
    let req = (await readFile(resolve(path), { encoding: 'utf-8' })) as string;
    if (req) this.sharedObject[basename(path, '.json')] = JSON.parse(req);
    else console.error('setCfg error');
  }

  get<Value>(key: string): Value | undefined {
    if (key === '') {
      console.error('Invalid key, the key can not be a empty string');
      return;
    }

    if (!key.includes('.') && Object.prototype.hasOwnProperty.call(this.sharedObject, key)) {
      return this.sharedObject[key] as Value;
    }

    const levels = key.split('.');
    let cur = this.sharedObject;
    for (const level of levels) {
      if (Object.prototype.hasOwnProperty.call(cur, level)) {
        cur = cur[level] as unknown as Obj<Value>;
      } else {
        return;
      }
    }

    return cur as unknown as Value;
  }

  set<Value>(key: string, value: Value): void {
    if (key === '') {
      console.error('Invalid key, the key can not be a empty string');
      return;
    }

    if (!key.includes('.')) {
      if (Object.prototype.hasOwnProperty.call(this.sharedObject, key)) {
        console.warn(`The key ${key} looks like already exists on obj.`);
      }
      this.sharedObject[key] = value;
    }

    const levels = key.split('.');
    const lastKey = levels.pop()!;

    let cur = this.sharedObject;
    for (const level of levels) {
      if (Object.prototype.hasOwnProperty.call(cur, level)) {
        cur = cur[level];
      } else {
        console.error(`Cannot set value because the key ${key} is not exists on obj.`);
        return;
      }
    }

    if (typeof cur !== 'object') {
      console.error(`Invalid key ${key} because the value of this key is not a object.`);
      return;
    }
    if (Object.prototype.hasOwnProperty.call(cur, lastKey)) {
      console.warn(`The key ${key} looks like already exists on obj.`);
    }
    cur[lastKey] = value;
  }
}

export default Cfg.getInstance();
