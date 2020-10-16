const router = require('koa-router')()
const config = require('../config.js')
const request = require('request-promise')
const fs = require('fs')
var picList=[]
let tokenOptions={
  uri:'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' +
  config.appid+'&secret='+config.secret+'',
  json:true
}


router.get('/bannerUpload',async(ctx)=>{
  await ctx.render('bannerUpload',{
    title:'图片上传',
    picList:picList
  })
})


router.post('/uploadPic', async (ctx, next) => {
     var files = ctx.request.files
     //console.log(ctx.request) 
     var file = files.file
     //console.log(file.name)
    try{
      //接口调用凭证 和请求
   
     let{access_token} = await request(tokenOptions)
     let fileName = file.name
     let filePath = `banner/${fileName}`
     
   
     //文件上传请求
     options={
       method:'POST',
       uri:'https://api.weixin.qq.com/tcb/uploadfile?access_token=' + access_token + '',
       body:{
         "env":'intellocker-gy0xb',
         "path":filePath
       },
       json:true
     }
     let res = await request(options)
     let file_id = res.file_id
   
   //同时进行数据库插入操作
   options={
     method:'POST',
     uri:'https://api.weixin.qq.com/tcb/databaseadd?access_token=' + access_token + '',
     body:{
       "env":'intellocker-gy0xb',
       "query":"db.collection(\"banner\").add({data:{fileId:\""+file_id+"\"}})"
     },
     json:true
   }
   
   await request(options)
   
     options={
       method:'POST',
       uri:res.url,
       formData:{
         "Signature":res.authorization,
         "key":filePath,
         "x-cos-security-token":res.token,
         "x-cos-meta-fileid":res.cos_file_id,
         "file":{
           value:fs.createReadStream(file.path),
           options:{
             filename:fileName,
             contentType:file.type
           }
         }
       }
     }
   
     await request(options);
     ctx.body = res
   
   }catch(err){
     console.log(err.stack)
   }
     
   })
   
   
   
   
   
   module.exports = router
   