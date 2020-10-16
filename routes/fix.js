const router = require('koa-router')()
const config = require('../config.js')
const request = require('request-promise')
const fs = require('fs')
var array
let currentToolFix=[]

let tokenOptions={
  uri:'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' +
  config.appid+'&secret='+config.secret+'',
  json:true
}


function add(arr,str){
  return arr.push(str)
}


router.get('/fixDetail',async(ctx)=>{
  value = ctx.query.id
 // console.log(array[value]) 
  var id = array[value]._id
  try{
    let{access_token} = await request(tokenOptions)
     // console.log(lockerList[value].num)

    //查询当前工具
    var currentOption ={
      method:'POST',
      uri:'https://api.weixin.qq.com/tcb/databasequery?access_token=' + access_token + '',
      body:{
        "env":'intellocker-gy0xb',
        "query":"db.collection(\"toolFix\").where({_id:\""+id+"\"}).get()"
      },
      json:true
    }
    var ct = await request(currentOption)
  // console.log(tl)

  currentToolFix=[]
      for(let i =0;i<ct.data.length;i++){
        var tempObj=JSON.parse(ct.data[i]) 
         add(currentToolFix,tempObj)
        // console.log(userList)
        //ctx.redirect('/record')
      }
     // console.log(currentTool)
  }catch(err){
     console.log(err.stack)
   }

   await ctx.render('fixDetail',{
      title:'详情',
      currentToolFix:currentToolFix,
    })

})



router.get('/fix',async(ctx)=>{
  try{
    let{access_token} = await request(tokenOptions)
      //console.log(access_token)


    //查询数据库
    options={
      method:'POST',
      uri:'https://api.weixin.qq.com/tcb/databasequery?access_token=' + access_token + '',
      body:{
        "env":'intellocker-gy0xb',
        "query":"db.collection(\"toolFix\").get()"
      },
      json:true
    }
    fixList = await request(options)
  
    array=[]
    for(let i =0;i<fixList.data.length;i++){
      var tempObj=JSON.parse(fixList.data[i]) 
       add(array,tempObj)
    }

  }catch(err){
     console.log(err.stack)
   }


  await ctx.render('fix',{
    title:'工具报修',
    array:array,

  })
})


router.get('/handlefixed',async(ctx)=>{
  value = ctx.query.value
  // console.log(array[value]) 
   var id = array[value]._id
   var brrowID = array[value].borrowID
  try{
    let{access_token} = await request(tokenOptions)
     // console.log(lockerList[value].num)
     var currentOption
     var status = '未归还'
     var showStatus = '已处理'
    //更新当前工具

       currentOption ={
        method:'POST',
        uri:'https://api.weixin.qq.com/tcb/databaseupdate?access_token=' + access_token + '',
        body:{
          "env":'intellocker-gy0xb',
          "query":"db.collection(\"borrow\").doc(\""+brrowID+"\").update({data:{status:\""+status+"\"}})"
        },
        json:true
      }
     // console.log(currentOption)

    var ct = await request(currentOption)

    Option ={
      method:'POST',
      uri:'https://api.weixin.qq.com/tcb/databaseupdate?access_token=' + access_token + '',
      body:{
        "env":'intellocker-gy0xb',
        "query":"db.collection(\"toolFix\").doc(\""+id+"\").update({data:{status:\""+showStatus+"\"}})"
      },
      json:true
    }
    var returnList = await request(Option)

  }catch(err){
     console.log(err.stack)
   }
   await ctx.render('fixDetail',{
    currentToolFix:currentToolFix,
  })
})




module.exports = router
