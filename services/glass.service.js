const GlassModel = require( '../models/glass.model' )
const LocationModel = require( '../models/location.model' )


async function create ( req, res )
{
  try
  {
    const { name, description, price } = req.body
    const glass = new GlassModel( { name, description } )
    const glassId = glass['_id'].toString()
    await glass.save()
    for (const i in price) {
      const selectedLocation = await LocationModel.findById( i )
      const { location, description, idMaterialPrice, idGlassPrice } = selectedLocation
      selectedLocation.idGlassPrice[glassId] = price[i]
      const locationItem = new LocationModel( { location, description, idMaterialPrice, idGlassPrice }, { _id : false } )
      await LocationModel.findByIdAndUpdate( i, locationItem )
    }
    return res.status( 200 ).json( {
      message: 'Ok'
    } )
  } catch ( error )
  {
    return res.status( 500 ).json( {
      message: error.message
    } )
  }
}

async function findAll ( req, res )
{
  const { keyword } = req.query
  const query = {}
  if ( keyword ) query.name = { "$regex": keyword, "$options": "i" }
  try
  {
    const data = await GlassModel.find( query )
    const location = await LocationModel.find()
    for (i in data) {
      data[i].price = {}
      for (j in location) {
        data[i].price[location[j].location] = location[j].idGlassPrice[data[i]._id.toString()]
      }
    }
    return res.status( 200 ).json( data )
  } catch ( error )
  {
    return res.status( 500 ).json( {
      message: error.message
    } )
  }
}
async function findOne ( req, res )
{
  const id = req.params.id
  try
  {
    const data = await GlassModel.findById( id )
    if ( data )
    {
      const location = await LocationModel.find()
      data.price = {}
      for (j in location) {
        data.price[location[j].location] = location[j].idGlassPrice[data._id.toString()]
      }
      return res.status( 200 ).json( data )
    }

    return res.status( 404 ).json( {
      message: 'Not Found',
    } )
  } catch ( error )
  {
    return res.status( 500 ).json( {
      message: error.message
    } )
  }
}

async function update ( req, res )
{
  const { name, description, price } = req.body
  const glass = new GlassModel( { name, description }, { _id : false } )
  const { id } = req.params
  try
  {
    await GlassModel.findByIdAndUpdate( id, glass )
    for (const i in price) {
      const selectedLocation = await LocationModel.findById( i )
      const { location, description, idMaterialPrice, idGlassPrice } = selectedLocation
      selectedLocation.idGlassPrice[id] = price[i]
      const locationItem = new LocationModel( { location, description, idMaterialPrice, idGlassPrice }, { _id : false } )
      await LocationModel.findByIdAndUpdate( i, locationItem )
    }
    return res.status( 200 ).json( {
      message: 'Ok'
    } )
  } catch ( error )
  {
    return res.status( 500 ).json( {
      message: error.message
    } )
  }
}

async function deleteOne ( req, res )
{
  const id = req.params.id
  try
  {
    const locations = await LocationModel.find()
    for (const i in locations) {
      
      const selectedLocation = locations[i]
      const locationId = selectedLocation['_id'].toString()
      const { location, description, idMaterialPrice, idGlassPrice } = selectedLocation
      delete idGlassPrice[id]
      const locationItem = new LocationModel( { location, description, idMaterialPrice, idGlassPrice }, { _id : false } )
      await LocationModel.findByIdAndUpdate( locationId, locationItem )
    }
    await GlassModel.findByIdAndDelete( id )

    return res.status( 200 ).json( {
      message: 'Ok',
    } )
  } catch ( error )
  {
    return res.status( 500 ).json( {
      message: error.message
    } )
  }
}

module.exports = { create, findAll, findOne, update, deleteOne }

