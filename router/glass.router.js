const express = require( 'express' )
const { authJwt } = require("../middleware/auth.middleware");

const {create, findAll, findOne, update, massUpdate, deleteOne} = require( '../services/glass.service' )

const routes = express.Router()
routes.post( '/', create)
routes.get( '/', findAll )
routes.get( '/:id', findOne )
routes.put( '/:id', update )
routes.post( '/massupdate', massUpdate )
routes.delete( '/:id', deleteOne )

module.exports = routes