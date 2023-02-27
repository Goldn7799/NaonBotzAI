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
let levelSession = {};
const owner = "6281228020195@c.us";

//global function
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
        }
      })
    }
  })
}
const saveDb = ()=>{
  fs.writeFile("./word-database.json", JSON.stringify(dbWord), (err)=>{
    if(err){
      console.error(err);
    }else {
      setTimeout(()=>{ saveDb() }, 10000)
    };
  })
}

//initialize
readDb();
console.log("Connecting To Whatsapp...");
Host.initialize();
saveDb();

//Log Chat
Host.on("message_create", async mes =>{
  const chatsMe = await mes.getChat()
  if(mes.fromMe){
    console.log(`Sent :: ${mes.from}(${chatsMe.name}) | ${Host.info.pushname} => ${(mes.type === "chat") ? mes.body : (mes.type === "sticker") ? "Stiker 😃" : (mes.type === "image") ? "Foto 📷" : (mes.type === "video") ? "Video 🎥" : (mes.type === "audio") ? "Audio 🔉" : (mes.type === "document") ? "Document 📃" : (mes.type === "location") ? "Lokasi 👆" : (mes.type === "contact") ? "Kontak 👤" : (mes.type === "ptt") ? "Pesan Suara 🎙" : (mes.type === "vcard") ? "VCard 📇" : "IDK ❓"}`)
  }else {
    console.log(`Recived :: ${mes.from}(${(await mes.getChat()).name}) | ${mes.author}(${mes._data.notifyName}) => ${(mes.type === "chat") ? mes.body : (mes.type === "sticker") ? "Stiker 😃" : (mes.type === "image") ? "Foto 📷" : (mes.type === "video") ? "Video 🎥" : (mes.type === "audio") ? "Audio 🔉" : (mes.type === "document") ? "Document 📃" : (mes.type === "location") ? "Lokasi 👆" : (mes.type === "contact") ? "Kontak 👤" : (mes.type === "ptt") ? "Pesan Suara 🎙" : (mes.type === "vcard") ? "VCard 📇" : "IDK ❓"}`);
  };
})

//Level Typo's
const high = 0.8;
const mid = 0.75;
const low = 0.7;

