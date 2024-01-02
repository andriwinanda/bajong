const express = require( 'express' )

const {create, findAll, findOne, update, deleteOne, getDetails} = require( '../services/user.service' )

const routes = express.Router()
routes.post( '/', create)
routes.get( '/', findAll)
routes.get( '/detail/:id', findOne )
routes.get( '/details', getDetails )
routes.put( '/:id', update )
routes.delete( '/:id', deleteOne )

module.exports = routes