const router = require('koa-router')()
const config = require('../config.js')
const request = require('request-promise')
var userList=[]
var value
const fs = require('fs')
let tokenOptions={
  uri:'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' +
  config.appid+'&secret='+config.secret+'',
  json:true
}


function returnUpdate(e,access_token,boo){
  return     queryOptions={
                method:'POST',
                uri:'https://api.weixin.qq.com/tcb/databaseupdate?access_token=' + access_token + '',
                body:{
                  "env":'intellocker-gy0xb',
                  "query":"db.collection(\"users\").where({num:\""+e+"\"}).update({data:{admin:\""+boo+"\"}})"
                },
                json:true
              }
}

function add(arr,str){
  return arr.push(str)
}

//设置管理员
router.get('/set',async(ctx)=>{
  value = ctx.query.id
  var num = userList[value].num
  //console.log(_idList[value])
  try{
    let{access_token} = await request(tokenOptions)
      //console.log(access_token)

    //修改admin
    var uOption = returnUpdate(num,access_token,true)
    var result = await request(uOption)
    console.log(result)
  
   if(result){
    ctx.redirect('/users')
   }
  }catch(err){
     console.log(err.stack)
   }

   
})


//取消

router.get('/cancel',async(ctx)=>{
  value = ctx.query.id
  var num = userList[value].num
  //console.log(_idList[value])
  try{
    let{access_token} = await request(tokenOptions)
      //console.log(access_token)

    //修改admin
    var cOption = returnUpdate(num,access_token,false)
    var result = await request(cOption)
    console.log(result)
  
   if(result){
    ctx.redirect('/users')
   }
  }catch(err){
     console.log(err.stack)
   }

   
})

//返回用户信息
router.get('/users',async(ctx)=>{
  try{
    let{access_token} = await request(tokenOptions)
      //console.log(access_token)


    //查询图片数据库
    options={
      method:'POST',
      uri:'https://api.weixin.qq.com/tcb/databasequery?access_token=' + access_token + '',
      body:{
        "env":'intellocker-gy0xb',
        "query":"db.collection(\"users\").get()"
      },
      json:true
    }
    List = await request(options)
  
    userList=[]

    for(let i =0;i<List.data.length;i++){
      var tempObj=JSON.parse(List.data[i]) 
       add(userList,tempObj)
      // console.log(_idList)
       //console.log(array)
    }


  }catch(err){
     console.log(err.stack)
   }


  await ctx.render('users',{
    title:'用户管理',
    userList:userList,

  })
})
   
   
   
   
   
   module.exports = router
   