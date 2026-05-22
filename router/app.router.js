const express = require( 'express' )

const { getVersion } = require( '../services/app.service' )

const routes = express.Router()
routes.get( '/version', getVersion )

module.exports = routes
