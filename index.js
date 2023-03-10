const { Host } = require('./lib/connection.js')
const { handler } = require("./lib/handler.js")
const similarity = require("similarity")
const fs = require("fs")
const { googleIt, cnbindonesia } = require('@bochilteam/scraper')
const { MessageMedia } = require('whatsapp-web.js')
const request = require("request")

let db = {};
let sessions = [];
const path = "./database.json";
let isAlreadyInDatabase = false, isUserAlreadyInDatabase = false;

console.log("Starting...")
const read = ()=>{
  fs.readFile(path, "utf-8", (err, res)=>{
    if(err){
      console.log("Creating Database...")
      fs.writeFile(path, JSON.stringify({"chat": [{"id":"dummy","isBlocked":false,"name":"Ken","rpt":{"good":8,"bad":261,"babu":0,"toxic":262,"badBego":0,"goodSeru":0,"wibu":0,"ngetag":0,"cewe":0,"spam":{"cout":0,"word":[]},"botAngryLevel":0,"userAngryLevel":0}}], "group": [{"id":"dummy","isBlocked":false}]}), (err)=>{
        if(err){
          console.error(err)
        }else {
          console.log("- Creating Database Succes -")
          read();
        }
      })
    }else {
      db = JSON.parse(res);
      console.log("- Database Loaded -")
    }
  })
}
read()
Host.initialize();
console.log("Connecting to WhatsApp...")

Host.on("message_create", async mes =>{
  const chatsMe = await mes.getChat()
  if(mes.fromMe){
    console.log(`Sent :: ${mes.from}(${chatsMe.name}) | ${Host.info.pushname} => ${(mes.type === "chat") ? mes.body : (mes.type === "sticker") ? "Stiker 😃" : (mes.type === "image") ? "Foto 📷" : (mes.type === "video") ? "Video 🎥" : (mes.type === "audio") ? "Audio 🔉" : (mes.type === "document") ? "Document 📃" : (mes.type === "location") ? "Lokasi 👆" : (mes.type === "contact") ? "Kontak 👤" : (mes.type === "ptt") ? "Pesan Suara 🎙" : (mes.type === "vcard") ? "VCard 📇" : "IDK ❓"}`)
  };
})
Host.on("message", async m =>{
  console.log(`Recived :: ${m.from}(${(await m.getChat()).name}) | ${m.author}(${m._data.notifyName}) => ${(m.type === "chat") ? m.body : (m.type === "sticker") ? "Stiker 😃" : (m.type === "image") ? "Foto 📷" : (m.type === "video") ? "Video 🎥" : (m.type === "audio") ? "Audio 🔉" : (m.type === "document") ? "Document 📃" : (m.type === "location") ? "Lokasi 👆" : (m.type === "contact") ? "Kontak 👤" : (m.type === "ptt") ? "Pesan Suara 🎙" : (m.type === "vcard") ? "VCard 📇" : "IDK ❓"}`);
  // console.log(m.type)
  isAlreadyInDatabase = false
  if(m.from.split("@")[1] === "g.us"){
    db.group.map(dt =>{
      if(dt.id === m.from){
        isAlreadyInDatabase = true;
      }
    })
    if(!isAlreadyInDatabase){
      db.group.push({"id": m.from, "isBlocked": false})
    };
    db.chat.map(dt =>{
      if(dt.id === m.author){
        isUserAlreadyInDatabase = true;
      }
    })
    if(!isUserAlreadyInDatabase){
      db.chat.push({"id": m.author, "isBlocked": false, "name": m._data.notifyName, "rpt": { "good": 0, "bad": 0, "babu": 0, "toxic": 0, "badBego": 0, "goodSeru": 0, "wibu": 0, "ngetag": 0, "cewe": 0, "spam": {"cout": 0, "word": []}, "botAngryLevel": 0, "userAngryLevel": 0}})
    };
  }else if(m.from.split("@")[1] === "c.us"){
    db.chat.map(dt =>{
      if(dt.id === m.from){
        isAlreadyInDatabase = true;
      }
    })
    if(!isAlreadyInDatabase){
      db.chat.push({"id": m.from, "isBlocked": false, "name": m._data.notifyName, "rpt": {"good": 0, "bad": 0, "babu": 0, "toxic": 0, "badBego": 0, "goodSeru": 0, "wibu": 0, "ngetag": 0, "cewe": 0, "spam": {"cout": 0, "word": []}, "botAngryLevel": 0, "userAngryLevel": 0}})
    };
  };
})

// Host.on('groupInviteLinkCreated', (chat, inviteLink, creator) => {
//   let gId, lId;
//   db.group.map(dtss =>{
//     if (dtss.id === chat){
//       gId = lId;
//     };
//     lId++;
//   })
//   db.group[gId].link = {
//     "data": inviteLink,
//     "author": creator
//   }
// });

const saveData = ()=>{
  setTimeout(() => {
    fs.writeFile("./database.json", JSON.stringify(db), (err)=>{
      if(err){
        console.error(err)
        saveData()
      }else {
        saveData()
        // console.log("Saved State Database")
      }
    })
  }, 10000);
}
saveData()

