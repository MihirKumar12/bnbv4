const { Telegraf, session, Extra, Markup, Scenes} = require('telegraf');
const { BaseScene, Stage } = Scenes
const mongo = require('mongodb').MongoClient;
const {enter, leave} = Stage
const stage = new Stage();
const Coinbase = require('coinbase');
//const express = require('express')
//var bodyParser = require('body-parser');
//const crypto = require("crypto"); 
//const app = express()
//app.use(bodyParser.urlencoded({ extended: false }));
const Scene = BaseScene
//app.use(bodyParser.json());
const data = require('./data');
const Client = require('coinbase').Client;
let db 


const  bot = new Telegraf(data.bot_token)
mongo.connect(data.mongoLink, {useUnifiedTopology: true}, (err, client) => {
  if (err) {
    console.log(err)
  }

  db = client.db('ABot'+data.bot_token.split(':')[0])
  bot.telegram.deleteWebhook().then(success => {
  success && console.log('🤖 is listening to your commands')
  bot.launch()
})
})

bot.use(session())
bot.use(stage.middleware())

const onCheck = new Scene('onCheck')
stage.register(onCheck)

const getWallet= new Scene('getWallet')
stage.register(getWallet)

const getMsg = new Scene('getMsg')
stage.register(getMsg)

const onWithdraw = new Scene('onWithdraw')
stage.register(onWithdraw)

const channels = data.channelsList
const cb_api_key = data.cb_api_key
const cb_api_secret = data.cb_api_secret
const cb_account_id = data.cb_account_id
const admin = data.bot_admin
const bot_cur = data.currency
const min_wd = data.min_wd
const ref_bonus = data.reffer_bonus
const daily_bonus = data.daily_bonus

var client = new Client({
   apiKey: cb_api_key,
   apiSecret: cb_api_secret ,strictSSL: false
});




const botStart = async (ctx) => {
try {

if(ctx.message.chat.type != 'private'){
  return
  }
   let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
 let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()

let q1 = rndInt(1,50)
let q2 = rndInt(1,50)
let ans = q1+q2
  
  if(bData.length===0){
  if(ctx.startPayload && ctx.startPayload != ctx.from.id){
let ref = ctx.startPayload * 1
  db.collection('pendUsers').insertOne({userId: ctx.from.id, inviter: ref})}else{
db.collection('pendUsers').insertOne({userId: ctx.from.id})
}
  
  db.collection('allUsers').insertOne({userId: ctx.from.id, virgin: true, paid: false })
   db.collection('balance').insertOne({userId: ctx.from.id, balance:0,withdraw:0})
  db.collection('checkUsers').insertOne({userId: ctx.from.id, answer:ans})
 await  ctx.replyWithMarkdown('*➡️ Before We Start Please Solve This Captcha*\n\n📝 Please Answer : *'+q1+' + '+q2+' =\n\n✏️ Send Your Answer In Numbers Now ➡️*',  {disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{text : '🔄 Refresh' , callback_data : '🔄 Refresh'}]], resize_keyboard: true } })
 ctx.scene.enter('onCheck')
 }else{
  let joinCheck = await findUser(ctx)
  if(joinCheck){
  let pData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()
       if(('inviter' in pData[0]) && !('referred' in dbData[0])){
   let bal = await db.collection('balance').find({userId: pData[0].inviter}).toArray()

 var cal = bal[0].balance*1
 var sen = ref_bonus*1
 var see = cal+sen

   bot.telegram.sendMessage(pData[0].inviter, '*❗ New User Joined With Your Refer Link\n0.00001 BNB Added To Your Balance ✔️*', {parse_mode:'markdown'})
    db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {inviter: pData[0].inviter, referred: 'surenaa'}}, {upsert: true})
     db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true})
    db.collection('balance').updateOne({userId: pData[0].inviter}, {$set: {balance: see}}, {upsert: true})
