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
const LeadRouter = require( './lead.router' )
const UploadRouter = require( './upload.router' )
const Auth = require( './auth.router' )
const AppRouter = require( './app.router' )
const { hitung, deleteImage, generateImage } = require( '../services/product.service' )
const { notifyUser, create } = require( '../services/lead.service' )

const notificationRequestTimes = new Map()
const NOTIFICATION_RATE_LIMIT_MS = 500

function notificationRateLimit ( req, res, next )
{
  const key = req.params.userId || req.ip
  const now = Date.now()
  const lastRequestAt = notificationRequestTimes.get( key ) || 0

  if ( now - lastRequestAt < NOTIFICATION_RATE_LIMIT_MS )
  {
    return res.status( 429 ).json( {
      message: 'Too many notification requests. Please wait 500ms before retrying.'
    } )
  }

  notificationRequestTimes.set( key, now )
  setTimeout( () =>
  {
    if ( notificationRequestTimes.get( key ) === now ) notificationRequestTimes.delete( key )
  }, NOTIFICATION_RATE_LIMIT_MS )
  next()
}


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
router.post( '/product/hitung', hitung )
router.post( '/product/image/generate', generateImage )
router.post( '/product/image/delete', deleteImage )
router.use( '/product', authHandler.loginRequired, ProductRouter )
router.use( '/series', authHandler.loginRequired, SeriesRouter )
router.use( '/user', authHandler.loginRequired, UserRouter )
router.post( '/leads/notification/:userId', notificationRateLimit, notifyUser )
router.post('/leads', create)
router.use( '/leads', authHandler.loginRequired, LeadRouter )
router.use( '/upload', authHandler.loginRequired, UploadRouter )
router.use( '/oauth', Auth )
router.use( '/app', AppRouter )

module.exports = router
