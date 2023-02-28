//SetUp
const { Host } = require("./lib/connection.js")
const { handler } = require("./lib/handler.js")
const fs = require("fs")
const similarity = require("similarity")
// const chalk = await import("chalk")

//SetUp Global Variable
console.log("Starting...")
let db = {};
let dbWord = {};
let aiState = {};
let levelSession = {};
const owner = "6281228020195@c.us";

//Level Typo's
const high = 0.8;
const mid = 0.75;
const low = 0.7;

//global function
const pickRandomString = (wordList)=>{
  return `${wordList[Math.floor(Math.random() * wordList.length)]}`
}
const pickRandomObject = (wordList)=>{
  return wordList[Math.floor(Math.random() * wordList.length)]
}
const mirip = (left, right)=>{
  if(left&&right){
    return left.match(RegExp(right.split("").join("\\w*").replace(/\W/, ""), "i"))
  }else { return "err mirip" }
}
const downloadImage = (url, filename, callback) => {
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(filename))
      .on('close', callback);
  });
};
const saveDb = async ()=>{
  setTimeout(() => {
    fs.writeFile("./word-database.json", JSON.stringify(dbWord), (err)=>{
      if(err){
        console.error(err);
      }else {
        setTimeout(()=>{ saveDb() }, 100)
      };
    })
  }, 10000);
}