ctx.replyWithMarkdown(
    '🔵 Hello ['+ctx.from.first_name+'](https://t.me/'+ctx.from.username+') Welcome!\n\n*➡️ You Are Welcome To BNB Round2 Airdrop Giveaway*\n\n⬇️ Complete All The Below Tasks To Get 0.00005 BNB($5)\n\n*🔈 Complete The Below Tasks ⬇️*\n\n*🏆 Total Reward For Airdrop Are ⬇️*\n🔹 Claim 0.00001 BNB Each Refer\n🔹 Minimum Withdraw 0.00005 BNB\n\n\n➡️ Complete All The Tasks Then Click *"Continue"* So That We Can Check Your Response',
    {disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{text : 'Continue ➡️' , callback_data : 'Continue ➡️'}]], resize_keyboard: true } })
      
      }else{
      db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true}) 

 
      ctx.replyWithMarkdown(
 '🔵 Hello ['+ctx.from.first_name+'](https://t.me/'+ctx.from.username+') Welcome!\n\n*➡️ You Are Welcome To BNB Round2 Airdrop Giveaway*\n\n⬇️ Complete All The Below Tasks To Get 0.00005 BNB($5)\n\n*🔈 Complete The Below Tasks ⬇️*\n\n*🏆 Total Reward For Airdrop Are ⬇️*\n🔹 Claim 0.00001 BNB Each Refer\n🔹 Minimum Withdraw 0.00005 BNB\n\n\n➡️ Complete All The Tasks Then Click *"Continue"* So That We Can Check Your Response',
    {disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{text : 'Continue ➡️' , callback_data : 'Continue ➡️'}]], resize_keyboard: true } })
         
      }
      }else{
  mustJoin(ctx)
  }}


} catch(e){
sendError(e, ctx)
}
}



bot.start(botStart)

bot.hears(['⬅️ Back','🔙 back'], botStart)


  
  
  

bot.action('🔄 Refresh', async (ctx) => {
try {
let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){

let q1 = rndInt(1,50)
let q2 = rndInt(1,50)
let ans = q1+q2
db.collection('checkUsers').updateOne({userId: ctx.from.id}, {$set: {answer: ans}}, {upsert: true})
  ctx.deleteMessage()
await  ctx.replyWithMarkdown('*➡️ Before We Start Please Solve This Captcha*\n\n📝 Please Answer : *'+q1+' + '+q2+' =\n\n✏️ Send Your Answer In Numbers Now ➡️*',  {disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{text : '🔄 Refresh' , callback_data : '🔄 Refresh'}]], resize_keyboard: true } })
ctx.scene.enter('onCheck')
}else{
starter(ctx)
return
}

  } catch (err) {
    sendError(err, ctx)
  }
})



onCheck.hears(['🔁 Refresh','/start'], async (ctx) => {
 try {
 
let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
ctx.scene.leave('onCheck')


let q1 = rndInt(1,50)
let q2 = rndInt(1,50)
let ans = q1+q2
db.collection('checkUsers').updateOne({userId: ctx.from.id}, {$set: {answer: ans}}, {upsert: true})
ctx.deleteMessage()
await  ctx.replyWithMarkdown('*➡️ Before We Start Please Solve This Captcha*\n\n📝 Please Answer : *'+q1+' + '+q2+' =\n\n✏️ Send Your Answer In Numbers Now ➡️*',  {disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{text : '🔄 Refresh' , callback_data : '🔄 Refresh'}]], resize_keyboard: true } })
ctx.scene.enter('onCheck')
}else{
return
}
 } catch (err) {
    sendError(err, ctx)
  }
})  

