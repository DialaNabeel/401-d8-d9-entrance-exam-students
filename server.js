'use strict'
// -------------------------
// Application Dependencies
// -------------------------
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
const { render } = require('ejs');

// -------------------------
// Environment variables
// -------------------------
require('dotenv').config();
const HP_API_URL = process.env.HP_API_URL;

// -------------------------
// Application Setup
// -------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Application Middleware override
app.use(methodOverride('_method'));

// Specify a directory for static resources
app.use(express.static('./public'));
app.use(express.static('./img'));

// Database Setup

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Set the view engine for server-side templating

app.set('view engine', 'ejs');


// ----------------------
// ------- Routes -------
// ----------------------

app.get('/home',showHouse)
app.get('/house_name',houseName)
app.post('/house_name',addHouse)
app.get('/house_name',renderFavorite)
app.get('/character/character_id/:id',editChar)
app.put('/character/character_id/:id',updateChar)
app.delete('/character/character_id/:id',deleteChar)
// --------------------------------
// ---- Pages Routes functions ----
// --------------------------------
function showHouse(req,res) {
    res.render('home')

}

///get from api
function houseName(req,res) {
    let arr=[];
    let url = 'http://hp-api.herokuapp.com/api/characters/house/gryffindor';
    superagent.get(url).then(data => {
        data.body.forEach(element => {
            arr.push(new hary(element));
        });
        res.render('characters',{result:arr});
    }).catch(error => console.log(`Could not connect to database\n${error}`));

}


//constructor function for
function hary(data){
    this.name=data.name;
    this.house=data.house;
    this.patronus=data.patronus;
}

// -----------------------------------
// --- CRUD Pages Routes functions ---
// -----------------------------------

//add to database
function addHouse(req,res){
    let query = 'INSERT INTO hary(name,house) VALUES ($1,$2);'
   let values = [req.body.name,req.body.house]
   client.query(query,values).then(()=>{
       res.redirect('/house_name')
   }).catch(error => console.log(`Could not connect to database\n${error}`)); 
}

//bring from database 
function renderFavorite(req,res){
    let query = 'SELECT * FROM hary;';
    client.query(query).then(data=>{
        res.render('characters',{result:data.rows});
    }).catch(error => console.log(`Could not connect to database\n${error}`)); 

}

//edit char 
function editChar(req,res){
    let query = 'SELECT * FROM hary WHERE id=$1;'
    let values =[req.params.id];
    client.query(query).then(data=>{
        res.render('characters',{result:data.rows[0]});
    }).catch(error => console.log(`Could not connect to database\n${error}`)); 

}

//updateChar
function updateChar(req,res){
let query = 'UPDATE hary SET name=$1 , patronus=$2 WHERE id=$3;'
let values= [req.body.name,req.body.patronus,req.params.id];
client.query(query,values).then(()=>{
    res.redirect('/character/character_id')
}).catch(error => console.log(`Could not connect to database\n${error}`));
}

//deleteChar
function deleteChar(req,res){
let query = 'DELETE FROM hary WHERE id=1;'
let values = [req.params.id]
client.query(query,values).then(()=>{
    res.redirect('/character/character_id')
}).catch(error => console.log(`Could not connect to database\n${error}`));
}



// Express Runtime
client.connect().then(() => {
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
}).catch(error => console.log(`Could not connect to database\n${error}`));
