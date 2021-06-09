const url='https://konachan.net/post?tags=';//填写自己请求的具体的网址
const apiUrl='https://konachan.net/post.json?';//填写自己请求的具体的网址
const apiUrlForXml='https://konachan.net/post.xml?limit=1&';//填写自己请求的具体的网址
const tagUrl='https://konachan.net/tag.json?limit=999999';//填写自己请求的具体的网址
const indexUrl='https://konachan.net';//填写自己请求的具体的网址
const path=require('path');
const imgDir=path.join(__dirname,'img');
module.exports.url=url;
module.exports.apiUrl=apiUrl;
module.exports.indexUrl=indexUrl;
module.exports.imgDir=imgDir;
module.exports.tagUrl=tagUrl;
module.exports.apiUrlForXml=apiUrlForXml;
