let request = window.indexedDB.open('myDatabase')
const requestApi =require('request');
const config=require('./config');
let usersObjectStore
request.onerror = (event) => {
  console.log(event)
}
// 数据库操作一切正常，所有操作后触发
request.onsuccess = (event) => {
  let db = event.target.result
  // 数据读取
  let usersObjectStore = db.transaction('tag').objectStore('tag')
  let userRequest = usersObjectStore.get(1)
  userRequest.onsuccess = function (event) {
    console.log(event.target.result)
  }
}
// 创建一个新的数据库或者修改数据库版本号时触发
request.onupgradeneeded = (event) => {
  let db = event.target.result
  // 创建对象仓库用来存储数据，把id作为keyPath，keyPath必须保证不重复，相当于数据库的主键
  let objectStore = db.createObjectStore('tag', { keyPath: 'id'})
  // 建立索引，name和age可能重复，因此unique设置为false
  // objectStore.createIndex('name', 'name', {unique: false})
  objectStore.createIndex('id', 'id', {unique: false})
  objectStore.createIndex('name', 'name', {unique: false})
  objectStore.createIndex('count', 'count', {unique: false})
  objectStore.createIndex('type', 'type', {unique: false})
  objectStore.createIndex('ambiguous', 'ambiguous', {unique: false})
  // 确保在插入数据前对象仓库已经建立
  objectStore.transaction.oncomplete = () => {
    // 将数据保存到数据仓库
    firstLoad(db).then()
  }
}
function firstLoad(db){
  return new Promise(function (resolve, reject) {
    // const tag = require('./tag')
    getTagByApi().then(res => {
      usersObjectStore = db.transaction('tag', 'readwrite').objectStore('tag')
      const mapLimit = require('async/mapLimit')
      mapLimit(res, 100, addTag, function(err, result){
        if(err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
    })


  })
}
function getTagByApi(option){
  return new Promise(function (resolve, reject) {
    requestApi(config.tagUrl,function(err,res,body){
      const tag = eval("("+body+")")
      resolve(tag)
    })
  })
}
function addTag(option, callback) {
  // console.log('---',option);
  callback(null,usersObjectStore.add(option))
}
function db(){
  console.log(request);
}
export {db}
