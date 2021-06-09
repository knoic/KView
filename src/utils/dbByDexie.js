import Dexie from 'dexie'
const config=require('./config');
var db = new Dexie("test_db");

db.version(1).stores({
  tags: 'id,name,count,type,ambiguous',
});
db.open()

const request=require('request');

//写入一些数据
const tag = require('./tag')
// getTagByApi().then(res => {
db.tags.bulkAdd(tag.tagList).then (function(){
  //当数据存储完成后 我们可以读取它
  console.log('存储完成');
}).then(function (data) {
  console.log('新增完成');
}).catch(function(error) {
  console.log("error: " + error);
  db.close()
});

function getTagByApi(option){
  return new Promise(function (resolve, reject) {
    request(config.tagUrl,function(err,res,body){
      const tag = eval("("+body+")")
      resolve(tag)
    })
  })
}
export {db}
