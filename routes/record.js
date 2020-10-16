const router = require('koa-router')()
const config = require('../config.js')
const request = require('request-promise')
const fs = require('fs')
let recordList =[]
let tokenOptions={
  uri:'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' +
  config.appid+'&secret='+config.secret+'',
  json:true
}

let queryOptions

function returnQuery(e,access_token,ways){
  return     queryOptions={
                method:'POST',
                uri:'https://api.weixin.qq.com/tcb/databasequery?access_token=' + access_token + '',
                body:{
                  "env":'intellocker-gy0xb',
                  "query":"db.collection(\"borrow\").where({"+ways+":\""+e+"\"}).get()"
                },
                json:true
              }
}

function add(arr,str){
  return arr.push(str)
}

//查询借还记录
router.get('/findrecord',async(ctx)=>{
  var Num=ctx.query.Num
  var method=ctx.query.method

  console.log(Num) 
  try{
    let{access_token} = await request(tokenOptions)
      //console.log(access_token)

    //查询借还记录 
    var adminOption = returnQuery(Num,access_token,method)
    var List = await request(adminOption)
      //console.log(List)
    if(List.pager.Total==0){
      ctx.body = {
        error:0
      }
    }else{
      recordList=[]
      for(let i =0;i<List.data.length;i++){
        var tempObj=JSON.parse(List.data[i]) 
         add(recordList,tempObj)
        // console.log(userList)
        ctx.redirect('/record')
      }
    }

  }catch(err){
     console.log(err.stack)
   }

})

router.get('/record',async(ctx)=>{
  userList:[]
  await ctx.render('record',{
    title:'记录查询',
    recordList:recordList,
  })
})




module.exports = router
