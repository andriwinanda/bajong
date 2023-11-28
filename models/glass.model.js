const mongoose = require( 'mongoose' )
const { Schema } = mongoose


const glassSchema = new Schema( {
  name: String,
  description: String,
  price: Object
} )

glassSchema.set( 'toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function ( doc, ret, options )
  {
    ret.idGlass = ret._id
    delete ret.id
    delete ret._id
    delete ret.__v
  }
} )

module.exports = mongoose.model( 'Glass', glassSchema )