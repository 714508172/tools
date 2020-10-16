const router = require('koa-router')()
const config = require('../config.js')
const request = require('request-promise')
const fs = require('fs')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: '后台管理'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})






module.exports = router
