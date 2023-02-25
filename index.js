const { Host } = require('./lib/connection.js')
const { handler } = require("./lib/handler.js")
const axios = require("axios")
const cheerio = require('cheerio')
const similarity = require("similarity")
const fs = require("fs")

let db = {};
let sessions = [];
const path = "./database.json";
let isAlreadyInDatabase = false;

console.log("Starting...")
Host.initialize();

Host.on("message", async m =>{
  console.log(`Recived => ${m.from}(${(await m.getChat()).name}) | ${m._data.notifyName} => ${m.body}`);
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
  }else if(m.from.split("@")[1] === "c.us"){
    db.chat.map(dt =>{
      if(dt.id === m.from){
        isAlreadyInDatabase = true;
      }
    })
    if(!isAlreadyInDatabase){
      db.chat.push({"id": m.from, "isBlocked": false, "name": m._data.notifyName})
    };
  };
})

const read = ()=>{
  fs.readFile(path, "utf-8", (err, res)=>{
    if(err){
      fs.writeFile(path, JSON.stringify({"chat": [], "group": []}), (err)=>{
        if(err){
          console.error(err)
        }else {
          read();
        }
      })
    }else {
      db = JSON.parse(res);
      console.log("Database Loaded")
    }
  })
}
read()
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

//main
handler.on("message", async m =>{
  let text = (m.body).toLocaleLowerCase();
  let names = m._data.notifyName;
  let ids = names;
  let chat = await m.getChat();
  let mention = await m.getMentions();
  let high = 0.75;
  let medium = 0.65;
  let low = 0.55;
  let idSession, i= 0;
  sessions.map(dts =>{
    if(dts.id === ids){
      idSession = i;
    };
    i++
  });
  
  const next = async ()=>{
    if(similarity(text.split(" ")[0], "halo") >= 0.9||similarity(text.split(" ")[0], "hai") >= 0.9){
      const hWord = pickRandom([`Halo juga ${names}`, `Hai ${names}`, `Apa kabar ${names}`])
      if(hWord.includes("Apa kabar")){
        if(idSession > -1){
          sessions[idSession].state = "apkbr"
        }else {
          sessions.push({"id": ids, "state": "apkbr"})
        }
      };
      m.reply(hWord)
    }
    // else if(similarity(text.split(" ")[0], "baik") >= high){
    //   const bWord = ["Oke", "Siap"]
    //   m.react("👌")
    //   m.reply(pickRandom(bWord))
    // }
    else if(similarity(text.split(" ")[0], "apakabar") >= medium||similarity(text.split(" ")[0], "apa kabar") >= medium){
      m.react("👍")
      let apWord = pickRandom(["Aman", "Baik", `Saya baik baik saja ${names}`, `Baik ${names}, kamu gimana?`]);
      if(apWord.includes("kamu gimana?")){
        if(idSession > -1){
          sessions[idSession].state = "apkbr"
        }else {
          sessions.push({"id": ids, "state": "apkbr"})
        }
      };
      m.reply(apWord)
    }else if(text.includes("kontol")||text.includes("bangsat")||text.includes("anjing")||text.includes("asu")){
      m.react("🙉")
    }else if(similarity(text.split(" ")[0], "oke") >= high){
      m.react("😉")
    }else if (similarity(text.split(" ")[0], "woi") >= high){
      let txt = pickRandom(["Apaan", "affah", "HAH?", "Naon", "Opo seh", "apa ajg"])
      m.reply(txt)
      if(txt.includes("ajg")){
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
    }else if (similarity((text.split(" ")[0]+" "+text.split(" ")[1]), 'lagi apa') >= medium||similarity((text.split(" ")[0]+" "+text.split(" ")[1]), 'lagi ngapain') >= medium){
      m.reply(pickRandom(['Lagi turu', 'rebahan', 'mbangkong']))
      if(idSession > -1){
        sessions[idSession].state = "rbhn"
      }else {
        sessions.push({"id": ids, "state": "rbhn"})
      }
    }else if(similarity(text.split(" ")[0], "masa") >= high||similarity(text.split(" ")[0], "mosok") >= high||similarity(text.split(" ")[0], "affaiyah") >= high){
      m.reply(pickRandom(['iya', 'y', 'iya ajg']))
    }else if(similarity(text.split([" "])[0]+""+text.split([" "])[1], "tanggal berapa") >= medium||similarity(text.split([" "])[0]+""+text.split([" "])[1], "hari apa") >= medium||similarity(text.split([" "])[0]+""+text.split([" "])[1], "jam berapa") >= medium||similarity(text.split([" "])[0]+""+text.split([" "])[1], "tahun berapa") >= medium){
      m.reply(`Sekarang ${Date()}`)
    }
    // else if(similarity(text.split([" "])[0]+""+text.split([" "])[1], "tidak ramah") >= medium){
    //   m.react("🤣")
    // }
    else if (((similarity(text.split(" ")[0], "cara") >= high||similarity(text.split(" ")[0], "caranya") >= high||similarity(text.split(" ")[0], "apaitu") >= high)&&text.split(" ")[1])||(((similarity(text.split(" ")[0], "bagaimana") >= high||similarity(text.split(" ")[0], "gimana") >= high)&&(similarity(text.split(" ")[1], "cara") >= high||similarity(text.split(" ")[1], "caranya") >= high))&&text.split(" ")[1]&&text.split(" ")[2])){
      const searchUrl = `https://www.google.com/search?q=${text.replace(/\s+/g, '+')}`;
      axios.get(searchUrl)
      .then(response => {
        const $ = cheerio.load(response.data);
        const searchResult = $('div.g').first().find('div.s').text(); // ambil teks dari div pertama hasil pencarian
        const result = searchResult.replace(/\.$/, ''); // hapus tanda titik di akhir kalimat
        // console.log(result); // tampilkan hasil pencarian tanpa tanda titik
        if(result){
          m.reply(`Kalau kata mbah google : ${result}`);
        }else {
          m.reply("tidak ada hasil yang tepat di google tentang "+text)
        }
      })
      .catch(error => {
        console.log(error);
        m.reply("Tidak dapat mengambil info dari google, coba lagi nanti :v")
      });
    }else if (text === "p"){
      m.reply(pickRandom(["Salam deck", "minimal salam lah", "setidak nya salam", "pa pe pa pe"]))
      if(idSession > -1){
        sessions[idSession].state = "pe"
      }else {
        sessions.push({"id": ids, "state": "pe"})
      }
    }else if(text.substring(0, 2) === "oo"){
      m.reply(pickRandom["ohh", "ooo", "ooalah"])
    }else if(text.includes("bot")){
      let tex = pickRandom(["Lu manggil gw?", `Ada apa ${names}`, "GW DI SINI"]);
      m.reply(tex)
      if(tex.includes("Lu manggil gw?")){
        if(idSession > -1){
          sessions[idSession].state = "mggl"
        }else {
          sessions.push({"id": ids, "state": "mggl"})
        }
      };
    }else if((similarity(text.split(" ")[1], "kontol") >= high||similarity(text.split(" ")[1], "asu") >= high||similarity(text.split(" ")[1], "bangsat") >= high||similarity(text.split(" ")[1], "gaje") >= high)&&text.split(" ")[0] === "bot"){
      m.react(pickRandom(["😁", "😂", "🤗"]))
    }else if (similarity(text.split(" ")[0], "berapa") >= high&&text.split(" ")[2]){
      try {
        if(similarity(text.split(" ")[2], "ditambah") >= high||text.split(" ")[2] === "+"){
          let result = parseInt(text.split(" ")[1]) + parseInt(text.split(" ")[3])
          m.reply(`Hasil dari ${text.split(" ")[1]} + ${text.split(" ")[3]} = ${result}`); 
        }else if(similarity(text.split(" ")[2], "dikurangi") >= high||text.split(" ")[2] === "-"){
          let result = parseInt(text.split(" ")[1]) - parseInt(text.split(" ")[3])
          m.reply(`Hasil dari ${text.split(" ")[1]} - ${text.split(" ")[3]} = ${result}`); 
        }else if(similarity(text.split(" ")[2], "dikali") >= high||text.split(" ")[2] === "x"){
          let result = parseInt(text.split(" ")[1]) * parseInt(text.split(" ")[3])
          m.reply(`Hasil dari ${text.split(" ")[1]} x ${text.split(" ")[3]} = ${result}`); 
        }else if(similarity(text.split(" ")[2], "dibagi") >= high||text.split(" ")[2] === "/"){
          let result = parseInt(text.split(" ")[1]) / parseInt(text.split(" ")[3])
          m.reply(`Hasil dari ${text.split(" ")[1]} / ${text.split(" ")[3]} = ${result}`); 
        }else {
          m.reply("di apain ege, ditambah, dikali, dikurang atau di apa")
          if(idSession > -1){
            sessions[idSession].state = "jmlh"
          }else {
            sessions.push({"id": ids, "state": "jmlh"})
          }
        }
      }catch{
        m.reply("Maaf ada kesalahan")
      }
    }else if(similarity(text.split(" ")[0], "kaga") >= high||similarity(text.split(" ")[0], "engga") >= high){
      m.reply(pickRandom(["Ohh", "oo", "ohh kirain", "walah"]))
    }else if(similarity(text.split(" ")[0], "hoax") >= high||similarity(text.split(" ")[0], "halah") >= high){
      m.react("😂")
    }else if(text.includes("saya cewe")||text.includes("gw cewe")||text.includes("aku cewe")){
      m.react(pickRandom(["😀", "😍", "🥰", "😜"]))
    }else if(similarity(text, "kamu nanyea") >= medium){
      m.reply(pickRandom(["IYAA", "HOOH", "IYA AJG"]))
    }else if(text.includes("orang mana")){
      m.reply(pickRandom(["orang mars", "Aku orang mars kak", "aku orang bumi", "aku orang isekai"]))
    }else if(text.includes("om om")){
      m.react(pickRandom(["😏", "😒", "🙃", "😵", "🤨"]))
    }else if (text.includes("isekai")){
      m.reply(pickRandom(["WIBUU", "DASAR WIBU"]))
    }else if(similarity(text, "kamu bot?") >= medium||similarity(text, "lu bot?") >= medium){
      let txt = pickRandom("Iyaa", "Hooh", "Iya gw bot", "Lu kira gw apaan?, Babi?")
      m.reply(txt)
      if(txt.includes("Lu kira gw apaan?")){
        if(idSession > -1){
          sessions[idSession].state = "lkgpn"
        }else {
          sessions.push({"id": ids, "state": "lkgpn"})
        }
      };
    }else if(similarity(text, "keren kaga") >= medium||similarity(text, "keren kan") >= medium){
      m.reply(pickRandom("GG", "Bagus bet", "Keren Banget"))
      if(idSession > -1){
        sessions[idSession].state = "trim"
      }else {
        sessions.push({"id": ids, "state": "trim"})
      }
    }else if(similarity(text.split(" ")[0], "siapa") >= high&&(text.includes("pencipta")||text.includes("pembuat")||text.includes("owner"))&&(similarity(text.split(" ").pop(), "mu") >= high||similarity(text.split(" ").pop(), "kamu") >= high)){
      m.reply("Saya diciptakan oleh Syeif Sultoni Akbar menggunakkan NODEJS, similarity dan whatsapp-web.js");
      chat.sendMessage(await handler.getContactById('6281228020195@c.us'))
    }else if(similarity(text, "apa pekerjaan mu") >= low){
      m.reply(pickRandom(["Makan, Tidur doang", "Pengganguran", "Turu", "Rebahan"]))
    }else if(await m.mentionedIds.includes(await handler.info.me.user)){
      m.reply(pickRandom(["Apaan?", "Ada apa?", "Affah?", "Ngapain ngetag?"]))
    };
  }
  
  if (idSession > -1){
    let state = sessions[idSession].state;
    if(state === "apkbr"){
      if(similarity(text.split(" ")[0], "baik") >= high){
        const bWord = ["Alhamdulillah", "Okok sip"]
        m.react("👌")
        m.reply(pickRandom(bWord))
        sessions[idSession].state = ""
      }else if(similarity(text.split(" ")[0], "buruk") >= high){
        const bWord = ["Waduh kenapa?", "Sini cerita"]
        m.react("👌")
        m.reply(pickRandom(bWord))
        sessions[idSession].state = "crty"
      }else {
        m.react("👌")
        m.reply("Okk")
        sessions[idSession].state = ""
      }
    }else if(state === "crty"){
      m.reply(pickRandom(["Yaudah, Yang sabar ya, TETAP SEMANGAT!!", "TETAP SEMANGAT!!, jangan putus asa"]))
      sessions[idSession].state = ""
    }else if(state === "woireac"){
      if(!sessions[idSession].repeat){
        m.reply(pickRandom(["Oalah", "Ohh"]))
        sessions[idSession].repeat = true
      }else {
        if(text.includes("woi")){
          m.reply(pickRandom(["Asw", "Bacod kontol"]))
          sessions[idSession].repeat = false
          sessions[idSession].state = ""
        }else {
          sessions[idSession].repeat = false
          sessions[idSession].state = ""
          next()
        }
      }
    }else if(state === "woireack"){
      if(similarity(text.split([" "])[0]+""+text.split([" "])[1], "tidak ramah"||text.includes("ngegas")||text.includes("ajg")||text.includes("ajg")) >= medium){
        m.react("🤣")
        sessions[idSession].state = ""
      }else {
        sessions[idSession].state = ""
        next()
      }
    }else if(state === "rbhn"){
      m.reply(pickRandom(["Mager jawab :v, lagi rebahan", "ohh, males, gw lagi rebahan"]))
      sessions[idSession].state = ""
    }else if(state === "pe"){
      m.reply(pickRandom(["BGST", "ANJ", "Dasar OM OM", "SAT"]))
      sessions[idSession].state = ""
    }else if(state === "trim"){
      if(similarity(text, "trimakasih") >= medium){
        m.reply("sama sama :)");
        sessions[idSession].state = ""
      }else {
        sessions[idSession].state = ""
        next()
      }
    }else if(state === "mggl"){
      if(similarity(text, "iya") >= high){
        m.reply(pickRandom(["Kenapa emang?", "Ada apa manggil?"]))
        sessions[idSession].state = ""
      }else {
        sessions[idSession].state = ""
        next()
      }
    }else if (state === "jmlh"){
      if(text.includes("ditambah")||text.includes("dikali")||text.includes("dikurangi")||text.includes("dibagi")){
        m.reply("yaudah, tulis aja, contoh 'Berapa 1 dikali 1'")
        sessions[idSession].state = ""
      }else {
        sessions[idSession].state = ""
        next()
      }
    }else if(state === "lkgpn"){
      if(text.includes("iya")||text.includes("hooh")){
        m.reply(pickRandom(["BGST", "ANJ", "WTF"]))
        sessions[idSession].state = ""
      }else {
        sessions[idSession].state = ""
        next()
      }
    }else { 
      sessions[idSession].repeat = false
      sessions[idSession].state = ""
      next()
    }
    console.log(`STATE : ${state}`)
  }else { next() }
  // for (let contact of mention){
  //   m.reply(`Apaan ngetag ngetag ${names}`);
  // }
})