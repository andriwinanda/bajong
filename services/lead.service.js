const LeadModel = require('../models/lead.model')
const UserModel = require('../models/user.model')
const { sendNotificationToTokens } = require('./firebase.service')

const ALLOWED_STATUSES = ['new', 'contacted', 'qualified', 'closed']

function buildLeadPayload(body) {
  const { name, phone, notes, source, message, status, branch, location, assignedUser } = body
  const payload = { name, phone, notes, source, message, status, branch, location, assignedUser }
  if (!assignedUser) delete payload.assignedUser
  return payload
}

function buildLeadUpdatePayload(body) {
  const { name, phone, notes, source, message, status, branch, location, assignedUser } = body
  const payload = { name, phone, notes, source, message, status, branch, location, assignedUser }
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined) delete payload[key]
  })
  if (!assignedUser) delete payload.assignedUser
  return payload
}

async function sendLeadNotification(lead) {
  try {
    // 1. Use findOne since you only expect a single user per branch email match
    const user = await UserModel.findOne({
      email: 'delica' + lead.branch
    })

    // 2. Add an explicit safety check to prevent a TypeError crash
    if (!user) {
      console.warn(`[Notification Warning]: No branch user found for email: delica${lead.branch}`)
      return
    }

    // 3. Fallback safely if arrays or properties are missing
    const tokens = user.fcmTokens && user.fcmTokens.length
      ? user.fcmTokens
      : (user.fcmToken ? [user.fcmToken] : [])

    if (tokens.length === 0) {
      console.warn(`[Notification Warning]: User delica${lead.branch} has no valid FCM tokens registered.`)
      return
    }

    // 4. Send the notification exactly ONCE
    await sendNotificationToTokens(tokens, {
      title: `Calon Customer Baru`,
      body: `${lead.name}, Segera dihubungi yaa!`,
      data: {
        leadId: lead._id.toString()
      }
    })

    console.log(`[Notification Success]: Sent to delica${lead.branch} (${tokens.length} tokens)`)
  } catch (error) {
    console.error('Send notification error:', error)
  }
}

async function create(req, res) {

  try {
    const lead = new LeadModel(buildLeadPayload(req.body))
    const data = await lead.save()
    // send notif
    // console.log(data)

    // Fire the background notification task ONCE. Do not use setTimeout.
    sendLeadNotification(lead)


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
  const { keyword, status, branch, assignedUser } = req.query
  const query = {}

  if (status && !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `status must be one of: ${ALLOWED_STATUSES.join(', ')}`
    })
  }

  if (keyword) {
    query.$or = [
      { name: { "$regex": keyword, "$options": "i" } },
      { phone: { "$regex": keyword, "$options": "i" } },
      { source: { "$regex": keyword, "$options": "i" } },
      { notes: { "$regex": keyword, "$options": "i" } },
      { branch: { "$regex": keyword, "$options": "i" } },
      { location: { "$regex": keyword, "$options": "i" } },
      { status: { "$regex": keyword, "$options": "i" } }
    ]
  }
  if (status) query.status = status
  if (branch) query.branch = branch
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
  console.log(req)
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
