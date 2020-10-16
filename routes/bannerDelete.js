const router = require('koa-router')()
const config = require('../config.js')
const request = require('request-promise')
var array = []
var _idList=[]
var fileIdList=[]
var value
const fs = require('fs')
let tokenOptions={
  uri:'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' +
  config.appid+'&secret='+config.secret+'',
  json:true
}

function sp(str){
  return str.split("/")
}

function add(arr,str){
  return arr.push(str)
}

router.get('/delete',async(ctx)=>{
  value = ctx.query.id
  //console.log(_idList[value])
  try{
    let{access_token} = await request(tokenOptions)
      //console.log(access_token)

    //删除数据库图片索引
    options={
      method:'POST',
      uri:'https://api.weixin.qq.com/tcb/databasedelete?access_token=' + access_token + '',
      body:{
        "env":'intellocker-gy0xb',
        "query":"db.collection(\"banner\").doc(\""+_idList[value]+"\").remove()"
      },
      json:true
    }
    var result = await request(options)
   // console.log(result)
  
    //删除云存储图片

         options={
       method:'POST',
       uri:'https://api.weixin.qq.com/tcb/batchdeletefile?access_token=' + access_token + '',
       body:{
         "env":'intellocker-gy0xb',
         "fileid_list":fileIdList[value]
       },
       json:true
     }
     var res = await request(options)
     //console.query(res)
  }catch(err){
     console.log(err.stack)
   }

   if(res){
     ctx.redirect('/bannerDelete')
   }
})


//图片查询

router.get('/bannerDelete',async(ctx)=>{
  try{
    let{access_token} = await request(tokenOptions)
      //console.log(access_token)


    //查询图片数据库
    options={
      method:'POST',
      uri:'https://api.weixin.qq.com/tcb/databasequery?access_token=' + access_token + '',
      body:{
        "env":'intellocker-gy0xb',
        "query":"db.collection(\"banner\").get()"
      },
      json:true
    }
    picList = await request(options)
  
    array=[]
    _idList=[]
    fileIdList=[]
    for(let i =0;i<picList.data.length;i++){
      var tempObj=JSON.parse(picList.data[i]) 
       var fileId=tempObj.fileId
       var _id = tempObj._id
       var list = sp(fileId)
       add(_idList,_id)
       add(fileIdList,fileId)
       add(array,list[list.length-1])
      // console.log(_idList)
       //console.log(array)
    }


  }catch(err){
     console.log(err.stack)
   }


  await ctx.render('bannerDelete',{
    title:'删除图片',
    array:array,

  })
})



   
   
   
   
   
   module.exports = router
   