const express = require('express');
const route = require("./routes/route");
const  mongoose  = require('mongoose');
const app = express();


const multer= require("multer");
const { AppConfig } = require('aws-sdk');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://shradha_24:Ourcloudy007@cluster0.tovfx.mongodb.net/group07Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
}).then(() => console.log("MongoDb is connected")).catch(err => console.log(err));

app.use( multer().any())

app.use('/', route);

app.all('*', function(req, res) {
    throw new Error("Bad request")
})

app.use(function(e, req, res, next) {
    if (e.message === "Bad request") {
        res.status(400).send({status : false , error: e.message});
    }
});


app.listen(process.env.PORT || 4000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 4000))
});