const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const router = require('koa-router')()
const koaBody = require('koa-body')

const index = require('./routes/index')
const users = require('./routes/users')
const bannerUpload = require('./routes/bannerUpload')
const bannerDelete = require('./routes/bannerDelete')
const record = require('./routes/record')
const locker = require('./routes/locker')
const news = require('./routes/news')
const fix = require('./routes/fix')
// error handler
onerror(app)

app.use(koaBody({
  multipart:true,
  formidable:{
    maxFieldsSize:200*1024*1024
  }
}))

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(locker.routes(), locker.allowedMethods())
app.use(record.routes(), record.allowedMethods())
app.use(bannerUpload.routes(), bannerUpload.allowedMethods())
app.use(bannerDelete.routes(), bannerDelete.allowedMethods())
app.use(news.routes(), news.allowedMethods())
app.use(fix.routes(), fix.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
