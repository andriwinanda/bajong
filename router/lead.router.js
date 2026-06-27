const express = require('express')

const { create, findAll, findOne, update, deleteOne, notifyUser } = require('../services/lead.service')

const routes = express.Router()
routes.post('/', create)
routes.get('/', findAll)
// routes.post( '/notification/:userId', notifyUser )
routes.get('/:id', findOne)
routes.put('/:id', update)
routes.delete('/:id', deleteOne)

module.exports = routes