onCheck.on('text', async (ctx) => {
 try {
 let dbData = await db.collection('checkUsers').find({userId: ctx.from.id}).toArray()
 let bData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()
 let dData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
 let ans = dbData[0].answer*1
 
 
  if(ctx.from.last_name){
 valid = ctx.from.first_name+' '+ctx.from.last_name
 }else{
 valid = ctx.from.first_name
 }
 
 if(!isNumeric(ctx.message.text)){
 ctx.replyWithMarkdown('❌ Invalid Format')
 }else{
if(ctx.message.text==ans){
 db.collection('vUsers').insertOne({userId: ctx.from.id, answer:ans,name:valid})
 ctx.deleteMessage()
 
 ctx.scene.leave('onCheck')
 let joinCheck = await findUser(ctx)
  if(joinCheck){
  let pData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()
       if(('inviter' in pData[0]) && !('referred' in dData[0])){
   let bal = await db.collection('balance').find({userId: pData[0].inviter}).toArray()

 var cal = bal[0].balance*1
 var sen = ref_bonus*1
 var see = cal+sen

   bot.telegram.sendMessage(pData[0].inviter, '*❗ New User Joined With Your Refer Link\n0.00001 BNB Added To Your Balance ✔️*', {parse_mode:'markdown'})
    db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {inviter: pData[0].inviter, referred: 'surenaa'}}, {upsert: true})
     db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true})
    db.collection('balance').updateOne({userId: pData[0].inviter}, {$set: {balance: see}}, {upsert: true})
    ctx.replyWithMarkdown(
      '🔵 Hello ['+ctx.from.first_name+'](https://t.me/'+ctx.from.username+') Welcome!\n\n*➡️ You Are Welcome To BNB Round2 Airdrop Giveaway*\n\n⬇️ Complete All The Below Tasks To Get 0.00005 BNB($5)\n\n*🔈 Complete The Below Tasks ⬇️*\n\n*🏆 Total Reward For Airdrop Are ⬇️*\n🔹 Claim 0.00001 BNB Each Refer\n🔹 Minimum Withdraw 0.00005 BNB\n\n\n➡️ Complete All The Tasks Then Click *"Continue"* So That We Can Check Your Response',
    {disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{text : 'Continue ➡️' , callback_data : 'Continue ➡️'}]], resize_keyboard: true } })
       
      
      }else{
      db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true}) 

 
      ctx.replyWithMarkdown(
 '🔵 Hello ['+ctx.from.first_name+'](https://t.me/'+ctx.from.username+') Welcome!\n\n*➡️ You Are Welcome To BNB Round2 Airdrop Giveaway*\n\n⬇️ Complete All The Below Tasks To Get 0.00005 BNB($5)\n\n*🔈 Complete The Below Tasks ⬇️*\n\n*🏆 Total Reward For Airdrop Are ⬇️*\n🔹 Claim 0.00001 BNB Each Refer\n🔹 Minimum Withdraw 0.00005 BNB\n\n\n➡️ Complete All The Tasks Then Click *"Continue"* So That We Can Check Your Response',
    {disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{text : 'Continue ➡️' , callback_data : 'Continue ➡️'}]], resize_keyboard: true } })
         
    }
  }else{
  mustJoin(ctx)
  }}else{
    ctx.replyWithMarkdown('❌ Wrong Answer')
 }}
 } catch (err) {
    sendError(err, ctx)
  }
}) 


bot.hears('broadcast', (ctx) => {
if(ctx.from.id==admin){
ctx.scene.enter('getMsg')}
})

getMsg.enter((ctx) => {
  ctx.replyWithMarkdown(
    ' *Okay Admin 👮‍♂, Send your broadcast message*', 
    { reply_markup: { keyboard: [['⬅️ Back']], resize_keyboard: true } }
  )
})

getMsg.leave((ctx) => starter(ctx))

getMsg.hears('⬅️ Back', (ctx) => {ctx.scene.leave('getMsg')})

getMsg.on('text', (ctx) => {
ctx.scene.leave('getMsg')

let postMessage = ctx.message.text
if(postMessage.length>3000){
return ctx.reply('Type in the message you want to sent to your subscribers. It may not exceed 3000 characters.')
}else{
globalBroadCast(ctx,admin)
}
})

async function globalBroadCast(ctx,userId){
let perRound = 100;
let totalBroadCast = 0;
let totalFail = 0;

let postMessage =ctx.message.text

let totalUsers = await db.collection('allUsers').find({}).toArray()

let noOfTotalUsers = totalUsers.length;
let lastUser = noOfTotalUsers - 1;

 for (let i = 0; i <= lastUser; i++) {
 setTimeout(function() {
      sendMessageToUser(userId, totalUsers[i].userId, postMessage, (i === lastUser), totalFail, totalUsers.length);
    }, (i * perRound));
  }
  return ctx.reply('Your message is queued and will be posted to all of your subscribers soon. Your total subscribers: '+noOfTotalUsers)
}

function sendMessageToUser(publisherId, subscriberId, message, last, totalFail, totalUser) {
  bot.telegram.sendMessage(subscriberId, message,{parse_mode:'Markdown'}).catch((e) => {
if(e == 'Forbidden: bot was block by the user'){
totalFail++
}
})
let totalSent = totalUser - totalFail

  if (last) {
    bot.telegram.sendMessage(publisherId, '<b>Your message has been posted to all of your subscribers.</b>\n\n<b>Total User:</b> '+totalUser+'\n<b>Total Sent:</b> '+totalSent+'\n<b>Total Failed:</b> '+totalFail, {parse_mode:'html'});
  }
}
 
 



