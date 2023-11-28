const mongoose = require( 'mongoose' )
const { Schema } = mongoose

const seriesSchema = new Schema( {
  type: String,
  availability: Array,
  doorLeaves: Array
} )

seriesSchema.set( 'toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function ( doc, ret, options )
  {
    ret.idSeries = ret._id
    delete ret.id
    delete ret._id
    delete ret.__v
  }
} )

module.exports = mongoose.model( 'Series', seriesSchema )