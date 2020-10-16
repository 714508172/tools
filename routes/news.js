const router = require('koa-router')()
const config = require('../config.js')
const request = require('request-promise')
const fs = require('fs')

let newPic
let tokenOptions={
    uri:'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' +
    config.appid+'&secret='+config.secret+'',
    json:true
  }

  

router.get('/news',async(ctx)=>{
    await ctx.render('news',{
      title:'公告',
    })
  })




  //主体提交
  router.get('/submitNews',async(ctx)=>{
    var title=ctx.query.title
    var content=ctx.query.content

   // console.log(title,content)
    try{

      let{access_token} = await request(tokenOptions)

      if(newPic==null){
        newPic=''
        let now = new Date().toLocaleString()
        options={
          method:'POST',
          uri:'https://api.weixin.qq.com/tcb/databaseadd?access_token=' + access_token + '',
          body:{
            "env":'intellocker-gy0xb',
            "query":"db.collection(\"news\").add({data:{title:\""+title+"\",content:\""+content+"\",titlePic:\""+newPic+"\",date:\""+now+"\"}})"
          },
          json:true
        }
        var List = await request(options)
       // console.log(List)
      }else{
        let now = new Date().toLocaleString()
        options={
            method:'POST',
            uri:'https://api.weixin.qq.com/tcb/databaseadd?access_token=' + access_token + '',
            body:{
              "env":'intellocker-gy0xb',
              "query":"db.collection(\"news\").add({data:{title:\""+title+"\",content:\""+content+"\",titlePic:\""+newPic+"\",date:\""+now+"\"}})"
            },
            json:true
          }
          var List = await request(options)
         // console.log(List)
      }

    }catch(err){
        console.log(err.stack)
      }
      newPic=''
  })

  router.post('/uploadNewsPic', async (ctx, next) => {
    var files = ctx.request.files
    //console.log(ctx.request) 
    var file = files.file
    //console.log(file.name)
   try{
     //接口调用凭证 和请求
  
    let{access_token} = await request(tokenOptions)
    let fileName = file.name
    let filePath = `newsPic/${fileName}`
    
  
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
     newPic = res.file_id
  

  
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