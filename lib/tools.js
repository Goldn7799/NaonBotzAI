const request = require("request")
const fs = require("fs")

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
  }
  return result;
}
const downloadImage = (url, filename, callback) => {
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(filename))
      .on('close', callback);
  });
};
const pickRandomObject = (wordList)=>{
  return wordList[Math.floor(Math.random() * wordList.length)]
};
const pickRandomString = (wordList)=>{
  return `${wordList[Math.floor(Math.random() * wordList.length)]}`
}
const saveImageString = (image, name)=>{
  const imageBuffer = Buffer.from(image, "base64");
  fs.writeFileSync(`./tmp/${name}.png`, imageBuffer, (err)=>{
    if(err){
      console.error(err);
    };
  });
}

module.exports = {
  makeid,
  downloadImage,
  pickRandomObject,
  pickRandomString,
  saveImageString
}