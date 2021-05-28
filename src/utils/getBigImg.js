const http=require('http');
const fs=require('fs');
const cheerio=require('cheerio');
const request=require('request');

/***
 * 请求包含大图地址的网页
 * @param downloadUrl
 * @returns {Promise<unknown>}
 */
function getBigImg(downloadUrl){
  return new Promise(function (resolve, reject) {
    request(downloadUrl,function(err,res,body) {
      findRealDownloadUrl(body,res => {
        resolve(res)
      })
    })
  })
}

/***
 * 获取真实大图下载地址
 * @param dom
 * @param Callback
 */
function findRealDownloadUrl(dom,Callback){
  let $=cheerio.load(dom);
  const element = $('a#png')
  if(element.length == 0) {
    Callback($('a#highres').attr('href'))
  }else {
    Callback(element.attr('href'))
  }
}
export {getBigImg}
