const express = require( 'express' )
const fileUpload = require( 'express-fileupload' )
const cors = require( 'cors' )
const routes = require( './router/routes' )
const bodyParser = require("body-parser");



const app = express()

require( 'dotenv' ).config()


app.use( express.json() )
app.use( cors() )

// use bodyParser middleware on express app
app.use(bodyParser.urlencoded({ extended:  true }));
app.use(bodyParser.json());

// This is Express.js middleware to parse and handle the files we upload from our HTML page
app.use( fileUpload() )

const connectDB = require( './connectMongo' )

connectDB()

app.use( '/api', routes )

const PORT = process.env.PORT

app.listen( PORT, () =>
{
  console.log( "Server is running on port " + PORT )
} )