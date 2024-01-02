const express = require( 'express' )
const { authJwt } = require("../middleware/auth.middleware");

const {create, findAll, findOne, update, deleteOne} = require( '../services/glass.service' )

const routes = express.Router()
routes.post( '/', create)
routes.get( '/', findAll )
routes.get( '/:id', findOne )
routes.put( '/:id', update )
routes.delete( '/:id', deleteOne )

module.exports = routes