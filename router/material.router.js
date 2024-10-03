const express = require( 'express' )

const {create, findAll, findOne, update, massUpdate, deleteOne} = require( '../services/material.service' )

const routes = express.Router()
routes.post( '/', create)
routes.get( '/', findAll )
routes.get( '/:id', findOne )
routes.put( '/:id', update )
routes.post( '/massupdate', massUpdate )
routes.delete( '/:id', deleteOne )

module.exports = routes