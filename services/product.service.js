const ProductModel = require( '../models/product.model' )
const GlassModel = require( '../models/glass.model' )
const MaterialModel = require( '../models/material.model' )
const LocationModel = require( '../models/location.model' )


async function create ( req, res )
{
  try
  {
    const { type, series, doorLeaves, description, fixGlassTop, fixGlassBottom, material, imageUrl } = req.body
    const product = new ProductModel( { type, series, doorLeaves, description, fixGlassTop, fixGlassBottom, material, imageUrl } )
    const data = await product.save()
    return res.status( 200 ).json( {
      message: 'Ok',
      data
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
    const data = await ProductModel.find( query )
    data.map(el => el.imageUrl = process.env.ASSETS_URL + el.imageUrl )
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
    const data = await ProductModel.findById( id )
    data.imageUrl = process.env.ASSETS_URL + data.imageUrl
    if ( data )
    {
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
  const { type, series, doorLeaves, description, fixGlassTop, fixGlassBottom, material, imageUrl } = req.body
  imageUrl.replace(process.env.ASSETS_URL, '')
  const product = new ProductModel( { type, series, doorLeaves, description, fixGlassTop, fixGlassBottom, material, imageUrl }, { _id : false } )
  const { id } = req.params
  try
  {
    const data = await ProductModel.findByIdAndUpdate( id, product )
    return res.status( 200 ).json( {
      message: 'Ok',
      data
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
    await ProductModel.findByIdAndDelete( id )
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

async function hitung ( req, res )
{
  try
  {
    const { productId, locationId, lebar, tinggi, fixGlassTop, fixGlassBottom, selectedGlass, tambahan, discount } = req.body

    const productDetail = await ProductModel.findById( productId )
    const location = await LocationModel.findById( locationId )
    const glass = await GlassModel.find( {} )
    const material = await MaterialModel.find( {} )

    // Convert to object for easy access
    const materialObj = {}
    material.forEach( m => {
      materialObj[m.idMaterial] = m
    } )

    const summary = {
      material: [],
      total: 0
    }
    let result = null

    productDetail.material.map( el => {
      if ( el.idMaterial )
      {
        const item = {
          name: '',
          id: null,
          category: 'material',
          formula: null,
          rawformula: null,
          itemPrice: null,
          totalPrice: null
        }
        if ( el.idMaterial === 'Kaca' )
        {
          const glassItem = glass.find( e => e.idGlass === selectedGlass )
          item.name = glassItem.name
          item.itemPrice = glassItem.price[location.location]
          item.category = 'glass'
        }
        else
        {
          item.itemPrice = materialObj[el.idMaterial].price[location.location]
          item.name = materialObj[el.idMaterial].name
        }
        const formula = el.formula.replace( 'L', Number( lebar ) ).replace( 'T', Number( tinggi ) ).replace( 'A', Number( fixGlassTop ) ).replace( 'B', Number( fixGlassBottom ) )
        item.rawformula = el.formula
        item.formula = eval( formula )
        item.id = el.idMaterial
        item.totalPrice = item.itemPrice * item.formula
        summary.material.push( item )
        summary.total += item.totalPrice
      }
    } )
    result = {
      summary: summary,
      lebar: lebar,
      tinggi: tinggi,
      fixGlassTop: fixGlassTop,
      fixGlassBottom: fixGlassBottom,
      productDetail: productDetail,
      location: location.location
    }
    if ( tambahan && tambahan.isActive )
    {
      result.tambahan = tambahan
    }
    if ( discount && discount.isActive )
    {
      result.discount = discount
    }

    return res.status( 200 ).json( {
      message: 'Ok',
      data: result
    } )
  } catch ( error )
  {
    return res.status( 500 ).json( {
      message: error.message
    } )
  }
}

module.exports = { create, findAll, findOne, update, deleteOne, hitung }