//search keyword
let keywordDificulty = high;
const highSearch = async (text, chatId)=>{
  let tmp = [];
  let wlistHigh;
  if(chatId&&dbWord.chatWordList[chatId]){
    wlistHigh = dbWord.chatWordList[chatId].wordList.filter(res => res.rate === "high");
  }else {
    wlistHigh = dbWord.wordList.filter(res => res.rate === "high");
  }
  if(await wlistHigh.length > 0){
    await wlistHigh.map(dt =>{
      if(similarity(text, dt.ask) >= keywordDificulty){
        tmp.push(dt);
      };
    });
    if(tmp.length > 0){
      return pickRandomObject(tmp)
    }else {
      return false
    };
  }else { return false }
}
const midSearch = async (text, chatId)=>{
  let tmp = [];
  let wlistMid;
  if(chatId&&dbWord.chatWordList[chatId]){
    wlistMid = dbWord.chatWordList[chatId].wordList.filter(res => res.rate === "mid");
  }else {
    wlistMid = dbWord.wordList.filter(res => res.rate === "mid");
  }
  if(await wlistMid.length > 0){
    await wlistMid.map(dt =>{
      if(similarity(text, dt.ask) >= keywordDificulty){
        tmp.push(dt);
      };
    });
    if(tmp.length > 0){
      return pickRandomObject(tmp);
    }else {
      return false
    };
  }else { return false }
}
const lowSearch = async (text, chatId)=>{
  let tmp = [];
  let wlistLow;
  if(chatId&&dbWord.chatWordList[chatId]){
    wlistLow = dbWord.chatWordList[chatId].wordList.filter(res => res.rate === "low");
  }else {
    wlistLow = dbWord.wordList.filter(res => res.rate === "low");
  }
  if(await wlistLow.length > 0){
    await wlistLow.map(dt =>{
      if(similarity(text, dt.ask) >= keywordDificulty){
        tmp.push(dt);
      };
    });
    if(tmp.length > 0){
      return pickRandomObject(tmp);
    }else {
      return false;
    };
  }else { return false }
}
const search = async (text, chatId)=>{
  keywordDificulty = high;
  const high = await highSearch(text, chatId);
  if(high){
    return high;
  }else{
    const mid = await midSearch(text, chatId)
    if(mid){
      return mid;
    }else {
      const low = await lowSearch(text, chatId)
      if(low){
        return low;
      }else {
        keywordDificulty = mid;
        const high = await highSearch(text, chatId);
        if(high){
          return high;
        }else{
          const mid = await midSearch(text, chatId)
          if(mid){
            return mid;
          }else {
            const low = await lowSearch(text, chatId)
            if(low){
              return low;
            }else {
              keywordDificulty = low;
              const high = await highSearch(text, chatId);
              if(high){
                return high;
              }else{
                const mid = await midSearch(text, chatId)
                if(mid){
                  return mid;
                }else {
                  const low = await lowSearch(text, chatId)
                  if(low){
                    return low;
                  }else {
                    return false;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

const readDb = ()=>{
  console.log("Loading database...")
  fs.readFile("./word-database.json", "utf-8", (err, res)=>{
    if(err){
      console.log("Creating word-database.json...");
      fs.writeFile("./word-database.json", JSON.stringify({"wordList": [], "chatWordList": {}}), (err)=>{
        if(err){
          console.log(err);
          throw err;
        }else {
          console.log("- Succes Crating -");
          readDb();
        }
      })
    }else {
      dbWord = JSON.parse(res);
      console.log("- Word List Loaded -")
      fs.readFile("./database.json", "utf-8", (err, res)=>{
        if(err){
          console.log("Creating database.json...")
          fs.writeFile("./database.json", JSON.stringify({"user": {}, "group": {}}), (err)=>{
            if(err){
              console.log(err);
              throw err;
            }else {
              console.log("- Succes Creating -")
              readDb();
            }
          })
        }else {
          db = JSON.parse(res);
          console.log("- Database Loaded -");
          saveDb();
        }
      })
    }
  })
}

//initialize
readDb();
console.log("Connecting To Whatsapp...");
Host.initialize();

//Log Chat
Host.on("message_create", async mes =>{
  const chatsMe = await mes.getChat()
  if(mes.fromMe){
    console.log(`Sent :: ${mes.from}(${chatsMe.name}) | ${Host.info.pushname} => ${(mes.type === "chat") ? mes.body : (mes.type === "sticker") ? "Stiker 😃" : (mes.type === "image") ? "Foto 📷" : (mes.type === "video") ? "Video 🎥" : (mes.type === "audio") ? "Audio 🔉" : (mes.type === "document") ? "Document 📃" : (mes.type === "location") ? "Lokasi 👆" : (mes.type === "contact") ? "Kontak 👤" : (mes.type === "ptt") ? "Pesan Suara 🎙" : (mes.type === "vcard") ? "VCard 📇" : "IDK ❓"}`)
  }else {
    console.log(`Recived :: ${mes.from}(${(await mes.getChat()).name}) | ${mes.author}(${mes._data.notifyName}) => ${(mes.type === "chat") ? mes.body : (mes.type === "sticker") ? "Stiker 😃" : (mes.type === "image") ? "Foto 📷" : (mes.type === "video") ? "Video 🎥" : (mes.type === "audio") ? "Audio 🔉" : (mes.type === "document") ? "Document 📃" : (mes.type === "location") ? "Lokasi 👆" : (mes.type === "contact") ? "Kontak 👤" : (mes.type === "ptt") ? "Pesan Suara 🎙" : (mes.type === "vcard") ? "VCard 📇" : "IDK ❓"}`);
  };
})

//response AI
handler.on("message", async m =>{
  const chat = await m.getChat();
  const idSender = (chat.isGroup) ? m.from : m.author;
  const text = m.body.toLowerCase();
  if(m.hasQuotedMsg&&!m.fromMe&&m.type === "chat"){
    const qm = await m.getQuotedMessage();
    if (qm.type === "chat"&&!qm.fromMe){
      const qmText = qm.body.toLowerCase()
      dbWord.wordList.push({"creator": idSender, "action": "reply", "ask": qmText, "ans": text, "rate": "low"});
    };
  };
  if(m.hasQuotedMsg&&m.type === "chat"&&(similarity(text, "heh") >= 1.0||similarity(text, "ga boleh") >= mid||similarity(text, "heh ga boleh") >= mid||similarity(text, "weh") >= 1.0||similarity(text, "weh ga boleh") >= mid||similarity(text, "anj") >= 1.0||similarity(text, "anjir") >= 1.0||similarity(text, "anj") >= 1.0||similarity(text, "bgst") >= 1.0||similarity(text, "asu") >= 1.0||similarity(text, "ngentd") >= 1.0)){
    const qm = await m.getQuotedMessage();
    if(qm.type === "chat"&&qm.fromMe){
      await m.reply("Aku belajar dari orang orang ngomong :v");
      await m.react("😅");
    };
  };
})
//response
handler.on("message", async m =>{
  try{
    const chat = await m.getChat();
    const idSender = (chat.isGroup) ? m.author : m.from;
    const text = m.body.toLowerCase();
    const textSplit = text.split(" ");
    const mention = await (await m.getMentions())[0];
    let isSenderAdmin, isMeAdmin, isMentionAdmin, isMentionOwner;
    if(chat.isGroup){
      for (let participant of chat.participants){
        if(participant.id._serialized === m.author && participant.isAdmin){
          isSenderAdmin = true;
        };
      }
      for (let participant of chat.participants){
        if(participant.id._serialized === `${handler.info.wid.user}@c.us` && participant.isAdmin){
          isMeAdmin = true;
        };
      }
    }
    if(mention){
      // if(mention.isMe){
      //   db.chat[dbIds].rpt.ngetag++;
      // };
      if (chat.isGroup){
        ownerNumber = (await chat.owner) ? chat.owner.user : "000@c.us";
        for (let participant of chat.participants){
          if(participant.id._serialized === `${mention.number}@c.us` && participant.isAdmin){
            isMentionAdmin = true;
          };
        }
      };
      if (ownerNumber === mention.number){
        isMentionOwner = true;
      }else {
        isMentionOwner = false;
      }
    };

    const next = async ()=>{
      try{
        if (similarity(m.body, "sini bot gw ajarin") >= high){
          await m.reply("Iya kak, diajarin apa?");
          levelSession[idSender].state = "ajarin";
        }else if (similarity(text.split(" ")[0], "promote") >= high){
          // db.chat[dbIds].rpt.babu++;
          if(chat.isGroup){
            if(await isMeAdmin){
              if(await isSenderAdmin){
                if(mention){
                  if(!await isMentionAdmin){
                    if(!mention.isMe){
                      await chat.promoteParticipants([`${mention.number}@c.us`])
                      await chat.sendMessage(`Yey *${(mention.name) ? mention.name : mention.number}* sekarang jadi admin`, { mentions: [await handler.getContactById(`${mention.number}@c.us`)] })
                      levelSession[idSender].state = "trim";
                    }else { await m.reply("Tidak dapat mengubah info saya sendiri") }
                  }else {
                    await m.reply(`*${(mention.name) ? mention.name : mention.number}* sudah menjadi admin`)
                  }
                }else { 
                  await m.reply("Tolong mention salah satu")
                  levelSession[idSender].state = "mntp";
                }
              }else { await m.reply("Anda bukan admin") }
            }else { await m.reply("saya bukan admin grup :v") }
          }else { await m.reply("Pastikan anda di dalam grup") }
        }else if (similarity(text.split(" ")[0], "demote") >= high){
          // db.chat[dbIds].rpt.babu++;
          if(chat.isGroup){
            if(await isMeAdmin){
              if(await isSenderAdmin){
                if(mention){
                  if(await isMentionAdmin){
                    if(!await isMentionOwner){
                      if(!mention.isMe){
                        await chat.demoteParticipants([`${mention.number}@c.us`])
                        await chat.sendMessage(`Selamat *${(mention.name) ? mention.name : mention.number}* bukan admin lagi`, { mentions: [await handler.getContactById(`${mention.number}@c.us`)] })
                        levelSession[idSender].state = "trim";
                      }else { await m.reply("Tidak dapat mengubah info saya sendiri") }
                    }else { await m.reply("Tidak bisa mengkudeta *Owner* grup") }
                  }else{ await m.reply(`*${(mention.name) ? mention.name : mention.number}* sudah bukan menjadi admin`) }
                }else { 
                  await m.reply("Tolong mention salah satu")
                  levelSession[idSender].state = "mntd";
                }
              }else { await m.reply("Anda bukan admin") }
            }else { await m.reply("Saya bukan admin grup :v") }
          }else { await m.reply("Pastikan anda di dalam grup") }
        }else if(similarity(text, "buatin stiker") >= mid||similarity(text, "buatin stiker dong") >= mid){
          if(m.hasMedia){
            chat.sendMessage("Bentar...")
            const media = await m.downloadMedia();
            if (media.mimetype === 'image/jpeg' || media.mimetype === 'image/png') {
              // db.chat[dbIds].rpt.babu++;
              await m.reply("Nih Stiker")
              await chat.sendMessage(media, { mentions: [await handler.getContactById(idSender)], sendMediaAsSticker: true, stickerAuthor: "SGStudio", stickerName: "Ai Botz|NaonBotz" })
              levelSession[idSender].state = "trim";
            }else { await m.reply("Ini bukan Foto EGE") }
          }else { 
            await m.reply("Mana fotonya?");
            levelSession[idSender].state = "stkr";
          }
        }else if(m.hasQuotedMsg&&(similarity(text, "jadiin foto") >= high||similarity(text, "jadiin foto dong") >= high)){
          const qMsg = await m.getQuotedMessage();
          if(qMsg.type === "sticker"){
            if(qMsg.hasMedia){
              const userContact = await handler.getContactById(idSender);
              const media = await qMsg.downloadMedia()
              await chat.sendMessage("Bentar...", { mentions: [userContact] })
              if(media.mimetype === "image/jpeg"||media.mimetype === "image/png"||media.mimetype === "image/webp"){
                // db.chat[dbIds].rpt.babu++;
                await m.reply("Nih Foto..")
                await chat.sendMessage(media, { mentions: [userContact] })
                levelSession[idSender].state = "trim";
              }else { await m.reply("Tidak bisa mengconvert stiker tersebut :v") }
            }else { await m.reply("Kaga ada stiker nya ege") }
          }else { await m.reply("Ini mah bukan stiker") }
        }else {
          if(dbWord.chatWordList[m.from]){
            const result = await search(text, m.from);
            if(result){
              await m.reply(result.ans);
            };
          }else {
            const result = await search(text);
            if(result){
              await m.reply(result.ans);
            };
          }
        };
      }catch (e){
        if(`${e}`.includes("TypeError: Cannot read properties of undefined (")){
          dbWord.chatWordList[m.from] = {}
        }else {
          console.log(`Err : ${e}`)
        }
      }
    };
    if(levelSession[idSender]){
      const state = levelSession[idSender].state;
      if(state === "ajarin"){
        if(textSplit[0] === "kalau"&&text.includes("jawab aja")){
          if(textSplit[1] === "ada"){
            if(textSplit[2] === "yang"){
              if(textSplit[3] === "ngomong"||textSplit[3] === "bilang"){
                const ask = text.split(" jawab aja ")[0].replace(`kalau ada yang ${(textSplit[3] === "bilang") ? "bilang" : "ngomong"} `, "");
                const ans = text.split(" jawab aja ")[1];
                const rate = (idSender === owner) ? "high" : "low";
                dbWord.wordList.push({"creator": idSender, "action": "reply", "ask": ask, "ans": ans, "rate": rate});
                await m.reply(pickRandomString(["Ok kak", "Siap kak", "Baik kak"]));
              }else { levelSession[idSender].state = ""; next(); }
            }else { levelSession[idSender].state = ""; next(); }
          }else { levelSession[idSender].state = ""; next(); }
        }else if(textSplit[0] === "disini"){
          if(textSplit[0] === "kalau"&&text.includes("jawab aja")){
            if(textSplit[1] === "ada"){
              if(textSplit[2] === "yang"){
                if(textSplit[3] === "bilang"||textSplit[3] === "ngomong"){
                  const ask = text.split(" jawab aja ")[0].replace(`kalau ada yang ${(textSplit[3] === "bilang") ? "bilang" : "ngomong"} `, "");
                  const ans = text.split(" jawab aja ")[1];
                  const rate = (isSenderAdmin) ? "mid" : "low";
                  if(!dbWord.chatWordList[m.from]){ dbWord.chatWordList[m.from] = {} };
                  dbWord.chatWordList[m.from].wordList.push({"creator": idSender, "action": "reply", "ask": ask, "ans": ans, "rate": rate});
                  await m.reply(pickRandomString(["Ok kak", "Siap kak", "Baik kak"]));
                }else { levelSession[idSender].state = ""; next(); }
              }else { levelSession[idSender].state = ""; next(); }
            }else { levelSession[idSender].state = ""; next(); }
          }else { levelSession[idSender].state = ""; next(); }
        }else { levelSession[idSender].state = ""; next(); }
      }else if(state === "trim"){
        if(similarity(text, "trimakasih") >= mid){
          await m.reply("sama sama :)");
          // db.chat[dbIds].rpt.botAngryLevel--;
          // db.chat[dbIds].rpt.good++;
          levelSession[idSender].state = "";
        }else {
          levelSession[idSender].state = "";
          next()
        }
      }else if(state === "mtnp"){
        if(mention&&chat.isGroup&&isSenderAdmin&&!text.split(" ")[1]&&isMeAdmin){
          // db.chat[dbIds].rpt.babu++;
          if(!isMentionAdmin){
            if(!mention.isMe){
              await chat.promoteParticipants([`${mention.number}@c.us`])
              await chat.sendMessage(`Yey *${(mention.name) ? mention.name : mention.number}* sekarang jadi admin`, { mentions: [await handler.getContactById(`${mention.number}@c.us`)] })
              levelSession[idSender].state = "trim";
            }else { await m.reply("Tidak dapat mengubah info saya sendiri") }
          }else {
            await m.reply(`*${(mention.name) ? mention.name : mention.number}* sudah menjadi admin`)
          }
        }else {
          levelSession[idSender].state = "";
          next()
        }
      }else if(state === "mtnd"){
        if(mention&&chat.isGroup&&isSenderAdmin&&!text.split(" ")[1]&&isMeAdmin){
          // db.chat[dbIds].rpt.babu++;
          if(isMentionAdmin){
            if(!isMentionOwner){
              if(!mention.isMe){
                await chat.demoteParticipants([`${mention.number}@c.us`])
                await chat.sendMessage(`Selamat *${(mention.name) ? mention.name : mention.number}* bukan admin lagi`, { mentions: [await handler.getContactById(`${mention.number}@c.us`)] })
                levelSession[idSender].state = "trim";
              }else { await m.reply("Tidak dapat mengubah info saya sendiri") }
            }else { await m.reply("Tidak bisa mengkudeta *Owner* grup") }
          }else{ await m.reply(`*${(mention.name) ? mention.name : mention.number}* sudah bukan menjadi admin`) }
        }else {
          levelSession[idSender].state = "";
          next()
        }
      }else if(state === "stkr"){
        if(m.hasMedia){
          levelSession[idSender].state = "";
          chat.sendMessage("Bentar...")
          const media = await m.downloadMedia();
          if (media.mimetype === 'image/jpeg' || media.mimetype === 'image/png') {
            // db.chat[dbIds].rpt.babu++;
            await m.reply("Nih Stiker")
            await chat.sendMessage(media, { mentions: [await handler.getContactById(idSender)], sendMediaAsSticker: true, stickerAuthor: "SGStudio", stickerName: "Ai Botz|NaonBotz" })
            levelSession[idSender].state = "trim";
          }else { await m.reply("Ini bukan Foto EGE") }
        }else { 
          levelSession[idSender].state = "";
          next()
        }
      }else {
        levelSession[idSender].state = "";
        next();
      };
    }else {
      levelSession[idSender] = {};
      levelSession[idSender].state = "";
      next();
    };
  }catch (e){
    console.log(`Err : ${e}`)
    // throw e
  }
})