const pickRandom = (wordList)=>{
  return `${wordList[Math.floor(Math.random() * wordList.length)]}`
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

//main
handler.on("message", async m =>{
  try {
    let dataSmart = {
      ask:{
        id: "",
        msg: ""
      },
      result: []
    }
    let text = (m.body).toLocaleLowerCase();
    let names = m._data.notifyName;
    let chat = await m.getChat();
    let ids = (chat.isGroup) ? m.author : m.from;
    let mention = await (await m.getMentions())[0];
    let textSplit = text.split(" ");
    let ownerNumber;
    let isAdminGroup, isMentionAdmin, isMentionOwner, isMeAdmin;
    let idSession, i= 0;
    let dbIds = 0, dis = 0;
    let gcDbIds = 0, gcIds = 0;
    sessions.map(dts =>{
      if(dts.id === ids){
        idSession = i;
      };
      i++
    });
    db.chat.map(async dat=>{
      if(dat.id === ids){
        dbIds = dis;
      };
      dis++;
    })
    if (chat.isGroup){
      for (let participant of chat.participants){
        if(participant.id._serialized === m.author && participant.isAdmin){
          isAdminGroup = true;
        };
      }
      for (let participant of chat.participants){
        if(participant.id._serialized === `${handler.info.wid.user}@c.us` && participant.isAdmin){
          isMeAdmin = true;
        };
      }
      db.group.map(dtss =>{
        if (dtss.id === m.from){
          gcDbIds = gcIds
        };
        gcIds++;
      })
    };
    if(mention){
      if(mention.isMe){
        db.chat[dbIds].rpt.ngetag++;
      };
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
    let high = 0.75;
    let medium = 0.7;
    let low = 0.65;
    
    const next = async ()=>{
      try{
        if(similarity(text.split(" ")[0], "halo") >= 0.9||similarity(text.split(" ")[0], "hai") >= 0.9){
          const hWord = pickRandom([`Halo juga ${names}`, `Hai ${names}`, `Apa kabar ${names}`])
          db.chat[dbIds].rpt.good++;
          if(hWord.includes("Apa kabar")){
            if(idSession > -1){
              sessions[idSession].state = "apkbr"
            }else {
              sessions.push({"id": ids, "state": "apkbr"})
            }
          };
          await m.reply(hWord)
        }
        // else if(similarity(text.split(" ")[0], "baik") >= high){
        //   const bWord = ["Oke", "Siap"]
        //   m.react("👌")
        //   m.reply(pickRandom(bWord))
        // }
        else if(similarity(text.split(" ")[0], "apakabar") >= medium||similarity(text.split(" ")[0], "apa kabar") >= medium){
          await m.react("👍")
          db.chat[dbIds].rpt.botAngryLevel--;
          db.chat[dbIds].rpt.good++;
          let apWord = pickRandom(["Aman", "Baik", `Saya baik baik saja ${names}`, `Baik ${names}, kamu gimana?`]);
          if(apWord.includes("kamu gimana?")){
            if(idSession > -1){
              sessions[idSession].state = "apkbr"
            }else {
              sessions.push({"id": ids, "state": "apkbr"})
            }
          };
          await m.reply(apWord)
        }else if(similarity(text.split(" ")[0], "oke") >= high){
          await m.react("😉")
          db.chat[dbIds].rpt.good++;
        }else if (similarity(text.split(" ")[0], "woi") >= high){
          let txt = pickRandom(["Apaan", "affah", "HAH?", "Naon", "Opo seh", "apa ajg"])
          db.chat[dbIds].rpt.bad++;
          await m.reply(txt)
          if(txt.includes("ajg")){
            db.chat[dbIds].rpt.botAngryLevel++;
            if(idSession > -1){
              sessions[idSession].state = "woireack"
            }else {
              sessions.push({"id": ids, "state": "woireack"})
            }
          }else {
            if(idSession > -1){
              sessions[idSession].state = "woireac"
            }else {
              sessions.push({"id": ids, "state": "woireac"})
            }
          }
        }else if (similarity((text.split(" ")[0]+" "+text.split(" ")[1]), 'lagi apa') >= high||similarity((text.split(" ")[0]+" "+text.split(" ")[1]), 'lagi ngapain') >= high){
          await m.reply(pickRandom(['Lagi turu', 'rebahan', 'mbangkong']))
          db.chat[dbIds].rpt.botAngryLevel--;
          if(idSession > -1){
            sessions[idSession].state = "rbhn"
          }else {
            sessions.push({"id": ids, "state": "rbhn"})
          }
        }else if(similarity(text.split(" ")[0], "masa") >= 0.9||similarity(text.split(" ")[0], "mosok") >= high||similarity(text.split(" ")[0], "affaiyah") >= high){
          let txt = pickRandom(['iya', 'y', 'iya ajg'])
          db.chat[dbIds].rpt.bad++;
          await m.reply(txt)
          if(txt.includes("ajg")){
            db.chat[dbIds].rpt.botAngryLevel++;
            if(idSession > -1){
              sessions[idSession].state = "woireack"
            }else {
              sessions.push({"id": ids, "state": "woireack"})
            }
          };
        }else if(similarity(text.split([" "])[0]+""+text.split([" "])[1], "tanggal berapa") >= medium||similarity(text.split([" "])[0]+""+text.split([" "])[1], "hari apa") >= medium||similarity(text.split([" "])[0]+""+text.split([" "])[1], "jam berapa") >= medium||similarity(text.split([" "])[0]+""+text.split([" "])[1], "tahun berapa") >= medium){
          await m.reply(`Sekarang ${Date()}`)
        }
        // else if(similarity(text.split([" "])[0]+""+text.split([" "])[1], "tidak ramah") >= medium){
        //   m.react("🤣")
        // }
        else if (((similarity(text.split(" ")[0], "cara") >= high||similarity(text.split(" ")[0], "caranya") >= high||similarity(text.split(" ")[0], "apaitu") >= high)&&text.split(" ")[1])||(((similarity(text.split(" ")[0], "bagaimana") >= high||similarity(text.split(" ")[0], "gimana") >= high)&&(similarity(text.split(" ")[1], "cara") >= high||similarity(text.split(" ")[1], "caranya") >= high))&&text.split(" ")[1]&&text.split(" ")[2])){
          // const searchUrl = `https://www.google.com/search?q=${text.replace(/\s+/g, '+')}`;
          db.chat[dbIds].rpt.good++;
          // import { googleIt } from '@bochilteam/scraper'
          const fetch = (await import('node-fetch')).default
          // let full = /f$/i.test(command)
          // if (!text) return conn.reply(m.chat, 'Tidak ada teks untuk di cari', m)
          let url = 'https://google.com/search?q=' + encodeURIComponent(text)
          let search = await googleIt(text)
          let msg = search.articles.map(({
              // header,
              title,
              url,
              description
          }) => {
              return `*${title}*\n_${url}_\n_${description}_`
          }).join('\n\n')
          await m.reply(msg)
        }else if(similarity(text, "news") >= 0.9||similarity(text, "berita hari ini") >= high||similarity(text, "berita terkini") >= high){
          const result = await cnbindonesia();
          db.chat[dbIds].rpt.good++;
          if(result){
            await m.reply("Tunggu sebentar ...")
            downloadImage(result[0].image, './tmp/news.png', async ()=>{
              const medias = await MessageMedia.fromFilePath("./tmp/news.png");
              if(medias){
                await chat.sendMessage(medias, { mentions: [await handler.getContactById(ids)] });
                await chat.sendMessage(`*${result[0].title}*\n${result[0].date}\n\n${result[0].link}`, { mentions: [await handler.getContactById(ids)] })
              }else{ await m.reply("terjadi kesalahan") }
            })
          }else {
            await m.reply("Tidak ada berita hari ini")
          }
        }else if (text === "p"){
          await m.reply(pickRandom(["Salam deck", "minimal salam lah", "setidak nya salam", "pa pe pa pe"]))
          db.chat[dbIds].rpt.bad++;
          db.chat[dbIds].rpt.botAngryLevel += 2;
          if(idSession > -1){
            sessions[idSession].state = "pe"
          }else {
            sessions.push({"id": ids, "state": "pe"})
          }
        }else if(text.substring(0, 2) === "oo"){
          await m.reply(pickRandom(["ohh", "ooo", "ooalah"]))
        }else if((similarity(text.split(" ")[1], "kontol") >= high||similarity(text.split(" ")[1], "asu") >= high||similarity(text.split(" ")[1], "bangsat") >= high||similarity(text.split(" ")[1], "gaje") >= high||similarity(text.split(" ")[1], "anj") >= high)&&text.split(" ")[0] === "bot"){
          await m.react(pickRandom(["😁", "😂", "🤗"]))
          db.chat[dbIds].rpt.toxic++;
          setTimeout(async ()=>{ db.chat[dbIds].rpt.bad++; }, 10)
        }else if((mirip(text, "kontol")||mirip(text, "bangsat")||mirip(text, "anjing")||mirip(text, "asu")||mirip(text, "ngentod"))&&m.type === "chat"){
          await m.react("🙉")
          db.chat[dbIds].rpt.toxic++;
          setTimeout(async ()=>{ db.chat[dbIds].rpt.bad++; }, 10)
        }else if (similarity(text.split(" ")[0], "berapa") >= high&&text.split(" ")[2]){
          db.chat[dbIds].rpt.good++;
          try {
            if(similarity(text.split(" ")[2], "ditambah") >= high||text.split(" ")[2] === "+"){
              let result = parseInt(text.split(" ")[1]) + parseInt(text.split(" ")[3])
              await m.reply(`Hasil dari ${text.split(" ")[1]} + ${text.split(" ")[3]} = ${result}`); 
            }else if(similarity(text.split(" ")[2], "dikurangi") >= high||text.split(" ")[2] === "-"){
              let result = parseInt(text.split(" ")[1]) - parseInt(text.split(" ")[3])
              await m.reply(`Hasil dari ${text.split(" ")[1]} - ${text.split(" ")[3]} = ${result}`); 
            }else if(similarity(text.split(" ")[2], "dikali") >= high||text.split(" ")[2] === "x"){
              let result = parseInt(text.split(" ")[1]) * parseInt(text.split(" ")[3])
              await m.reply(`Hasil dari ${text.split(" ")[1]} x ${text.split(" ")[3]} = ${result}`); 
            }else if(similarity(text.split(" ")[2], "dibagi") >= high||text.split(" ")[2] === "/"){
              let result = parseInt(text.split(" ")[1]) / parseInt(text.split(" ")[3])
              await m.reply(`Hasil dari ${text.split(" ")[1]} / ${text.split(" ")[3]} = ${result}`); 
            }else {
              await m.reply("di apain ege, ditambah, dikali, dikurang atau di apa")
              db.chat[dbIds].rpt.badBego++;
              db.chat[dbIds].rpt.botAngryLevel++;
              if(idSession > -1){
                sessions[idSession].state = "jmlh"
              }else {
                sessions.push({"id": ids, "state": "jmlh"})
              }
            }
          }catch{
            await m.reply("Maaf ada kesalahan")
          }
        }else if(similarity(text.split(" ")[0], "kaga") >= high||similarity(text.split(" ")[0], "engga") >= high){
          await m.reply(pickRandom(["Ohh", "oo", "ohh kirain", "walah"]))
        }else if(similarity(text.split(" ")[0], "hoax") >= high||similarity(text.split(" ")[0], "halah") >= high){
          await m.react("😂")
          db.chat[dbIds].rpt.goodSeru++;
        }else if(text.includes("saya cewe")||text.includes("gw cewe")||text.includes("aku cewe")){
          await m.react(pickRandom(["😀", "😍", "🥰", "😜"]))
          db.chat[dbIds].rpt.cewe++;
          db.chat[dbIds].rpt.botAngryLevel -= 3;
        }else if(similarity(text, "kamu nanyea") >= medium){
          db.chat[dbIds].rpt.bad++;
          let txt = pickRandom(["IYAA", "HOOH", "IYA AJG"])
          await m.reply(txt)
          if(txt.includes("ajg")){
            db.chat[dbIds].rpt.botAngryLevel++;
            if(idSession > -1){
              sessions[idSession].state = "woireack"
            }else {
              sessions.push({"id": ids, "state": "woireack"})
            }
          };
        }else if(text.includes("orang mana")){
          await m.reply(pickRandom(["orang mars", "Aku orang mars kak", "aku orang bumi", "aku orang isekai"]))
          db.chat[dbIds].rpt.good++;
        }else if(text.includes("om om")){
          await m.react(pickRandom(["😏", "😒", "🙃", "😵", "🤨"]))
        }else if (text.includes("isekai")){
          await m.reply(pickRandom(["WIBUU", "DASAR WIBU"]))
          db.chat[dbIds].rpt.wibu++;
        }else if(similarity(text, "kamu bot?") >= medium||similarity(text, "lu bot?") >= medium){
          let txt = pickRandom(["Iyaa", "Hooh", "Iya gw bot", "Lu kira gw apaan?, Babi?"])
          db.chat[dbIds].rpt.bad++;
          await m.reply(txt)
          if(txt.includes("Lu kira gw apaan?")){
            db.chat[dbIds].rpt.botAngryLevel++;
            if(idSession > -1){
              sessions[idSession].state = "lkgpn"
            }else {
              sessions.push({"id": ids, "state": "lkgpn"})
            }
          };
        }else if(text.includes("bot")){
          let tex = pickRandom(["Lu manggil gw?", `Ada apa ${names}`, "GW DI SINI"]);
          await m.reply(tex)
          if(tex.includes("Lu manggil gw?")){
            if(idSession > -1){
              sessions[idSession].state = "mggl"
            }else {
              sessions.push({"id": ids, "state": "mggl"})
            }
          };
        }else if(similarity(text, "keren kaga") >= medium||similarity(text, "keren kan") >= medium){
          db.chat[dbIds].rpt.good++;
          db.chat[dbIds].rpt.botAngryLevel--;
          await m.reply(pickRandom(["GG", "Bagus bet", "Keren Banget"]))
          if(idSession > -1){
            sessions[idSession].state = "trim"
          }else {
            sessions.push({"id": ids, "state": "trim"})
          }
        }else if(similarity(text.split(" ")[0], "siapa") >= high&&(text.includes("pencipta")||text.includes("pembuat")||text.includes("owner"))&&(similarity(text.split(" ").pop(), "mu") >= high||similarity(text.split(" ").pop(), "kamu") >= high)){
          await m.reply("Saya diciptakan oleh Syeif Sultoni Akbar menggunakkan NODEJS, similarity dan whatsapp-web.js");
          chat.sendMessage(await handler.getContactById('6281228020195@c.us'))
          db.chat[dbIds].rpt.good++;
          db.chat[dbIds].rpt.botAngryLevel -= 2;
        }else if(similarity(text, "apa pekerjaan mu") >= low){
          await m.reply(pickRandom(["Makan, Tidur doang", "Pengganguran", "Turu", "Rebahan"]))
        }else if(await m.mentionedIds.includes(await handler.info.me.user)){
          await m.reply(pickRandom(["Apaan?", "Ada apa?", "Affah?", "Ngapain ngetag?"]))
          db.chat[dbIds].rpt.ngetag++;
          db.chat[dbIds].rpt.botAngryLevel++;
        }else if (similarity(text, "assalamualaikum") >= medium){
          await m.reply("Waalaikumsalam")
          db.chat[dbIds].rpt.botAngryLevel -= 2;
        }else if(similarity(text, "buka grup") >= high){
          db.chat[dbIds].rpt.babu++;
          if(chat.isGroup){
              if(isAdminGroup){
                chat.setMessagesAdminsOnly(false)
                await m.reply("Berhasil buka grup")
                if(idSession > -1){
                  sessions[idSession].state = "trim"
                }else {
                  sessions.push({"id": ids, "state": "trim"})
                }
              }else {
                await m.reply("Anda Bukan Admin")
              }
          }else {
            await m.reply("Pastikan anda di dalam grup")
          }
        }else if(similarity(text, "tutup grup") >= high){
          db.chat[dbIds].rpt.babu++;
          if(chat.isGroup){
            if(isAdminGroup){
                chat.setMessagesAdminsOnly(true)
                await m.reply("Berhasil menutup grup")
                if(idSession > -1){
                  sessions[idSession].state = "trim"
                }else {
                  sessions.push({"id": ids, "state": "trim"})
                }
              }else {
                await m.reply("Anda Bukan Admin")
              }
          }else {
            await m.reply("Pastikan anda di dalam grup")
          }
        }else if (similarity(text, "keren") >= medium){
          await m.reply(pickRandom(["Trimakasih", "Makasih", "Maaci"]))
          db.chat[dbIds].rpt.botAngryLevel -= 2;
          db.chat[dbIds].rpt.good++;
          await m.react("😘")
        }else if (similarity(text.split(" ")[0], "promote") >= high){
          db.chat[dbIds].rpt.babu++;
          if(chat.isGroup){
            if(isMeAdmin){
              if(isAdminGroup){
                if(mention){
                  if(!isMentionAdmin){
                    if(!mention.isMe){
                      await chat.promoteParticipants([`${mention.number}@c.us`])
                      await chat.sendMessage(`Yey *${(mention.name) ? mention.name : mention.number}* sekarang jadi admin`, { mentions: [await handler.getContactById(`${mention.number}@c.us`)] })
                      if(idSession > -1){
                        sessions[idSession].state = "trim"
                      }else {
                        sessions.push({"id": ids, "state": "trim"})
                      }
                    }else { await m.reply("Tidak dapat mengubah info saya sendiri") }
                  }else {
                    await m.reply(`*${(mention.name) ? mention.name : mention.number}* sudah menjadi admin`)
                  }
                }else { 
                  await m.reply("Tolong mention salah satu")
                  if(idSession > -1){
                    sessions[idSession].state = "mtnp"
                  }else {
                    sessions.push({"id": ids, "state": "mtnp"})
                  }
                }
              }else { await m.reply("Anda bukan admin") }
            }else { await m.reply("saya bukan admin grup :v") }
          }else { await m.reply("Pastikan anda di dalam grup") }
        }else if (similarity(text.split(" ")[0], "demote") >= high){
          db.chat[dbIds].rpt.babu++;
          if(chat.isGroup){
            if(isMeAdmin){
              if(isAdminGroup){
                if(mention){
                  if(isMentionAdmin){
                    if(!isMentionOwner){
                      if(!mention.isMe){
                        await chat.demoteParticipants([`${mention.number}@c.us`])
                        await chat.sendMessage(`Selamat *${(mention.name) ? mention.name : mention.number}* bukan admin lagi`, { mentions: [await handler.getContactById(`${mention.number}@c.us`)] })
                        if(idSession > -1){
                          sessions[idSession].state = "trim"
                        }else {
                          sessions.push({"id": ids, "state": "trim"})
                        }
                      }else { await m.reply("Tidak dapat mengubah info saya sendiri") }
                    }else { await m.reply("Tidak bisa mengkudeta *Owner* grup") }
                  }else{ await m.reply(`*${(mention.name) ? mention.name : mention.number}* sudah bukan menjadi admin`) }
                }else { 
                  await m.reply("Tolong mention salah satu")
                  if(idSession > -1){
                    sessions[idSession].state = "mtnd"
                  }else {
                    sessions.push({"id": ids, "state": "mtnd"})
                  }
                }
              }else { await m.reply("Anda bukan admin") }
            }else { await m.reply("Saya bukan admin grup :v") }
          }else { await m.reply("Pastikan anda di dalam grup") }
        }else if(similarity(textSplit[0]+" "+textSplit[1]+" "+textSplit[2], "siapa yang paling") >= medium){
          if(chat.isGroup){
            if(textSplit[3]){
              const pckRan = (pickRandom(["true", "", "true"])) ? true : false;
              if(pckRan){
                let userList = [];
                chat.participants.map(dt =>{ userList.push(dt.id.user) });
                const randomUserNumber = pickRandom(userList);
                const RandomUserContact = await handler.getContactById(`${randomUserNumber}@c.us`);
                chat.sendMessage(`Yang paling *${((text.replace("siapa yang paling ", "")).replace("?", "")).toUpperCase()}* ${pickRandom(["adalah", "ialah", "itu"])} *@${(RandomUserContact.pushname) ? RandomUserContact.pushname : RandomUserContact.number}*`, { mentions: [RandomUserContact, await handler.getContactById(m.author)] })
              }else {
                await m.reply(pickRandom(["Kamu nanyea?", "Antum nanyea?", "Anda nanyea?, anda bertanyea tanyea?"]))
                if(idSession > -1){
                  sessions[idSession].state = "nyea"
                  sessions[idSession].currentCommand = text
                }else {
                  sessions.push({"id": ids, "state": "nyea", "currentCommand": text})
                }
              }
            }else {
              await m.reply("Yang paling apa???, bego???")
              if(idSession > -1){
                sessions[idSession].state = "paling"
              }else {
                sessions.push({"id": ids, "state": "paling"})
              }
            }
          }else{
            await m.reply("Pastikan anda berada dalam grup")
          }
        }else if(similarity(text, "lu bisa apa saja") >= medium||similarity(text, "kamu bisa apa saja") >= medium||similarity(text, "lu bisa apa") >= medium||similarity(text, "kamu bisa apa") >= medium){
          await m.react("😁");
          await m.reply(`
Saya bisa *promote/demote* user di grup,\nSaya bisa mengirim pesan balasan,\nSaya bisa *pilih orang random*,\nSaya bisa mencari paling(random) dengan kata kunci *siapa yang paling*,\nSaya bisa *buatin stiker*,\nSaya bisa memberi tahu *berita terkini*,\nSaya bisa membalas chat anda,\nSaya bisa mencarikan sesuatu di google, contoh *Gimana caranya bersiul?*,\nSaya bisa membuat stiker di *jadiin foto*\nSaya bisa marah, memahami sifat seseorang, memahami kebiasaan
          `)
          await chat.sendMessage("Jika butuh bantuan silahkan hubungi owner :), AI ini masih dalam tahap pengembangan :v", { mentions: [await handler.getContactById(ids)] });
          await chat.sendMessage(await handler.getContactById('6281228020195@c.us'), { mentions: [await handler.getContactById(ids)] });
        }else if(similarity(text, "pilih orang random") >= medium){
          if(chat.isGroup){
            let userList = [];
            chat.participants.map(dt =>{ userList.push(dt.id.user) });
            const randomUserNumber = pickRandom(userList);
            const RandomUserContact = await handler.getContactById(`${randomUserNumber}@c.us`);
            chat.sendMessage(`Selamat *${(RandomUserContact.pushname) ? RandomUserContact.pushname : RandomUserContact.number}* anda terpilih`, { mentions: [await handler.getContactById(ids), await handler.getContactById(`${RandomUserContact.number}@c.us`)] })
          }else {
            await m.reply("Siapa yang mau di pilih?, Setidak nya anda di grup")
          }
        }else if(text.match(RegExp("berantem yok".split("").join("\\w*").replace(/\W/, ""), "i"))){
          await m.react("🤣");
          await m.reply(pickRandom(["Yok!!", "HAYYUK!!", "AYO!!"]))
        }else if(text.match(RegExp(".menu".split("").join("\\w*").replace(/\W/, ""), "i"))){
          await m.react("🤣");
          await m.reply("ketik aja 'Lu Bisa Apa', gw bot ai beriq 5 :V")
        }else if(similarity(text, "buatin stiker") >= medium||similarity(text, "buatin stiker dong") >= medium){
          if(m.hasMedia){
            chat.sendMessage("Bentar...")
            const media = await m.downloadMedia();
            if (media.mimetype === 'image/jpeg' || media.mimetype === 'image/png') {
              db.chat[dbIds].rpt.babu++;
              await m.reply("Nih Stiker")
              await chat.sendMessage(media, { mentions: [await handler.getContactById(ids)], sendMediaAsSticker: true, stickerAuthor: "SGStudio", stickerName: "Ai Botz|NaonBotz" })
              if(idSession > -1){
                sessions[idSession].state = "trim"
              }else {
                sessions.push({"id": ids, "state": "trim"})
              }
            }else {  db.chat[dbIds].rpt.botAngryLevel++; await m.reply("Ini bukan Foto EGE") }
          }else { 
            await m.reply("Mana fotonya?");
            if(idSession > -1){
              sessions[idSession].state = "stkr"
            }else {
              sessions.push({"id": ids, "state": "stkr"})
            }
          }
        }else if(similarity(text, "minta link grup") >= 0.85){
          if(chat.isGroup){
            if(isMeAdmin){
              if(db.group[gcDbIds].link){
                await m.reply(`Nih,\ndari ${db.group[gcDbIds].link.author}\n${db.group[gcIds].link.data}`)
              }else {
                await m.reply("Link grup tidak tersedia :(")
              }
            }else { await m.reply("Gw bukan admin :v") }
          };
        }else if(m.type === "chat"&&(mirip(text, "nama kamu siapa")||mirip(text, "nama mu siapa")||mirip(text, "nama lu siapa"))){
          db.chat[dbIds].rpt.botAngryLevel--;
          await m.reply(`Hai, perkenalkan nama ku *${handler.info.pushname}*, aku adalah bot AI buatan *Syeif Sultoni Akbar*, Salam Kenal :)`)
        }else if(m.hasQuotedMsg&&(similarity(text, "jadiin foto") >= high||similarity(text, "jadiin foto dong") >= high)){
          const qMsg = await m.getQuotedMessage();
          if(qMsg.type === "sticker"){
            if(qMsg.hasMedia){
              const userContact = await handler.getContactById(ids);
              const media = await qMsg.downloadMedia()
              await chat.sendMessage("Bentar...", { mentions: [userContact] })
              if(media.mimetype === "image/jpeg"||media.mimetype === "image/png"||media.mimetype === "image/webp"){
                db.chat[dbIds].rpt.babu++;
                await m.reply("Nih Foto..")
                await chat.sendMessage(media, { mentions: [userContact] })
                if(idSession > -1){
                  sessions[idSession].state = "trim"
                }else {
                  sessions.push({"id": ids, "state": "trim"})
                }
              }else { await m.reply("Tidak bisa mengconvert stiker tersebut :v") }
            }else { await m.reply("Kaga ada stiker nya ege") }
          }else { await m.reply("Ini mah bukan stiker") }
        };
        
        // ///2
        // if((await m._data.notifyName).toLocaleLowerCase().includes("bot")&&db.chat[dbIds].rpt.botAngryLevel >= 4){
        //   chat.sendMessage(`Bot kok mainan bot :v *@${m._data.notifyName}*`, { mentions: [await handler.getContactById(ids)] });
        //   db.chat[dbIds].rpt.botAngryLevel -= 2;
        // };
        
      }catch(e){
        await handler.sendMessage("6281228020195@c.us", `${await e}`)
        // throw e
      }
    }
    
    if (idSession > -1){
      if(sessions[idSession].current){
        if(sessions[idSession].current === text){
          sessions[idSession].currentCount++;
          if(sessions[idSession].currentCount >= 5){
            sessions[idSession].currentCount = 0;
            db.chat[dbIds].rpt.botAngryLevel += 2;
            db.chat[dbIds].rpt.spam.word.push(text);
            db.chat[dbIds].rpt.spam.word.cout++;;
          };
        }else {
          sessions[idSession].currentCount = 0;
        }
      }else {
        sessions[idSession].current = text;
        sessions[idSession].currentCount = 0;
      }
      let state = sessions[idSession].state;
      if(state === "apkbr"){
        if(similarity(text.split(" ")[0], "baik") >= high){
          const bWord = ["Alhamdulillah", "Okok sip"]
          db.chat[dbIds].rpt.botAngryLevel--;
          db.chat[dbIds].rpt.good++;
          await m.react("👌")
          await m.reply(pickRandom(bWord))
          sessions[idSession].state = ""
        }else if(similarity(text.split(" ")[0], "buruk") >= high){
          db.chat[dbIds].rpt.botAngryLevel--;
          const bWord = ["Waduh kenapa?", "Sini cerita"]
          await m.react("👌")
          await m.reply(pickRandom(bWord))
          sessions[idSession].state = "crty"
        }else {
          await m.react("👌")
          await m.reply("Okk")
          sessions[idSession].state = ""
        }
      }else if(state === "crty"){
        await m.reply(pickRandom(["Yaudah, Yang sabar ya, TETAP SEMANGAT!!", "TETAP SEMANGAT!!, jangan putus asa"]))
        db.chat[dbIds].rpt.good += 2;
        db.chat[dbIds].rpt.botAngryLevel--;
        sessions[idSession].state = ""
      }else if(state === "woireac"){
        if(similarity(text, "ngga") >= high||similarity(text, "kaga") >= high){
          await m.reply(pickRandom(["Oalah", "Ohh"]))
          sessions[idSession].repeat = false
          sessions[idSession].state = ""
        }else if(text.includes("woi")){
          if(sessions[idSession].repeat){
            await m.reply(pickRandom(["Asw", "Bacod kontol"]))
            db.chat[dbIds].rpt.botAngryLevel++;
            db.chat[dbIds].rpt.bad++;
            sessions[idSession].repeat = false
            sessions[idSession].state = "woireack"
          }else {
            sessions[idSession].repeat = true
            next();
          }
        }else {
          sessions[idSession].repeat = false
          sessions[idSession].state = ""
          next()
        }
      }else if(state === "woireack"){
        if(similarity(text.split([" "])[0]+""+text.split([" "])[1], "tidak ramah") >= medium||text.includes("ngegas")||text.includes("anj")||text.includes("ajg")){
          await m.react("🤣")
          db.chat[dbIds].rpt.good++;
          sessions[idSession].state = ""
        }else {
          sessions[idSession].state = ""
          next()
        }
      }else if(state === "rbhn"){
        await m.reply(pickRandom(["Mager jawab :v, lagi rebahan", "ohh, males, gw lagi rebahan"]))
        sessions[idSession].state = ""
      }else if(state === "pe"){
        if (similarity(text, "assalamualaikum") >= medium){
          await m.reply("Waalaikumsalam")
          db.chat[dbIds].rpt.good++;
          db.chat[dbIds].rpt.botAngryLevel--;
          chat.sendMessage("Nah Gitu Dong")
          sessions[idSession].state = ""
        }else if (similarity(text, "shalom") >= medium||similarity(text, "misi") >= medium){
          db.chat[dbIds].rpt.good++;
          db.chat[dbIds].rpt.botAngryLevel--;
          await m.reply("Nah Gitu Dong")
          sessions[idSession].state = ""
        }else {
          db.chat[dbIds].rpt.bad++;
          db.chat[dbIds].rpt.botAngryLevel++;
          await m.reply(pickRandom(["BGST", "ANJ", "Dasar OM OM", "SAT"]))
          sessions[idSession].state = ""
        }
      }else if(state === "trim"){
        if(similarity(text, "trimakasih") >= medium){
          await m.reply("sama sama :)");
          db.chat[dbIds].rpt.botAngryLevel--;
          db.chat[dbIds].rpt.good++;
          sessions[idSession].state = ""
        }else {
          sessions[idSession].state = ""
          next()
        }
      }else if(state === "mggl"){
        if(similarity(text, "iya") >= high){
          await m.reply(pickRandom(["Kenapa emang?", "Ada apa manggil?"]))
          sessions[idSession].state = ""
        }else {
          sessions[idSession].state = ""
          next()
        }
      }else if (state === "jmlh"){
        if(text.includes("ditambah")||text.includes("dikali")||text.includes("dikurangi")||text.includes("dibagi")){
          await m.reply("yaudah, tulis aja, contoh 'Berapa 1 dikali 1'")
          sessions[idSession].state = ""
        }else {
          sessions[idSession].state = ""
          next()
        }
      }else if(state === "lkgpn"){
        if(text.includes("iya")||text.includes("hooh")){
          db.chat[dbIds].rpt.bad++;
          db.chat[dbIds].rpt.botAngryLevel++;
          await m.reply(pickRandom(["BGST", "ANJ", "WTF"]))
          sessions[idSession].state = ""
        }else {
          sessions[idSession].state = ""
          next()
        }
      }else if(state === "mtnp"){
        if(mention&&chat.isGroup&&isAdminGroup&&!text.split(" ")[1]&&isMeAdmin){
          db.chat[dbIds].rpt.babu++;
          if(!isMentionAdmin){
            if(!mention.isMe){
              await chat.promoteParticipants([`${mention.number}@c.us`])
              await chat.sendMessage(`Yey *${(mention.name) ? mention.name : mention.number}* sekarang jadi admin`, { mentions: [await handler.getContactById(`${mention.number}@c.us`)] })
              if(idSession > -1){
                sessions[idSession].state = "trim"
              }else {
                sessions.push({"id": ids, "state": "trim"})
              }
            }else { await m.reply("Tidak dapat mengubah info saya sendiri") }
          }else {
            await m.reply(`*${(mention.name) ? mention.name : mention.number}* sudah menjadi admin`)
          }
        }else {
          sessions[idSession].state = ""
          next()
        }
      }else if(state === "mtnd"){
        if(mention&&chat.isGroup&&isAdminGroup&&!text.split(" ")[1]&&isMeAdmin){
          db.chat[dbIds].rpt.babu++;
          if(isMentionAdmin){
            if(!isMentionOwner){
              if(!mention.isMe){
                await chat.demoteParticipants([`${mention.number}@c.us`])
                await chat.sendMessage(`Selamat *${(mention.name) ? mention.name : mention.number}* bukan admin lagi`, { mentions: [await handler.getContactById(`${mention.number}@c.us`)] })
                if(idSession > -1){
                  sessions[idSession].state = "trim"
                }else {
                  sessions.push({"id": ids, "state": "trim"})
                }
              }else { await m.reply("Tidak dapat mengubah info saya sendiri") }
            }else { await m.reply("Tidak bisa mengkudeta *Owner* grup") }
          }else{ await m.reply(`*${(mention.name) ? mention.name : mention.number}* sudah bukan menjadi admin`) }
        }else {
          sessions[idSession].state = ""
          next()
        }
      }else if(state === "paling"&&chat.isGroup){
        if(similarity(text, "iya") >= high){
          sessions[idSession].state = ""
          let userList = [];
          chat.participants.map(dt =>{ userList.push(dt.id.user) });
          const randomUserNumber = pickRandom(userList);
          const RandomUserContact = await handler.getContactById(`${randomUserNumber}@c.us`);
          chat.sendMessage(`Yang paling *BEGO* ${pickRandom(["adalah", "ialah", "itu"])} *@${(RandomUserContact.pushname) ? RandomUserContact.pushname : RandomUserContact.number}*`, { mentions: [RandomUserContact, await handler.getContactById(m.author)] })
        }else{
          sessions[idSession].state = ""
          let userList = [];
          chat.participants.map(dt =>{ userList.push(dt.id.user) });
          const randomUserNumber = pickRandom(userList);
          const RandomUserContact = await handler.getContactById(`${randomUserNumber}@c.us`);
          chat.sendMessage(`Yang paling *${((text.replace("siapa yang paling ", "")).replace("?", "")).toUpperCase()}* ${pickRandom(["adalah", "ialah", "itu"])} *@${(RandomUserContact.pushname) ? RandomUserContact.pushname : RandomUserContact.number}*`, { mentions: [RandomUserContact, await handler.getContactById(m.author)] })
        }
      }else if(state === "nyea"){
        if(similarity(text, "iya") >= medium){
          sessions[idSession].state = "";
          chat.sendMessage("Sini aku kasih tau ya", { mentions: [await handler.getContactById(ids)] });
          let userList = [];
          chat.participants.map(dt =>{ userList.push(dt.id.user) });
          const randomUserNumber = pickRandom(userList);
          const RandomUserContact = await handler.getContactById(`${randomUserNumber}@c.us`);
          chat.sendMessage(`Yang paling *${(((sessions[idSession].currentCommand).replace("siapa yang paling ", "")).replace("?", "")).toUpperCase()}* ${pickRandom(["adalah", "ialah", "itu"])} *@${(RandomUserContact.pushname) ? RandomUserContact.pushname : RandomUserContact.number}*`, { mentions: [RandomUserContact, await handler.getContactById(m.author)] })
          sessions[idSession].currentCommand = "";
        }else {
          sessions[idSession].state = "";
          sessions[idSession].currentCommand = "";
          next()
        }
      }else if(state === "stkr"){
        if(m.hasMedia){
          sessions[idSession].state = ""
          chat.sendMessage("Bentar...")
          const media = await m.downloadMedia();
          if (media.mimetype === 'image/jpeg' || media.mimetype === 'image/png') {
            db.chat[dbIds].rpt.babu++;
            await m.reply("Nih Stiker")
            await chat.sendMessage(media, { mentions: [await handler.getContactById(ids)], sendMediaAsSticker: true, stickerAuthor: "SGStudio", stickerName: "Ai Botz|NaonBotz" })
            if(idSession > -1){
              sessions[idSession].state = "trim"
            }else {
              sessions.push({"id": ids, "state": "trim"})
            }
          }else {  db.chat[dbIds].rpt.botAngryLevel--; await m.reply("Ini bukan Foto EGE") }
        }else { 
          sessions[idSession].state = ""
          next()
        }
      }else { 
        sessions[idSession].repeat = false
        sessions[idSession].state = ""
        next()
      }
      // console.log(`STATE : ${state}`)
    }else { next() }
    if(m.type !== "chat"){
      if(m.mentionedIds.includes(dataSmart.ask.id)&&m.hasQuotedMsg){
        const repliedMsg = await message.getQuotedMessage();
        const repliedText = repliedMsg.body;
        dataSmart.result.push({"ask": dataSmart.ask.msg, "ans": text, "from": dataSmart.ask.id})
        dataSmart.ask.id = await (chat.isGroup) ? m.author : m.from;
        dataSmart.ask.msg = await text
        console.log(dataSmart)
        console.log(`The replied message is: ${repliedText}`);
      }else {
        dataSmart.ask.id = await (chat.isGroup) ? m.author : m.from;
        dataSmart.ask.msg = await text
      }
    };
    // for (let contact of mention){
    //   m.reply(`Apaan ngetag ngetag ${names}`);
    // }
  }catch(e){ 
    await handler.sendMessage("6281228020195@c.us", `${await e}`)
    // throw e
  }
})