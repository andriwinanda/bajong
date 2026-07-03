const express = require( 'express' )

const {create, findAll, findOne, update, deleteOne, getDetails, updateFcmToken, deleteFcmToken} = require( '../services/user.service' )

const routes = express.Router()
routes.post( '/', create)
routes.get( '/', findAll)
routes.get( '/detail/:id', findOne )
routes.get( '/details', getDetails )
routes.post( '/fcm-token', updateFcmToken )
routes.delete( '/fcm-token', deleteFcmToken )
routes.put( '/:id', update )
routes.delete( '/:id', deleteOne )

module.exports = routes
