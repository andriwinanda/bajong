const express = require( 'express' )
const basicAuth = require('express-basic-auth')
const controller = require( "../services/auth.service" )


const routes = express.Router()

routes.use(basicAuth({
  users: { 'delica-client' : 'delica-secret' },
  unauthorizedResponse: getUnauthorizedResponse
}))

function getUnauthorizedResponse(req) {
  return req.auth
      ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
      : 'No credentials provided'
}

// routes.use( function ( req, res, next )
// {
//   if ( req.headers && req.headers.authorization && req.headers.authorization.split( ' ' )[ 0 ] === 'Basic' )
//   {
//     // const grant = Buffer.from( req.headers.authorization.split( ' ' )[ 1 ], "base64" ).toString( "ascii" ).split( ':' )
//     // if ( grant[ 0 ] === process.env.GRANT_USERNAME && grant[ 1 ] === process.env.GRANT_PASSWORD )
//     // {
//     //   next()
//     // }

//     // jwt.verify( req.headers.authorization.split( ' ' )[ 1 ], config.secret, function ( err, decode )
//     // {
//     //   if ( err ) req.user = undefined
//     //   req.user = decode
//     //   console.log( decode)
//     //   next()
//     // } )
//   } else
//   {

//     // return res.status( 401 ).json( { message: 'Authentication failed. Invalid user or password.' } )
//     // req.user = undefined
//     // next()
//   }
// } )

routes.post( "/token", controller.signin )

module.exports = routes