require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const XMLHttpRequest = require('xhr2')
const fs = require('fs');
const jsdom = require("jsdom")
const { JSDOM } = jsdom
const https = require('https');
const { URL } = require('url');
const cheerio = require('cheerio');
const app = express();
app.use(bodyParser.json());

const {TEL_TOKEN,URL_NGROCK} = process.env;
const WEBHOOK_END = '/webhook/' + TEL_TOKEN
const TEL_API = `https://api.telegram.org/bot${TEL_TOKEN}`;
const WEBHOOK_URL = URL_NGROCK + WEBHOOK_END;

const setWebHookUrl = async () =>{
    const res = await axios.get(`${TEL_API}/setWebhook?url=${WEBHOOK_URL}`)
};

  function testarDiretorio(diretorio,res,chat_id,urlBase) {
    let url = urlBase + diretorio + "/";
    console.log("Diretório Não existe: " + url);
    fetch(url)
      .then(response => {
        if (response.ok) {
            console.log("Diretório encontrado: " + url);
            text = url;
            axios.post(`${TEL_API}/sendMessage`,{
            chat_id,
            text,
            });
            return res.send();
        }
      }).catch((err)=>{
        console.log("erro qualquer " + err.message);
      });
  }
app.post(WEBHOOK_END,async(req,res)=>{
    const chat_id = req.body.message.chat.id;
    let text = req.body.message.text;
    console.log(text);
    let seisPrimeiros = text.substring(0, 6);
    let urlFinal = text.substring(6,text.length);
    console.log(seisPrimeiros);
    if (seisPrimeiros === "/list ") {
      listarDiretorios(urlFinal,res,chat_id,text)
    }else{
      text = "este não é um comando válido"
      axios.post(`${TEL_API}/sendMessage`,{
        chat_id,
        text,
        });
        return res.send();
    }
    //listarDiretorios(text,res,chat_id,text)
  });

  function listarDiretorios(siteUrl,resposta,chat_id,text) {
    https.get(siteUrl, (res) => {
      let data = '';
  
      res.on('data', (chunk) => {
        data += chunk;
      });
  
      res.on('end', () => {
        const $ = cheerio.load(data);
        const links = $('a[href^="/"]');
  
        console.log('Lista de diretórios ocultos:');
        links.each((i, link) => {
          console.log(link.attribs.href);
          text = link.attribs.href;
          axios.post(`${TEL_API}/sendMessage`,{
            chat_id,
            text,
            });       
        });
        return resposta.send();
      });
    }).on('error', (err) => {
      console.log('Erro: ' + err.message);
    });
  }
  

app.listen(process.env.PORT || 3000,()=>{
    console.log("Server ligado" , process.env.PORT || 3000);
    setWebHookUrl();    
})