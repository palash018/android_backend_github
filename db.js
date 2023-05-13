const fs = require('file-system');
const {Client,Pool} = require('pg');
const  {Blob} = require('buffer');
const bcrypt=require('bcrypt');
const jwt = require("jsonwebtoken");
const csv = require('csv-parser');
require("dotenv").config();
  const connectionString = 'postgres://admin:X3Q5KRGr6eAB8SMvpgJo89B5tYVK0jiv@dpg-cglaon0rddleudr10bfg-a.singapore-postgres.render.com/project_jkws?ssl=true';
  const pool = new Pool({
    connectionString: connectionString,
  })
 
  async function CheckUser(username){
    const val=await pool.query('SELECT * FROM users WHERE username=$1',[username]);
    if(val.rows.length!==0){
      console.log('this happened');
      return false;
    }
    return true;
  }
  async function CheckEmail(email){
    console.log('function ran2');
   
    const val=await pool.query('SELECT * FROM users WHERE email=$1',[email]);
    if(val.rows.length!=0){
      return false;
    }
    return true;
  }
  async function CreateUser(obj){
   
    console.log('function ran1');
    const check_mail=await CheckEmail(obj.email);
    const check_user=await CheckUser(obj.username);
    console.log(check_user);
    if(!check_user){
      return {sucess:false,message:"username already taken"};
    }  
    if(!check_mail){
      return {sucess:false,message:"email already taken"};
    }
    const hash=await bcrypt.hash(obj.password,8);
    obj.password=hash;
    await pool.query("INSERT INTO users (username,email,password) VALUES ($1, $2, $3)", [obj.username,obj.email,obj.password]).catch(err => console.log(err));
    
    return {sucess:true,message:"OK"};
  }
  async function Login(obj){
    console.log(obj);
    const val=await pool.query('SELECT * FROM users WHERE username=$1',[obj.username]);
    if(val.rows.length==0){
      return {success:false,message:"username doesn't exists"};
    }
    console.log(val.rows[0].password);
    console.log(obj.password);
    const value=await bcrypt.compare(obj.password,val.rows[0].password);
    console.log('b',value);
      if(value==true){
        const access_Token = jwt.sign(
          obj.username,
          process.env.ACCESS_TOKEN_SECRET
        );
         return {sucess:true,token:access_Token,username:obj.username};
      }
      return {sucess:false,message:'password does not match'};
  }
 async function CreateRoom(obj){
  
  await pool.query('INSERT INTO rooms(room_name,username,lat,long,circle) VALUES ($1,$2,$3,$4,$5)',[obj.room_name,obj.username,obj.lat,obj.long,obj.circle]).catch(err=>{console.log(err); return{sucess:false,message:"Some problem occured"}});
  return {sucess:true,message:"OK"}; 
  
 }
 async function UpdateEvent(obj){
  try{const val=await pool.query("INSERT INTO logs(username,room_id,event,time) VALUES($1,$2,$3,CURRENT_TIMESTAMP)",[obj.username,obj.room_id,obj.event]).catch(err=>console.log(err));
  return {sucess:true,message:'event updated'};
 }
 catch{
  return {success:false,message:"event updated failed"};
 }
}
async function testEvent(obj){
  
}
async function joinRoom(obj){
  const val=await pool.query("SELECT * FROM rooms WHERE room_id=$1",[obj.room_id]).catch((err)=>console.log(err));
  if(val.rows==0){
    return {sucess:false,message:"Room not found"};
  }
  const val1=await pool.query("INSERT INTO members(room_id,username,event) VALUES ($1,$2,CURRENT_TIMESTAMP)",[obj.room_id,obj.username]).catch((err)=>console.log(err));
  return {sucess:true,message:"Room joined"};
}
async function getData(obj){
  console.log(obj);
  const val=await pool.query("SELECT * FROM rooms WHERE room_id=$1 AND username=$2",[obj.room_id,obj.username]).catch((err)=>console.log(err));
  if(val.rows==0){
    return {sucess:false,message:"Unauthorized"};
  }
  try{
  const val1=await pool.query("SELECT * FROM logs WHERE room_id=$2  ORDER BY $1",['TimeStamp',obj.room_id]).catch((err)=>console.log(err));
  return {sucess:true,data:val1.rows};
  }
  catch{
    return {suces:false,message:"some error occured"};
  }
}
async function getRooms(obj){
  
  try{const val=await pool.query("SELECT * FROM rooms INNER JOIN members ON rooms.room_id = members.room_id AND members.username =$1",[obj.username]).catch((err)=>console.log(err));
  const val1=await pool.query("SELECT * FROM rooms WHERE username=$1",[obj.username]).catch((err)=>console.log(err));
  return {sucess:true,data:{owner:val1.rows,member:val.rows}};
}
catch{
  return {sucess:false,message:"some error occured"};
}
}
  module.exports={
    CreateUser,
    Login,
    CreateRoom,
    UpdateEvent,
    testEvent,
    joinRoom,
    getData,
    getRooms
  }
// test 
// 123