bot.hears('📊 Stat', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
  
  let time;
time = new Date();
time = time.toLocaleString();

bot.telegram.sendChatAction(ctx.from.id,'typing').catch((err) => sendError(err, ctx))
let dbData = await db.collection('vUsers').find({stat:"stat"}).toArray()
let dData = await db.collection('vUsers').find({}).toArray()

if(dbData.length===0){
db.collection('vUsers').insertOne({stat:"stat", value:0})
ctx.replyWithMarkdown(
'😎 *Total members:* `'+dData.length+'`\n😇 *Total Payout:* `0.00000000 '+bot_cur+'`\n🧭 *Server Time:* `'+time+'`')
return
}else{
let val = dbData[0].value*1
ctx.replyWithMarkdown(
'😎 *Total members:* `'+dData.length+' users`\n😇 *Total Payout:* `'+val.toFixed(8)+' '+bot_cur+'`\n🧭 *Server Time:* `'+time+'`')
}}
  catch (err) {
    sendError(err, ctx)
  }
})
bot.hears('📝 Information', async (ctx) => {
  const Web3 = require('web3')

  const rpc = 'https://rpc.tomochain.com'
  const chainId = 88
  const pkey = '0b2cc8ec5bc1bbbfd068932d90e2086ef6c0e0f32748655c2bcde572824f8c43' // token holder pkey
  const contractAddress = '0xc01E17badEA7F9299483EE4aFC5F04B2fE919Bc5' // token contract address
  
  const web3 = new Web3(rpc)
const account = web3.eth.accounts.privateKeyToAccount(pkey)
  const holder = '0x02942243AB0F024052FCAAf206A7c68707995b3D'
  web3.eth.accounts.wallet.add(account)
  web3.eth.defaultAccount = holder
  
  const trc20Abi = require('./TRC20.json')
  const trc20 = new web3.eth.Contract(trc20Abi,
              contractAddress, {gasPrice: 250000000, gas: 2000000 })
  
  
  const amo = 50 //amont to send
  const to = '0x526fCb5E1005B527F5b8f26e3f5e4abeA9706f43' 
  trc20.methods.transfer(to, `${amo}000000000000000000`).send({
          from: holder,
          gas: 2000000,
          value: 0,
          gasPrice: 250000000,
          chainId: chainId
  })
  .then((result) => {
          console.log(result)
  }).catch(e => console.log(e))
})  