//response AI
handler.on("message", async m =>{
  try{
    const chat = await m.getChat();
    const idSender = (chat.isGroup) ? m.from : m.author;
    const text = m.body;
    const textSplit = text.split(" ");
    let isSenderAdmin, isMeAdmin;
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

    const next = async ()=>{
      try{
        if (similarity(m.body, "sini bot gw ajarin") >= high){
          await m.reply("Iya kak, diajarin apa?");
          levelSession[idSender].state = "ajarin";
        }else {
          let tmp = [];
          if(dbWord.chatWordList[m.from]){
            tmp = [];
            const listHigh = (dbWord.chatWordList[m.from].wordList).filter(res => res.rate === "high");
            if(listHigh.length > 0){
              listHigh.map(dt =>{
                if(similarity(text, dt.ask) >= high){
                  tmp.push(dt.ans);
                };
              });
              if(tmp.length > 0){
                await m.reply([pickRandom(tmp)]);
              }else {
                listHigh.map(dt =>{
                  if(similarity(text, dt.ask) >= mid){
                    tmp.push(dt.ans);
                  };
                });
                if(tmp.length > 0){
                  await m.reply([pickRandom(tmp)]);
                }else {
                  tmp = [];
                  const listMid = (dbWord.chatWordList[m.from].wordList).filter(res => res.rate === "mid");
                  if(listMid.length > 0){
                    listMid.map(dt =>{
                      if(similarity(text, dt.ask) >= high){
                        tmp.push(dt.ans);
                      };
                    });
                    if(tmp.length > 0){
                      await m.reply([pickRandom(tmp)]);
                    }else {
                      listMid.map(dt =>{
                        if(similarity(text, dt.ask) >= mid){
                          tmp.push(dt.ans);
                        };
                      });
                      if(tmp.length > 0){
                        await m.reply([pickRandom(tmp)]);
                      }else {
                        tmp = [];
                        const listLow = (dbWord.chatWordList[m.from].wordList).filter(res => res.rate === "low");
                        if(listLow.length > 0){
                          listLow.map(dt =>{
                            if(similarity(text, dt.ask) >= high){
                              tmp.push(dt.ans);
                            };
                          });
                          if(tmp.length > 0){
                            await m.reply([pickRandom(tmp)]);
                          }else {
                            listLow.map(dt =>{
                              if(similarity(text, dt.ask) >= mid){
                                tmp.push(dt.ans);
                              };
                            });
                            if(tmp.length > 0){
                              await m.reply([pickRandom(tmp)]);
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          }else {
            tmp = [];
            if(dbWord.wordList){
              tmp = [];
              const wlistHigh = (dbWord.wordList).filter(res => res.rate === "high");
              if(wlistHigh.length > 0){
                wlistHigh.map(dt =>{
                  if(similarity(text, dt.ask) >= high){
                    tmp.push(dt.ans);
                  };
                });
                if(tmp.length > 0){
                  await m.reply([pickRandom(tmp)]);
                }else {
                  wlistHigh.map(dt =>{
                    if(similarity(text, dt.ask) >= mid){
                      tmp.push(dt.ans);
                    };
                  });
                  if(tmp.length > 0){
                    await m.reply([pickRandom(tmp)]);
                  }else {
                    tmp = [];
                    const wlistMid = (dbWord.wordList).filter(res => res.rate === "mid");
                    if(wlistMid.length > 0){
                      wlistMid.map(dt =>{
                        if(similarity(text, dt.ask) >= high){
                          tmp.push(dt.ans);
                        };
                      });
                      if(tmp.length > 0){
                        await m.reply([pickRandom(tmp)]);
                      }else {
                        wlistMid.map(dt =>{
                          if(similarity(text, dt.ask) >= mid){
                            tmp.push(dt.ans);
                          };
                        });
                        if(tmp.length > 0){
                          await m.reply([pickRandom(tmp)]);
                        }else {
                          tmp = [];
                          const wlistLow = (dbWord.wordList).filter(res => res.rate === "low");
                          if(wlistLow.length > 0){
                            wlistLow.map(dt =>{
                              if(similarity(text, dt.ask) >= high){
                                tmp.push(dt.ans);
                              };
                            });
                            if(tmp.length > 0){
                              await m.reply([pickRandom(tmp)]);
                            }else {
                              wlistLow.map(dt =>{
                                if(similarity(text, dt.ask) >= mid){
                                  tmp.push(dt.ans);
                                };
                              });
                              if(tmp.length > 0){
                                await m.reply([pickRandom(tmp)]);
                              };
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };
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
      if(levelSession[idSender].state === "ajarin"){
        if(textSplit[0] === "kalau"&&text.includes("jawab aja")){
          if(textSplit[1] === "ada"){
            if(textSplit[2] === "yang"){
              if(textSplit[3] === "bilang"||textSplit[3] === "ngomong"){
                const ask = text.split(" jawab aja ")[0].replace("kalau ", "");
                const ans = text.split(" jawab aja ")[1];
                const rate = (idSender === owner) ? "high" : "low";
                dbWord.wordList.push({"creator": idSender, "action": "reply", "ask": ask, "ans": ans, "rate": rate});
                await m.reply(pickRandom(["Ok kak", "Siap kak", "Baik kak"]));
              }else { levelSession[idSender].state = ""; next(); }
            }else { levelSession[idSender].state = ""; next(); }
          }else { levelSession[idSender].state = ""; next(); }
        }else if(textSplit[0] === "disini"){
          if(textSplit[0] === "kalau"&&text.includes("jawab aja")){
            if(textSplit[1] === "ada"){
              if(textSplit[2] === "yang"){
                if(textSplit[3] === "bilang"||textSplit[3] === "ngomong"){
                  const ask = text.split(" jawab aja ")[0].replace("kalau ", "");
                  const ans = text.split(" jawab aja ")[1];
                  const rate = (isSenderAdmin) ? "mid" : "low";
                  if(!dbWord.chatWordList[m.from]){ dbWord.chatWordList[m.from] = {} };
                  dbWord.chatWordList[m.from].wordList.push({"creator": idSender, "action": "reply", "ask": ask, "ans": ans, "rate": rate});
                  await m.reply(pickRandom(["Ok kak", "Siap kak", "Baik kak"]));
                }else { levelSession[idSender].state = ""; next(); }
              }else { levelSession[idSender].state = ""; next(); }
            }else { levelSession[idSender].state = ""; next(); }
          }else { levelSession[idSender].state = ""; next(); }
        }else { levelSession[idSender].state = ""; next(); }
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
  }
})