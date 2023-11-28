const express = require( 'express' )
const s3 = require( 's3' )
const fs = require( 'fs' )
const fileUpload = require( 'express-fileupload' )




// Creating S3 client
var client = s3.createClient( {
  maxAsyncS3: 20, // this is the default
  s3RetryCount: 3, // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    // Using the keys from our AWS IAM user
    accessKeyId: process.env.ACCESSKEY,
    secretAccessKey: process.env.SECRETACCESSKEY,

    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
} )


const routes = express.Router()
// routes.post( '/', create )
// routes.get( '/', findAll )
// routes.get( '/:id', findOne )
// routes.put( '/:id', update )
// routes.delete( '/:id', deleteOne )




// Sending the HTML file when the user goes to `http://localhost:3000/`
// routes.get( '/', function ( req, res )
// {
//   res.sendFile( path.join( __dirname, '/views', 'index.html' ) )
// } )

// This is Express.js middleware to parse and handle the files we upload from our HTML page
routes.use( fileUpload() )


// Post route to handle uploading of a file
routes.post( '/', function ( req, res )
{
  // Sending error back when no files were uploaded
  console.log(req.files)
  // console.log(upload)

  if ( !req.files )
  {
    return res.status( 400 ).send( 'No files were uploaded.' )
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file (this must match the HTML name attribute on the input element)
  var sampleFile = req.files.sampleFile

  var newFileName = req.files.sampleFile.name // creating unique file name based on current time and file name of file uploaded, that way if two people upload the same file name it won't overwrite the existing file

  // Use the mv() method to place the file somewhere on your server (in this case we are placing it to the `uploads` folder with the name that we just created above, newFileName)
  sampleFile.mv( 'uploads/' + newFileName, function ( err )
  {
    // If there was an error send that back as the response
    if ( err )
    {
      return res.status( 500 ).send( err )
    }

    // Upload to S3
    var params = {
      // The file on our server that we want to upload to S3
      localFile: 'uploads/' + newFileName,


      s3Params: {
        Bucket: process.env.BUCKETNAME,
        Key: newFileName, // File path of location on S3
      },
    }
    var uploader = client.uploadFile( params )
    // On S3 error
    uploader.on( 'error', function ( err )
    {
      // On error print the error to the console and send the error back as the response
      console.error( "unable to upload:", err.stack )
      res.status( 500 ).send( err.stack )
    } )
    // On S3 success
    uploader.on( 'end', function ()
    {
      // Print done uploading on success
      console.log( "done uploading" )
      // Send back a success message as the response
      res.send( 'File uploaded!' )
      //Removing file from server after uploaded to S3
      fs.unlink( 'uploads/' + newFileName )
    } )
  } )
} )


module.exports = routes