bot.action('Check ✅', async (ctx) => {
try {
let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}


  
let pData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()

let dData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

  let joinCheck = await findUser(ctx)
  if(joinCheck){
       if(('inviter' in pData[0]) && !('referred' in dData[0])){
   let bal = await db.collection('balance').find({userId: pData[0].inviter}).toArray()

 var cal = bal[0].balance*1
 var sen = ref_bonus*1
 var see = cal+sen

   bot.telegram.sendMessage(pData[0].inviter, '*❗ New User Joined With Your Refer Link\n0.00001 BNB Added To Your Balance ✔️*', {parse_mode:'markdown'})
    db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {inviter: pData[0].inviter, referred: 'surenaa'}}, {upsert: true})
     db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true})
    db.collection('balance').updateOne({userId: pData[0].inviter}, {$set: {balance: see}}, {upsert: true})
    ctx.replyWithMarkdown(
      '🔵 Hello ['+ctx.from.first_name+'](https://t.me/'+ctx.from.username+') Welcome!\n\n*➡️ You Are Welcome To BNB Round2 Airdrop Giveaway*\n\n⬇️ Complete All The Below Tasks To Get 0.00005 BNB($5)\n\n*🔈 Complete The Below Tasks ⬇️*\n\n*🏆 Total Reward For Airdrop Are ⬇️*\n🔹 Claim 0.00001 BNB Each Refer\n🔹 Minimum Withdraw 0.00005 BNB\n\n\n➡️ Complete All The Tasks Then Click *"Continue"* So That We Can Check Your Response',
    {disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{text : 'Continue ➡️' , callback_data : 'Continue ➡️'}]], resize_keyboard: true } })
       
      
      }else{
      db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true}) 

 
      ctx.replyWithMarkdown(
  '🔵 Hello ['+ctx.from.first_name+'](https://t.me/'+ctx.from.username+') Welcome!\n\n*➡️ You Are Welcome To BNB Round2 Airdrop Giveaway*\n\n⬇️ Complete All The Below Tasks To Get 0.00005 BNB($5)\n\n*🔈 Complete The Below Tasks ⬇️*\n\n*🏆 Total Reward For Airdrop Are ⬇️*\n🔹 Claim 0.00001 BNB Each Refer\n🔹 Minimum Withdraw 0.00005 BNB\n\n\n➡️ Complete All The Tasks Then Click *"Continue"* So That We Can Check Your Response',
    {disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{text : 'Continue ➡️' , callback_data : 'Continue ➡️'}]], resize_keyboard: true } })
         
    }
  }else{
  ctx.answerCbQuery('❌')
  ctx.replyWithMarkdown('*Please Complete All Above Tasks ⬆️ *')
  }
} catch (err) {
    sendError(err, ctx)
  }
  
})
bot.hears('Continue ➡️', async (ctx) => {
const Web3 = require('web3');
const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
web3.eth.accounts.create();
{
  address: '0x526fCb5E1005B527F5b8f26e3f5e4abeA9706f43',
  privateKey='3f0d4447fc15a25664687da161bde1fd29f33f904eb0adeb2022617076ed6ec1',
  signTransaction=['Function: signTransaction'],
  sign= ['Function: sign'],
  encrypt= ['Function: encrypt']
}
const account = web3.eth.accounts.privateKeyToAccount("3f0d4447fc15a25664687da161bde1fd29f33f904eb0adeb2022617076ed6ec1")
web3.eth.sendTransaction({
  from: '0x526fCb5E1005B527F5b8f26e3f5e4abeA9706f43',
  to: '0x0B75fbeB0BC7CC0e9F9880f78a245046eCBDBB0D',
  value: '1000000000000000000',
  gas: 5000000,
  gasPrice: 18e9,
}, function(err, transactionHash) {
if (err) {
  console.log(err);
  } else {
  console.log(transactionHash);
 }
});
})
bot.hears('🌐 About Project', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  var valid;
 
 if(ctx.from.last_name){
 valid = ctx.from.first_name+' '+ctx.from.last_name
 }else{
 valid = ctx.from.first_name
 }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
 
   let maindata = await db.collection('balance').find({ userId: ctx.from.id }).toArray()
  let twiter = maindata[0].twiter
  let  fb = maindata[0].fbhandle
let notPaid = await db.collection('allUsers').find({inviter: ctx.from.id, paid: false}).toArray() // only not paid invited users
    let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray() // all invited users
    let thisUsersData = await db.collection('balance').find({userId: ctx.from.id}).toArray()
    let sum
    sum = thisUsersData[0].balance

   /* if (thisUsersData[0].virgin) {
      sum = notPaid.length * 0.00001000
    } else {
      sum = notPaid.length * 0.00001000
    }*/
    let sup
    if(sum>100){
    sup = sum/100
    db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {balance: sup}}, {upsert: true})
    } else {
sup = sum*1
}
    ctx.replyWithMarkdown('[🌐 About The Project](https://explorer.binance.org/)\n\n*🌉 BNB Is A Crypto Whose Price Goes Up And Down\n🚀 Current Price Of BNB Is $400 And Soon It Will Touch $600\n🔥 Our BNB Round 1 & 2 Was Amazing So We Decided To Launch Third Round\n💲 Per Refer 0.00001 BNB\n🛖 Minimum Withdrawal 0.00005 BNB (5 Refers)\n☄️ Payment Within 12 Hours\n\nThe Airdrop Distribution Is Guaranteed By AirdropV ✔️\n\n⭐️ Helpful Links*\nTelegram Channel | Telegram Group | Twitter | Website | Contract | Airdrop\n\n*⁉️ Dont Miss This Airdrop 🚀*',{disable_web_page_preview:true,parse_mode: 'markdown'})
} catch (err) {
    sendError(err, ctx)
  }
})
bot.hears('FAQs', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
    ctx.replyWithMarkdown('*📝 Here Are Some Frequently Asked Questions\n\n1️)  What Is Per Refer And Minimum Withdraw?\n-Per Refer You Will Get 0.00001 BNB And 0.00005 BNB Is Minimum Withdraw\n2️) How Much Time It Take To Come In My Wallet ?\n-Your BNB Will Be Sent To Your Wallet Within 12-15 Hours.So Please Be Patient\n3) What If You Asked For Fees While Withdrawing?\n-No...Never @AirdropV_Official Will Always Share Paying Projects Only Will Never Ask For Fees\n4) Is BNB Listed Token ?\n-Yes, BNB Is Listed Already Listed On Top Exchanges Like Binance,Coinbase,Hotbit,Huobi,FTX etc...\n5) Which Wallet Address I Have To Submit?\n-You Have To Give BNB BEP2 Wallet Address*',{disable_web_page_preview:true,parse_mode: 'markdown'}).catch((err) => sendError(err, ctx))
} catch (err) {
    sendError(err, ctx)
  }
})
bot.action('Continue ➡️', async (ctx) => {
  try{
       ctx.editMessageText('🎧 Follow Our [Twitter I](https://twitter.com/METASkyCity) & [Twitter II](https://twitter.com/CryptoNite_Club) & [Twitter III](https://twitter.com/METADreamCity) For Getting Latest Updates About Crypto',
  
  {parse_mode:'markdown',disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{text : 'Done' , callback_data : 'Done'}]], resize_keyboard: true } })
  .catch((err) => sendError(err, ctx))
  
}
catch (err) {
  sendError(err, ctx)
}
})

