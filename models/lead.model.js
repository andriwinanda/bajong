const mongoose = require( 'mongoose' )
const { Schema } = mongoose

const leadSchema = new Schema( {
  name: {
    type: String,
    required: true
  },
  phone: String,
  source: String,
  notes: String,
  message: String,
  location: String,
  branch: {
    type: String,
    default: 'jakarta'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'closed'],
    default: 'new'
  },
  assignedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
} )

leadSchema.set( 'toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function ( doc, ret, options )
  {
    ret.idLead = ret._id
    delete ret.id
    delete ret._id
    delete ret.__v
  }
} )

module.exports = mongoose.model( 'Lead', leadSchema )
