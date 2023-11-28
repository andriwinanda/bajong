const mongoose = require( 'mongoose' )
const { Schema } = mongoose

mongoose.ObjectId.get(v => v.toString())

const locationSchema = new Schema( {
  location: String,
  description: String,
  idMaterialPrice: Object,
  idGlassPrice: Object
} )

locationSchema.set( 'toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function ( doc, ret, options )
  {
    ret.idLocation = ret._id
    delete ret.id
    delete ret._id
    delete ret.__v
  }
} )

module.exports = mongoose.model( 'Location', locationSchema )