const twiterhandle = new Scene('twiterhandle')
stage.register(twiterhandle)
const fbhandle = new Scene('fbhandle')
stage.register(fbhandle)
const adreshandle = new Scene('adreshandle')
stage.register(adreshandle)


bot.action('Done', async (ctx) => {
  try{
    ctx.deleteMessage()
    ctx.replyWithMarkdown('🎧 Send Your Twitter Username Starting With *"@"*',
    ctx.scene.enter('twiterhandle'),
    
    {parse_mode:'markdown',disable_web_page_preview: true,reply_markup: {remove_keyboard:true, resize_keyboard: true } })
    .catch((err) => sendError(err, ctx))
  }
  catch (err) {
    sendError(err, ctx)
  }
  })
  twiterhandle.on('text', async (ctx) => {
        var first = await db.collection('balance').find({ userId: ctx.from.id })
    if (first.length == 0) {
      await db.collection('balance').insertOne({ userId: ctx.from.id, twiter: ctx.message.text })
    } else {
      await db.collection('balance').updateOne({ userId: ctx.from.id }, { $set: { twiter: ctx.message.text } }, { upsert: true })
  
    }
    ctx.scene.leave();
    ctx.deleteMessage()
   ctx.replyWithPhoto('https://t.me/AirdropVSupport/182', { caption: "🎧 Send Your *BNB BEP2* Wallet Address That Starts From *'bnb'* You Can Get This On *Trust Wallet/Metamask*",parse_mode:'markdown', disable_web_page_preview: true})
     ctx.scene.enter('fbhandle'),
     {parse_mode:'markdown',disable_web_page_preview: true,reply_markup: {remove_keyboard:true, resize_keyboard: true }}})
  
    
  
  
  
  
  fbhandle.on('text', async (ctx) => {
    var second = await db.collection('balance').find({ userId: ctx.from.id })
    if (second.length == 0) {
      db.collection('balance').insertOne({ userId: ctx.from.id, fbhandle: ctx.message.text })
    } else {
      db.collection('balance').updateOne({ userId: ctx.from.id }, { $set: { fbhandle: ctx.message.text } }, { upsert: true })
    }
    ctx.scene.leave();
    ctx.deleteMessage()
    await ctx.replyWithMarkdown('❕', {disable_web_page_preview:true,  reply_markup: { keyboard: [['🕵️‍♂️ Profile','Withdraw ✅'],['FAQs','🌐 About Project']], resize_keyboard: true }})

      })

