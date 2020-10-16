const router = require('koa-router')()
const config = require('../config.js')
const request = require('request-promise')
const fs = require('fs')
let file_id
let lockerList =[]
let toolList =[]
var updateFile_id
let currentTool=[]
let tokenOptions={
  uri:'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' +
  config.appid+'&secret='+config.secret+'',
  json:true
}

let queryOptions

//查询所有
function getQuery(database,access_token){
    return     queryOptions={
                  method:'POST',
                  uri:'https://api.weixin.qq.com/tcb/databasequery?access_token=' + access_token + '',
                  body:{
                    "env":'intellocker-gy0xb',
                    "query":"db.collection(\""+database+"\").get()"
                  },
                  json:true
                }
  }


  function returnQuery(e,access_token,database){
    return     queryOptions={
                  method:'POST',
                  uri:'https://api.weixin.qq.com/tcb/databasequery?access_token=' + access_token + '',
                  body:{
                    "env":'intellocker-gy0xb',
                    "query":"db.collection(\""+database+"\").where({location:\""+e+"\"}).get()"
                  },
                  json:true
                }
  }
  
  
  function add(arr,str){
    return arr.push(str)
  }

//随机ID
  function createNonceStr(n) {
    let res = "";
    let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    // 随机产生
    for (var i = 0; i < n; i++) {
      var id = Math.ceil(Math.random() * 35);
      res += arr[id]
    }
    return res
  }


  //查询工具柜
router.get('/locker',async(ctx)=>{
    //var Num=ctx.query.Num
    //console.log(ctx.query.groupNum) 
    try{
      let{access_token} = await request(tokenOptions)
        console.log(access_token)
  
      //查询借还记录 
      var lockerOption = getQuery('intellocker',access_token)
      var List = await request(lockerOption)
      //console.log(List)
      if(List.pager.Total==0){
        ctx.body = {
          error:0
        }
      }else{
        lockerList=[]
        for(let i =0;i<List.data.length;i++){
          var tempObj=JSON.parse(List.data[i]) 
           add(lockerList,tempObj)
          // console.log(userList)
          //ctx.redirect('/record')
        }
      }
  
    }catch(err){
       console.log(err.stack)
     }
  
     await ctx.render('locker',{
        title:'工具柜管理',
        lockerList:lockerList,
      })

  })




  //添加工具柜
  router.get('/submitAdd',async(ctx)=>{
    var num=ctx.query.num
    var name=ctx.query.name
    var group=ctx.query.group
    console.log(num) 
    try{
      let{access_token} = await request(tokenOptions)
        //console.log(access_token)
  
        var returnLocker=returnQuery(num,access_token,'intellocker')
        var List = await request(returnLocker)
        console.log(List)
        if(List.pager.Total!=0){
          ctx.body = {
            error:0
          }
        }else{
      //数据库插入 
      options={
        method:'POST',
        uri:'https://api.weixin.qq.com/tcb/databaseadd?access_token=' + access_token + '',
        body:{
          "env":'intellocker-gy0xb',
          "query":"db.collection(\"intellocker\").add({data:{group:\""+group+"\",name:\""+name+"\",num:\""+num+"\"}})"
        },
        json:true
      }

      var List = await request(options)


          }
    }catch(err){
       console.log(err.stack)
     }

     
  await ctx.render('locker',{
    title:'添加工具柜',
    lockerList:lockerList,

  })
  })





  //删除工具柜
  router.get('/deleteLocker',async(ctx)=>{
    value = ctx.query.id
    //console.log(_idList[value])
    try{
      let{access_token} = await request(tokenOptions)
       // console.log(lockerList[value])
  
      //删除数据库图片索引
      options={
        method:'POST',
        uri:'https://api.weixin.qq.com/tcb/databasedelete?access_token=' + access_token + '',
        body:{
          "env":'intellocker-gy0xb',
          "query":"db.collection(\"intellocker\").doc(\""+lockerList[value]._id+"\").remove()"
        },
        json:true
      }
      var result = await request(options)
     // console.log(result)
    
    }catch(err){
       console.log(err.stack)
     }
  

       ctx.redirect('/locker')

  })


    //删除工具
    router.get('/deleteTool',async(ctx)=>{
      value = ctx.query.toolid
      lockerid = ctx.query.lockerid

      console.log(lockerid)
      console.log(value )
      try{
        let{access_token} = await request(tokenOptions)
         // console.log(lockerList[value])
    
        //删除数据库图片索引
        options={
          method:'POST',
          uri:'https://api.weixin.qq.com/tcb/databasedelete?access_token=' + access_token + '',
          body:{
            "env":'intellocker-gy0xb',
            "query":"db.collection(\"tools\").doc(\""+toolList[value]._id+"\").remove()"
          },
          json:true
        }
        var result = await request(options)
       // console.log(result)
      
      }catch(err){
         console.log(err.stack)
       }
    
  
         ctx.redirect('/lockerDetail?id='+lockerid)
  
     })



  //查询所属工具柜工具信息

  router.get('/lockerDetail',async(ctx)=>{
    value = ctx.query.id
    //console.log(ctx.query.groupNum) 
    try{
      let{access_token} = await request(tokenOptions)
       // console.log(lockerList[value].num)
  
      //查询当前工具柜工具
      var listOption = returnQuery(lockerList[value].num,access_token,'tools')
      var tl = await request(listOption)
     //console.log(tl)

        toolList=[]
        for(let i =0;i<tl.data.length;i++){
          var tempObj=JSON.parse(tl.data[i]) 
           add(toolList,tempObj)
          // console.log(userList)
          //ctx.redirect('/record')
        }
       // console.log(toolList)
    }catch(err){
       console.log(err.stack)
     }
  
     await ctx.render('lockerDetail',{
        title:'工具详情',
        toolList:toolList,
        value:value
      })

  })


