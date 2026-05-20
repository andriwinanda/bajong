const LeadModel = require('../models/lead.model')
const UserModel = require('../models/user.model')
const { sendNotificationToTokens } = require('./firebase.service')

function buildLeadPayload(body, userId) {
  const { name, email, phone, company, source, message, status, assignedUser } = body
  const payload = { name, email, phone, company, source, message, status, assignedUser, createdBy: userId }
  if (!assignedUser) delete payload.assignedUser
  return payload
}

function buildLeadUpdatePayload(body) {
  const { name, email, phone, company, source, message, status, assignedUser } = body
  const payload = { name, email, phone, company, source, message, status, assignedUser }
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined) delete payload[key]
  })
  if (!assignedUser) delete payload.assignedUser
  return payload
}

async function create(req, res) {
  try {
    const lead = new LeadModel(buildLeadPayload(req.body, req.user.id))
    const data = await lead.save()
    return res.status(200).json({
      message: 'Ok',
      data
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

async function findAll(req, res) {
  const { keyword, status, assignedUser } = req.query
  const query = {}
  if (keyword) {
    query.$or = [
      { name: { "$regex": keyword, "$options": "i" } },
      { email: { "$regex": keyword, "$options": "i" } },
      { phone: { "$regex": keyword, "$options": "i" } },
      { company: { "$regex": keyword, "$options": "i" } }
    ]
  }
  if (status) query.status = status
  if (assignedUser) query.assignedUser = assignedUser

  try {
    const data = await LeadModel.find(query).populate('assignedUser', 'name email role').sort({ createdAt: -1 })
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

async function findOne(req, res) {
  const id = req.params.id
  try {
    const data = await LeadModel.findById(id).populate('assignedUser', 'name email role')

    if (data) {
      return res.status(200).json(data)
    }

    return res.status(404).json({
      message: 'Not Found',
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

async function update(req, res) {
  const { id } = req.params
  try {
    const data = await LeadModel.findByIdAndUpdate(id, buildLeadUpdatePayload(req.body), { new: true })
    return res.status(200).json({
      message: 'Ok',
      data
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

async function deleteOne(req, res) {
  const id = req.params.id
  try {
    await LeadModel.findByIdAndDelete(id)
    return res.status(200).json({
      message: 'Ok',
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

async function notifyUser(req, res) {
  const { userId } = req.params
  const { title, body, data } = req.body
  const apiKey = req.headers['x-api-key']

  try {

    if (apiKey !== process.env.N8N_SECRET) {
      return res.status(401).json({
        message: 'Unauthorized'
      });
    }

    if (!title || !body) {
      return res.status(400).json({
        message: 'title and body are required'
      })
    }

    const user = await UserModel.findById(userId)
    if (!user) {
      return res.status(404).json({
        message: 'User Not Found'
      })
    }

    const tokens = user.fcmTokens && user.fcmTokens.length ? user.fcmTokens : [user.fcmToken]
    const result = await sendNotificationToTokens(tokens, { title, body, data })
    return res.status(200).json({
      message: 'Ok',
      data: result
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

module.exports = { create, findAll, findOne, update, deleteOne, notifyUser }
