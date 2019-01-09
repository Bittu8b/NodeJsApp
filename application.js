const express = require('express');
const Joi = require('joi');
const app = express();

const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mydb";

app.use(express.json());


MongoClient.connect(url,(err,db)=>{
    if(err){
        console.log('Error occured');
    }

    console.log('Database created');
    db.close();
});

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.createCollection("courses", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
  })


app.get('/',(req,res)=>{
    res.send('Welcome to home page');
});

//To retrieve all courses
app.get('/api/courses',(req,res)=>{

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("courses").find({}).toArray(function(err, result) {
          if (err) throw err;
          res.send(result);
          console.log(result);
          db.close();
        });
      });
});

//To get one single course not all courses
app.get('/api/courses/:id',(req,res)=>{
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var query = { id: parseInt(req.params.id) };
        dbo.collection("courses").find(query).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          res.send(result);
          db.close();
        });
      });
});

//For multiple parametrs
app.get('/api/posts/:year/:month',(req,res)=>{
    res.send(req.query);
});


//POST

app.post('/api/courses',(req,res) =>{

    const schema = { name: Joi.string().min(3).required() }
    var result = Joi.validate(req.body,schema);

    if(result.error){
        res.status(400).send(result.error.details[0].message);
        return;
    }

    if(req.body.name.length < 3){
        res.status(400).send('Name length must be greater than 2');
        return;
    }

    const course = { name: req.body.name , id: req.body.id };

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("courses").insertOne(course, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");

          db.close();
        });
      });
    res.send("Bellow course is added : \n" + course);
});

//PUT



//Delete one item by giving id of it
app.delete('/api/courses/:id',(req,res)=>{
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var query = { id: parseInt(req.params.id) };
        dbo.collection("courses").deleteOne(query,function(err, obj) {
          if (err) throw err;
          console.log(obj);
          res.send(obj.result.n + "item(s) deleted");
          db.close();
        });
      });
});

//To drop the entire collection
app.post('/api/courses/deleteall',(req,res)=>{
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("courses").drop(function(err, delOK) {
          if (err) throw err;
          if (delOK) {
              console.log("Collection deleted");
              res.send("Collection deleted");
          }
          db.close();
        });
      });
})





//PORT
const port = process.env.port || 3000;

app.listen(port,()=> console.log(`listening on por ${port}`)
);