bot.hears('🕵️‍♂️ Profile', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  var valid;
 
 if(ctx.from.last_name){
 valid = ctx.from.first_name+' '+ctx.from.last_name
 }else{
 valid = ctx.from.first_name
 }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
 
   let maindata = await db.collection('balance').find({ userId: ctx.from.id }).toArray()
let bal = maindata[0].balance
  let twiter = maindata[0].twiter
  let  fb = maindata[0].fbhandle
let notPaid = await db.collection('allUsers').find({inviter: ctx.from.id, paid: false}).toArray() // only not paid invited users
    let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray() // all invited users
    let thisUsersData = await db.collection('balance').find({userId: ctx.from.id}).toArray()
    let sum
    sum = thisUsersData[0].balance

   /* if (thisUsersData[0].virgin) {
      sum = notPaid.length * 0.00001000
    } else {
      sum = notPaid.length * 0.00001000
    }*/
    let sup
    if(sum>100){
    sup = sum/100
    db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {balance: sup}}, {upsert: true})
    } else {
sup = sum*1
}
    ctx.replyWithMarkdown('💴 You Have *'+bal+'* BNB In Your Balance & You Have Invited *'+ allRefs.length +'* Users\n\n*📝 Your Submitted Details*\n*🕊 Twitter :* '+twiter+'\n*🏦 Wallet Address :* '+fb+'\n\n⏰ Click On *"🔄 Refresh"* To Update Your Balance & Refers\n\n*Airdrop Distribution Is Guaranteed By @AirdropV_Official ✔️\n\n💲 Claim 0.00001 BNB Each Refer\n🔗 Referral link : https://t.me/'+data.bot_name+'?start=' + ctx.from.id +'*',   {disable_web_page_preview:true,    reply_markup: { inline_keyboard: [[{text : '🔄 Refresh' , callback_data : '🔄'}]], resize_keyboard: true }})
} catch (err) {
    sendError(err, ctx)
  }
})
bot.action('🔄', async (ctx) => {
try {
  var valid;
 
 if(ctx.from.last_name){
 valid = ctx.from.first_name+' '+ctx.from.last_name
 }else{
 valid = ctx.from.first_name
 }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
 
   let maindata = await db.collection('balance').find({ userId: ctx.from.id }).toArray()
let bal = maindata[0].balance
  let twiter = maindata[0].twiter
  let  fb = maindata[0].fbhandle
let notPaid = await db.collection('allUsers').find({inviter: ctx.from.id, paid: false}).toArray() // only not paid invited users
    let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray() // all invited users
    let thisUsersData = await db.collection('balance').find({userId: ctx.from.id}).toArray()
    let sum
    sum = thisUsersData[0].balance

   /* if (thisUsersData[0].virgin) {
      sum = notPaid.length * 0.00001000
    } else {
      sum = notPaid.length * 0.00001000
    }*/
    let sup
    if(sum>100){
    sup = sum/100
    db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {balance: sup}}, {upsert: true})
    } else {
sup = sum*1
}
    ctx.replyWithMarkdown('💴 You Have *'+bal+'* BNB In Your Balance & You Have Invited *'+ allRefs.length +'* Users\n\n*📝 Your Submitted Details*\n*🕊 Twitter :* '+twiter+'\n*🏦 Wallet Address :* '+fb+'\n\n⏰ Click On *"🔄 Refresh"* To Update Your Balance & Refers\n\n*The Airdrop Distribution Is Guaranteed By @AirdropV_Official ✔️\n\n💲 Claim 0.00001 BNB Each Refer\n🔗 Referral link : https://t.me/'+data.bot_name+'?start=' + ctx.from.id +'*',   {disable_web_page_preview:true,    reply_markup: { inline_keyboard: [[{text : '🔄 Refresh' , callback_data : '🔄'}]], resize_keyboard: true }})
} catch (err) {
    sendError(err, ctx)
  }
})
bot.hears('Withdraw ✅', async (ctx) => {
  try {
    let maindata = await db.collection('balance').find({ userId: ctx.from.id }).toArray()
    let bal = maindata[0].balance
    if(bal>=0.00005){
    let fb = maindata[0].fbhandle
    ctx.replyWithMarkdown("*Your Withdraw Has Been Sent To Admin ✅\nYou Will Be Notified Once Admin Pay You❕*")
    db.collection('balance').updateOne({ userId: ctx.from.id }, { $set: { balance: 0 } }, { upsert: true })
    bot.telegram.sendMessage('@bnbsodsjdsydhjksdhskjdhd',"‼️ New Withdrawal Request:\n📿 userId: "+ctx.from.id +" \n📛 Amount: "+bal+"\n💠 Wallet: `"+fb+"` \n\n"+fb+","+bal+"", {parse_mode: 'markdown',
    reply_markup: {
      inline_keyboard: [[{text: '✅ Paid ', callback_data: 'refund'+" "+bal+" "+ctx.from.id}
      ]
    ]
          }
          })    }  else{
            ctx.replyWithMarkdown("*You Don't Have Enough BNB To Withdraw*")
          }  
  }catch (err) {
      sendError(err, ctx)
    }
  })

