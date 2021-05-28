const http=require('http');
const fs=require('fs');
const request=require('request');
const path=require('path');
const config=require('./config');
const analyze=require('./analyze');

/***
 * 获取当前页的图片,采用读取html dom的方式，Promise的写法
 * @param pageSize
 * @param pageNumber
 * @returns {Promise<unknown>}
 */
function start(option){
  return new Promise(function (resolve, reject) {
    request(option,function(err,res,body){
      let arr = []
      if(!err && res){
        analyze.findImg(body,(imgSrc,downloadUrl,i)=>{
          if(imgSrc.search("http")!==-1) {
            arr.push({
              previewUrl: imgSrc,
              downloadUrl: downloadUrl,
              process: 0,
            })
          }
        });
      }
      resolve({
        url: option,
        arr: arr
      })
    })
  })
}
/***
 * 获取当前页的图片,采用读取html Post.register的方法（相比dom可以获取更多信息），Promise的写法
 * @returns {Promise<unknown>}
 */
function startForPost(option, p){
  return new Promise(function (resolve, reject) {
    request(option,function(err,res,body){
      let arr = [],str = '',resArr = []
      str = body.toString()
      arr = str.match(/Post.register\(\{([\s\S]*?)\}\)/g)
      arr.forEach(res => {
        let result = res.toString().replace(/Post.register\(\{/g,'').replace(/\}\)/g,'')
        resArr.push(JSON.parse('{'+result+'}'))
      })
      resolve(resArr)
    })
  })
}
/***
 * 获取当前页的图片,采用读取html dom的方式，回调的写法
 * @param pageSize
 * @param pageNumber
 * @returns {Promise<unknown>}
 */
function startForBack(option, callback){
    request(option,function(err,res,body){
      let arr = []
      if(!err && res){
        analyze.findImg(body,(imgSrc,downloadUrl,i)=>{
          if(imgSrc.search("http")!==-1) {
            arr.push({
              previewUrl: imgSrc,
              downloadUrl: downloadUrl,
              process: 0,
            })
          }
        });
      }
      callback({
        url: option,
        arr: arr
      })
    })
}
function requestWay(option, callback){
  startForPost(option).then(res => {
    callback(null,res)
  })
}
/***
 * 获取多页
 * @param pageSize
 * @param pageNumber
 * @param requestType 1:读取dom，2：读取中的js，3：使用接口
 */
function getPageList(pageSize, pageNumber, requestType, key) {
  return new Promise(function (resolve, reject) {
    // 当前网页每页图片数
    let nowWebPageSize = 9
    // 网页x页 == app一页
    let x = pageSize/nowWebPageSize
    // 需要请求的开始页码
    let startPage = 1 + (pageNumber-1)*x
    let urlList = []
    const mapLimit = require('async/mapLimit')
    key = key.replace(/ /g,'+')
    if(requestType === 1) {
    }else if (requestType === 2) {
      // 弃用
      for(let i = startPage ; i <= startPage + x -1 ; i++) {
        urlList.push(config.url + '&page=' + i + '&limit=' + pageSize + '&tags=' + key)
      }
      mapLimit(urlList, 100, requestWay, function(err, result){
        if(err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
    }else if (requestType === 3) {
      urlList.push(config.apiUrl + '&page=' + pageNumber + '&limit=' + pageSize + '&tags=' + key)
      mapLimit(urlList, 100, requestKonachanApi, function(err, result){
        if(err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
    }
  })
}
/***
 *
 * @param imgUrl
 * @param i
 */
function downLoad(imgUrl,i){
  let ext=imgUrl.split('.').pop();

  request(imgUrl).pipe(fs.createWriteStream(path.join(config.imgDir,i+'.'+ext),{

    'enconding':'binary'
  }))
}


/***
 * 请求api方法
 * @param pageSize
 * @param pageNumber
 * @returns {Promise<unknown>}
 */
function requestKonachanApi(option, callback){
  request(option,function(err,res,body){
    console.log(body);
    callback(null, eval("("+body+")"))
  })
}
/***
 * 请求首页，获取总图片数,弃用
 * @param pageSize
 * @param pageNumber
 * @returns {Promise<unknown>}
 */
function getSum(){
  return new Promise(function (resolve, reject) {
    request(config.indexUrl, function (err, res, body) {
      console.log(body);
      let str = body.match(/Serving([\s\S]*?)posts/g)[0].toString().replace(/Serving|posts| |,/g,'')
      resolve(str)
    })
  })
}
/***
 * 请求首页，获取总图片数,弃用
 * @param pageSize
 * @param pageNumber
 * @returns {Promise<unknown>}
 */
function getSumBYRequestXml(pageSize,key){
  return new Promise(function (resolve, reject) {
    key = key.replace(/ /g,'+')
    request(config.apiUrlForXml+'&tags='+key, function (err, res, body) {
      console.log('总页数',body);
      let xml = new DOMParser().parseFromString(body, "text/xml")
      let posts = xml.getElementsByTagName('posts')
      let count = posts[0].attributes['count'].value
      let page = Math.ceil(count/pageSize)
      resolve(page)
    })
  })
}
 export {start, getPageList, getSum, getSumBYRequestXml}