//上传工具图片
  router.post('/uploadToolPic',async(ctx)=>{
    var files = ctx.request.files
    var file = files.file
   // console.log(params) 
   //console.log(files) 
    try{
      let{access_token} = await request(tokenOptions)
      let fileName = file.name
      let filePath = `toolPhoto/${fileName}`
        //console.log(access_token)
  
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
         file_id = res.file_id

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
 
  await ctx.render('locker',{
    title:'删除图片',
    lockerList:lockerList,

  })
  })


       //新增工具
       router.get('/handleAddTool',async(ctx)=>{
        var num=ctx.query.num
        var name=ctx.query.name
        var category=ctx.query.category
        var description=ctx.query.description
        var unit=ctx.query.unit
        var radioValue=ctx.query.radioValue
        var addpic = file_id
        var value =ctx.query.value
        var location = lockerList[value].num
        var fixAmount=0
        //console.log(value) 
        //console.log(lockerList[value].num) 
       // console.log(file_id) 
        try{
          let{access_token} = await request(tokenOptions)
            //console.log(access_token)
      
          let toolID=  createNonceStr(5)
  
  
  
          //数据库插入 
          options={
            method:'POST',
            uri:'https://api.weixin.qq.com/tcb/databaseadd?access_token=' + access_token + '',
            body:{
              "env":'intellocker-gy0xb',
              "query":"db.collection(\"tools\").add({data:{addpic:\""+addpic+"\",name:\""+name+"\",num:\""+num+"\",category:\""+category+"\",description:\""+description+"\",fixAmount:\""+fixAmount+"\",location:\""+location+"\",radioValue:\""+radioValue+"\",toolID:\""+toolID+"\",unit:\""+unit+"\"}})"
            },
            json:true
          }
    
          var List = await request(options)

    
  
        }catch(err){
           console.log(err.stack)
         }
    
         
      await ctx.render('locker',{
        title:'添加工具柜',
        lockerList:lockerList,
    
      })
      })


        //获得当前工具信息
      router.get('/updateTool',async(ctx)=>{
        value = ctx.query.toolid
        //console.log(toolList[value].toolID) 
        var toolID = toolList[value].toolID
        try{
          let{access_token} = await request(tokenOptions)
           // console.log(lockerList[value].num)
      
          //查询当前工具
          var currentOption ={
            method:'POST',
            uri:'https://api.weixin.qq.com/tcb/databasequery?access_token=' + access_token + '',
            body:{
              "env":'intellocker-gy0xb',
              "query":"db.collection(\"tools\").where({toolID:\""+toolID+"\"}).get()"
            },
            json:true
          }
          var ct = await request(currentOption)
        // console.log(tl)
    
         currentTool=[]
            for(let i =0;i<ct.data.length;i++){
              var tempObj=JSON.parse(ct.data[i]) 
               add(currentTool,tempObj)
              // console.log(userList)
              //ctx.redirect('/record')
            }
           // console.log(currentTool)
        }catch(err){
           console.log(err.stack)
         }
      
         await ctx.render('updateTool',{
            title:'工具更新',
            currentTool:currentTool,
          })
    
      })


      //   更新工具

      router.get('/handleUpdataTool',async(ctx)=>{
        var num=ctx.query.num
        var name=ctx.query.name
        var category=ctx.query.category
        var description=ctx.query.description
        var unit=ctx.query.unit
        var radioValue=ctx.query.radioValue
        var addpic = updateFile_id
        var value =ctx.query.value
        let id = toolList[value]._id
        //var location = lockerList[value].num
        //console.log(toolList[value].toolID) 
       // var toolID = toolList[value].toolID
        try{
          let{access_token} = await request(tokenOptions)
           // console.log(lockerList[value].num)
           var currentOption
          //更新当前工具
          if(addpic==null){
             currentOption ={
              method:'POST',
              uri:'https://api.weixin.qq.com/tcb/databaseupdate?access_token=' + access_token + '',
              body:{
                "env":'intellocker-gy0xb',
                "query":"db.collection(\"tools\").doc(\""+id+"\").update({data:{category:\""+category+"\",description:\""+description+"\",name:\""+name+"\",num:\""+num+"\",radioValue:\""+radioValue+"\",unit:\""+unit+"\"}})"
              },
              json:true
            }
            }else{
               currentOption ={
                method:'POST',
                uri:'https://api.weixin.qq.com/tcb/databaseupdate?access_token=' + access_token + '',
                body:{
                  "env":'intellocker-gy0xb',
                  "query":"db.collection(\"tools\").doc(\""+id+"\").update({data:{category:\""+category+"\",description:\""+description+"\",name:\""+name+"\",num:\""+num+"\",radioValue:\""+radioValue+"\",unit:\""+unit+"\",addpic:\""+addpic+"\"}})"
                },
                json:true
              }
            }
           // console.log(currentOption)
 
          var ct = await request(currentOption)

        }catch(err){
           console.log(err.stack)
         }
    
      })





      //更新工具时含图片处理  handleUpdatePic

      router.post('/handleUpdatePic', async (ctx, next) => {
        var files = ctx.request.files
        //console.log(ctx.request) 
        var file = files.file
        //console.log(file.name)
       try{
         //接口调用凭证 和请求
      
        let{access_token} = await request(tokenOptions)
        let fileName = file.name
        let filePath = `toolPhoto/${fileName}`
        
      
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
         updateFile_id = res.file_id
      

      
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


  router.get('/addLocker',async(ctx)=>{
    await ctx.render('addLocker',{
      title:'工具柜管理'
  
    })
  })


  router.get('/addTool',async(ctx)=>{
    await ctx.render('addTool',{
      title:'增加工具'
  
    })
  })

  
  module.exports = router

