const express = require( 'express' )

const {create, findAll, findOne, update, deleteOne} = require( '../services/series.service' )

const routes = express.Router()
routes.post( '/', create)
routes.get( '/', findAll )
routes.get( '/:id', findOne )
routes.put( '/:id', update )
routes.delete( '/', deleteOne )

module.exports = routes