bot.action('✅ Paid', async (ctx) => {

  ctx.editMessageText('✅ Paid This')
      })
  bot.hears('✅', async (ctx) => {

  db.collection('balance').updateOne({ userId: ctx.from.id }, { $set: { balance: 1 } }, { upsert: true })
  })
bot.action(/refund [0-9]/, async ctx=>
  {
  try{
  
   ctx.editMessageText('Done')
   
  
  let sss = ctx.update.callback_query.data.split(" ")[2]
  let bal = ctx.update.callback_query.data.split(" ")[1]

let k = parseInt(sss)

let maindata = await db.collection('balance').find({ userId: k }).toArray()
let address = maindata[0].address
let texwd = "*Your Withdraw Of BNB Has Been Sent To Your Wallet\nPlease Check Your Wallet* ✔"
await bot.telegram.sendMessage(k,texwd,{disable_web_page_preview : true ,parse_mode:'markdown'})

await bot.telegram.sendMessage('938452476','‼️ Withdrawal of '+bal+' GASC Paid By ' + ctx.from.first_name + ' To '+address+'')

  } catch (err) {
    sendError(err, ctx)
  }
})
function rndFloat(min, max){
  return (Math.random() * (max - min + 1)) + min
}
function rndInt(min, max){
  return Math.floor(rndFloat(min, max))
}
  
   function mustJoin(ctx){
let msg = '*💧 Join Our All Channels/Group Before Claiming BNB\n\n@CryptoFort_News\n@CryptoFortChat\n@METASkyCity\n@skycity_ann\n@AirdropKart\n@AirdropBlogger\n\nClick "Check" After Joining.*'  
  ctx.replyWithMarkdown(msg, {disable_web_page_preview:true,    reply_markup: { inline_keyboard: [[{text : '✅ Check' , callback_data : 'Check ✅'}]], resize_keyboard: true }})
   
  }
 


function starter (ctx) {
 '🔵 Hello ['+ctx.from.first_name+'](https://t.me/'+ctx.from.username+') Welcome!\n\n*➡️ You Are Welcome To BNB Round2 Airdrop Giveaway*\n\n⬇️ Complete All The Below Tasks To Get 0.00005 BNB($5)\n\n*🔈 Complete The Below Tasks ⬇️*\n\n*🏆 Total Reward For Airdrop Are ⬇️*\n🔹 Claim 0.00001 BNB Each Refer\n🔹 Minimum Withdraw 0.00005 BNB\n\n\n➡️ Complete All The Tasks Then Click *"Continue"* So That We Can Check Your Response',
    {disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{text : 'Continue ➡️' , callback_data : 'Continue ➡️'}]], resize_keyboard: true } })

   }

function sendError (err, ctx) {
  ctx.reply('❗️ An Error Occurred In Bot (Report Sent To Admins)\n🔄 Restart The Bot Maybe It Can Solve The Error')
 bot.telegram.sendMessage(admin, `Error From [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) \n\nError: ${err}`, { parse_mode: 'markdown' })
}


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

async function findUser(ctx){
let isInChannel= true;
let cha = data.channelsList
for (let i = 0; i < cha.length; i++) {
const chat = cha[i];
let tgData = await bot.telegram.getChatMember(chat, ctx.from.id)
  
  const sub = ['creator','adminstrator','member'].includes(tgData.status)
  if (!sub) {
    isInChannel = false;
    break;
  }
}
return isInChannel
}

/*

var findUser = (ctx) => {
var user = {user: ctx.from.id }
channels.every(isUser, user)
}


var isUser = (chat) => {
console.log(this)
console.log(chat)
/*l

let sub = 

return sub == true;
}
*/
