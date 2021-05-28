const cheerio=require('cheerio');
const fs=require('fs');
function findImg(dom,Callback){
  let $=cheerio.load(dom);
  // console.log(dom);
  $('img').each(function(i,elem){
    let imgSrc=$(this).attr('src');
    let downloadUrl = 'https://konachan.net'+$(this).parent().attr('href')
    Callback(imgSrc,downloadUrl,i);
  });
}
module.exports.findImg=findImg;
