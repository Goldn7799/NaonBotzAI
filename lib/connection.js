const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require("qrcode-terminal")

const host = new Client({
  authStrategy: new LocalAuth({
    clientId: "host"
  })
});

host.on('qr', qr => {
  qrcode.generate(qr, {small: true});
});

host.on('ready', () => {
  console.log('Client is ready!');
});

host.on("authenticated", (session)=>{
  console.log("Connected To Whatsapp")
})

// client.on('message', message => {
// 	console.log(message.body);
// });


// client.initialize();
module.exports = {
  Host: host
}