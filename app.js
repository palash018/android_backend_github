const express = require("express");
var bodyParser = require("body-parser");
const path = require("path");
const Cors = require("cors");
const schedule = require("node-schedule");
const app = express();
const db=require("./db")
const jwt = require("jsonwebtoken");
require("dotenv").config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(Cors());
// parse application/json
app.use(bodyParser.json());
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
app.get('/')
app.post('/createUser',(req,res)=>{
  const obj=req.body;
  db.CreateUser(obj).then(r=>{
    req.body=r;
    res.json(req.body);
  }).catch(err=>{console.log(err)}); 
})
app.post('/login',(req,res)=>{
  const obj=req.body;
  db.Login(obj).then(r=>{
    req.body=r;
    console.log(r);
    res.json(req.body);
  })
})
function authenticate(req, res, next) {
  
  const auth_header = req.headers["authorization"];
  const token = auth_header && auth_header.split(" ")[1];
  console.log(token);
  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403);
    }
    
    req.body={...req.body,username:user};
    console.log(req.body);
    next();
  });
}
app.post('/createRoom',authenticate,(req,res)=>{
  const obj=req.body;
  db.CreateRoom(req.body).then((r)=>{
    req.body=r;
    res.json(req.body);
  });
})
app.post('/updateEvent',authenticate,(req,res)=>{
  db.UpdateEvent(req.body).then((r)=>{
    req.body=r;
    res.json(req.body);
  })
})
app.post('/testEvent',authenticate,(req,res)=>{
  db.testEvent(req.body).then((r)=>{
    req.body=r;
    res.json(req.body);
  })
});
app.post('/joinRoom',authenticate,(req,res)=>{
  db.joinRoom(req.body).then((r)=>{
    req.body=r;
    res.json(req.body);
  })
});
app.get('/roomdata',authenticate,(req,res)=>{
  const room_id=req.query.room_id;
  const obj={...req.body,room_id:room_id}
  db.getData(obj).then((r)=>{
    req.body=r;
    console.log(req.body);
    res.json(req.body);
  })
})
app.get('/roomlist',authenticate,(req,res)=>{

  const obj=req.body;
   db.getRooms(obj).then((r)=>
 { req.body=r; 
   res.json(req.body);
})
})