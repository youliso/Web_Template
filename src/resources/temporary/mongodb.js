'use strict';
const Mongodb = require('mongodb');
const MongoClient = Mongodb.MongoClient;
const ObjectID = Mongodb.ObjectID;
const {dbConf} = require('../cfg/config.json');

class Mongodb {

    static getInstance() {
        if (!Mongodb.instance) Mongodb.instance = new Mongodb();
        return Mongodb.instance;
    }

    constructor() {
        this.dbClient = '';
        this.connect();
    }

    connect() {  /*连接数据库*/
        return new Promise((resolve, reject) => {
            if (!this.dbClient) {
                MongoClient
                    .connect(dbConf.url, {useUnifiedTopology: true})
                    .then((e) => {
                        console.log("数据库链接成功");
                        this.dbClient = e.db(dbConf.name);
                        resolve(this.dbClient)
                    })
                    .catch(err => {
                        console.log("数据库链接失败", err.message);
                        reject(err);
                    });
            } else resolve(this.dbClient);
        })
    }

    getObjectId(id) {
        return new ObjectID(id);
    }

    insertOne(collectionName, json) {
        return this.insert(0, collectionName, json)
    }

    insertMany(collectionName, json) {
        return this.insert(1, collectionName, json)
    }

    insert(is, collectionName, json) {
        let type = ['insertOne', 'insertMany'];
        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                db.collection(collectionName)[type[is]](json)
                    .then(req => resolve(req))
                    .catch(err => reject(err))
            })
        })
    }

    removeOne(collectionName, json) {
        return this.remove(0, collectionName, json)
    }

    removeMany(collectionName, json) {
        return this.remove(1, collectionName, json)
    }

    remove(is, collectionName, json) {
        let type = ['removeOne', 'removeMany'];
        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                db.collection(collectionName)[type[is]](json, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                })
            })
        })
    }

    updateOne(collectionName, json1, json2) {
        return this.update(0, collectionName, json1, json2)
    }

    updateMany(collectionName, json1, json2) {
        return this.update(1, collectionName, json1, json2)
    }

    update(is, collectionName, json1, json2) {
        let type = ['updateOne', 'updateMany'];
        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                db.collection(collectionName)[type[is]](json1, {$set: json2})
                    .then(req => resolve(req))
                    .catch(err => reject(err))
            })
        })
    }

    findOne(collectionName, json) {
        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                db.collection(collectionName)
                    .findOne(json)
                    .then(req => resolve(req))
                    .catch(err => reject(err))
            })
        })
    }

    findList(collectionName, json) {
        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                db.collection(collectionName)
                    .find(json)
                    .toArray()
                    .then(req => resolve(req))
                    .catch(err => reject(err))
            })
        })
    }

    page(collectionName, json, options) {
        let req = {
            data: this.findOpt(collectionName, json, options)
        };
        if (options.first === 't') req.count = this.count(collectionName, json);
        return req;
    }

    count(collectionName, json) {
        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                db.collection(collectionName)
                    .find(json[0])
                    .count()
                    .then(req => resolve(req))
                    .catch(err => reject(err))
            })
        })
    }

    findOpt(collectionName, json, options) {
        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                db.collection(collectionName)
                    .find(json[0])
                    .project(json[1])
                    .sort(options.sort)//排序 //按某个字段升序(1)降序(-1)
                    .skip(options.skip)//跳过的条数
                    .limit(options.limit)//查询几条
                    .toArray()
                    .then(req => resolve(req))
                    .catch(err => reject(err))
            })
        })
    }

}


module.exports = Mongodb.getInstance();