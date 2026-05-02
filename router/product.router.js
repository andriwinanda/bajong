const express = require( 'express' )

const {create, findAll, findOne, update, deleteOne, hitung} = require( '../services/product.service' )

const routes = express.Router()
routes.post( '/', create)
routes.get( '/', findAll )
routes.get( '/:id', findOne )
routes.put( '/:id', update )
routes.delete( '/:id', deleteOne )
routes.post( '/hitung', hitung )

module.exports = routes