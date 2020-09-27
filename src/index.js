import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import TankAI from './TankAI';
import fs from 'fs';

const app = express();
const serverHTTP = http.createServer(app);
const serverWS = new WebSocket.Server({ 
  server: serverHTTP,
});

let playerAI1 = new TankAI();
let playerAI2 = new TankAI();

let got1 = false;
let got2 = false;
let won1;
let won2;

serverWS.on('connection', (ws) => {
  ws.on('message', (message) => {
    const obj = JSON.parse(message);
    if (obj.won !== undefined) {
      if (obj.playerId === 0) {
        got1 = true;
        won1 = obj.won;
      }
      if (obj.playerId === 1) {
        got2 = true;
        won2 = obj.won;
      }
    } else {
      if (got1 === true && got2 === true) {
        if (won1 === false && won2 === false) {
          if (Math.random() > 0.5) {
            playerAI2 = new TankAI(playerAI1);
            playerAI2.mutate();
          } else {
            playerAI1 = new TankAI(playerAI2);
            playerAI1.mutate();
          }
        } else {
          if (won1 === true) {
            fs.writeFileSync('ai.json', JSON.stringify(playerAI1));
            playerAI2 = new TankAI(playerAI1);
            playerAI2.mutate();
          } else {
            fs.writeFileSync('ai.json', JSON.stringify(playerAI2));
            playerAI1 = new TankAI(playerAI2);
            playerAI1.mutate();
          }
        }
        got1 = false;
        got2 = false;
      }
      if (obj.playerId === 0) {
        ws.send(JSON.stringify({
          actionId: obj.actionId,
          actions: playerAI1.decide(obj.environment),
        }));
      }
      if (obj.playerId === 1) {
        ws.send(JSON.stringify({
          actionId: obj.actionId,
          actions: playerAI2.decide(obj.environment),
        }));
      }
    }
  });
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.urlencoded());
app.use(express.json());

serverHTTP.listen(process.env.PORT || 8666, () => {
  console.log(`Server started on port ${serverHTTP.address().port} :)`);
});