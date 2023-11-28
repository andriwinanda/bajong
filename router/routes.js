const express = require( 'express' )
const jwt = require( "jsonwebtoken" )
const router = express.Router()
const config = require( "../auth.config" )
const authHandler = require( '../services/auth.service' )

const GlassRouter = require( './glass.router' )
const LocationRouter = require( './location.router' )
const MaterialRouter = require( './material.router' )
const ProductRouter = require( './product.router' )
const SeriesRouter = require( './series.router' )
const UserRouter = require( './user.router' )
const UploadRouter = require( './upload.router' )
const Auth = require( './auth.router' )


router.use( function ( req, res, next )
{
  if ( req.headers && req.headers.authorization && req.headers.authorization.split( ' ' )[ 0 ] === 'Bearer' )
  {
    jwt.verify( req.headers.authorization.split( ' ' )[ 1 ], config.secret, function ( err, decode )
    {
      if ( err ) req.user = undefined
      req.user = decode
      next()
    } )
  } else
  {
    req.user = undefined
    next()
  }
} )


router.use( '/glass', authHandler.loginRequired, GlassRouter )
router.use( '/location', authHandler.loginRequired, LocationRouter )
router.use( '/material', authHandler.loginRequired, MaterialRouter )
router.use( '/product', authHandler.loginRequired, ProductRouter )
router.use( '/series', authHandler.loginRequired, SeriesRouter )
router.use( '/user', authHandler.loginRequired, UserRouter )
router.use( '/upload', authHandler.loginRequired, UploadRouter )
router.use( '/oauth', Auth )

module.exports = router

