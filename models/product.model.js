const mongoose = require( 'mongoose' )
const { Schema } = mongoose

const productSchema = new Schema( {
  type: String,
  series: Number,
  doorLeaves: Number,
  description: String,
  fixGlassTop: Boolean,
  fixGlassBottom: Boolean,
  material: Array,
  imageUrl: String
} )
productSchema.set( 'toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function ( doc, ret, options )
  {
    ret.idProduct = ret._id
    delete ret.id
    delete ret._id
    delete ret.__v
  }
} )
module.exports = mongoose.model( 'Product', productSchema )