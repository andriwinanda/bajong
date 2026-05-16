const express = require( 'express' )

const {create, findAll, findOne, update, deleteOne, hitung, deleteImage} = require( '../services/product.service' )

const routes = express.Router()
routes.post( '/', create)
routes.get( '/', findAll )
routes.get( '/:id', findOne )
routes.put( '/:id', update )
routes.delete( '/:id', deleteOne )
routes.post( '/hitung', hitung )
routes.post( '/image/delete', deleteImage )

module.exports = routes