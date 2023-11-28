const mongoose = require( 'mongoose' )
const { Schema } = mongoose

const materialSchema = new Schema( {
  name: String,
  description: String,
  price: Object
} )

materialSchema.set( 'toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function ( doc, ret, options )
  {
    ret.idMaterial = ret._id
    delete ret.id
    delete ret._id
    delete ret.__v
  }
} )
module.exports = mongoose.model( 'Material', materialSchema )