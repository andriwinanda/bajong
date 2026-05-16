const ProductModel = require('../models/product.model')
const GlassModel = require('../models/glass.model')
const MaterialModel = require('../models/material.model')
const LocationModel = require('../models/location.model')
const sharp = require('sharp')
const nodeHtmlToImage = require('node-html-to-image')
const cloudinary = require('cloudinary').v2
const axios = require('axios')


cloudinary.config({
  cloud_name: 'dhia7amjx',
  api_key: '881578912472341',
  api_secret: 'bmve9zgkRBL40qynjQNZdKOJico'
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

async function imageUrlToBase64(url) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer'
  })
  return `data:${res.headers['content-type']};base64,${Buffer.from(res.data).toString('base64')}`
}

async function buildPriceCalculationHtml(result) {
  const productBase64 = await imageUrlToBase64(`https://res.cloudinary.com/dhia7amjx/image/upload/v1704190949/delica/${result.productDetail.imageUrl}`)
  const logoBase64 = await imageUrlToBase64("https://delica.co.id/images/logo.png")
  const fixedGlass = []
  fixedGlass.push(`
      <rect
        x="22"
        y="625"
        width="185"
        height="54"
        class="card"
      />

      <text
        x="34"
        y="645"
        class="label"
      >
        Kaca
      </text>

      <text
        x="34"
        y="665"
        class="value"
      >
        ${result.summary.material[0].name}
      </text>`)

  fixedGlass.push(`
      <rect
        x="228"
        y="625"
        width="185"
        height="54"
        class="card"
      />

      <text
        x="240"
        y="645"
        class="label"
      >
        Jumlah Daun
      </text>

      <text
        x="240"
        y="665"
        class="value"
      >
        ${result.productDetail.doorLeaves}
      </text>`)
  if (result.fixGlassTop) {

    fixedGlass.push(`
        <rect
          x="434"
          y="625"
          width="185"
          height="54"
          class="card"
        />

        <text
          x="446"
          y="645"
          class="label"
        >
          Fix Glass Top
        </text>

        <text
          x="446"
          y="665"
          class="value"
        >
          ${result.fixGlassTop}
        </text>
      `)

  }

  if (result.fixGlassBottom) {

    fixedGlass.push(`
        <rect
          x="22"
          y="695"
          width="185"
          height="54"
          class="card"
        />

        <text
          x="34"
          y="715"
          class="label"
        >
          Fix Glass Bottom
        </text>

        <text
          x="34"
          y="735"
          class="value"
        >
          ${result.fixGlassBottom}
        </text>
      `)

  }

  const svg = `
    <svg
      width="650"
      height="820"
      xmlns="http://www.w3.org/2000/svg"
    >

      <style>

        .title {
          fill: #1f2937;
          font-size: 22px;
          font-weight: 700;
          font-family: Arial, Helvetica, sans-serif;
        }

        .subtitle {
          fill: #6b7280;
          font-size: 12px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .section-title {
          fill: #1f2937;
          font-size: 20px;
          font-weight: 700;
          font-family: Arial, Helvetica, sans-serif;
        }

        .label {
          fill: #6b7280;
          font-size: 11px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .value {
          fill: #111827;
          font-size: 13px;
          font-weight: 700;
          font-family: Arial, Helvetica, sans-serif;
        }

        .price {
          fill: #111827;
          font-size: 18px;
          font-weight: 700;
          font-family: Arial, Helvetica, sans-serif;
        }

        .card {
          fill: #f8fafc;
          stroke: #e5e7eb;
          stroke-width: 1;
          rx: 12;
        }

      </style>

      <!-- Background -->

      <rect
        width="100%"
        height="100%"
        fill="#ffffff"
      />

      <!-- Logo -->

      <image
        href="${logoBase64}"
        x="20"
        y="22"
        width="95"
        height="36"
      />

      <!-- Header -->

      <text
        x="145"
        y="42"
        class="title"
      >
        Hasil Perhitungan Harga
      </text>

      <text
        x="145"
        y="62"
        class="subtitle"
      >
        ${new Date().toLocaleDateString('id-ID')},
        ${new Date().toLocaleTimeString('id-ID')} WIB
      </text>

      <!-- Product Image -->

      <image
        href="${productBase64}"
        x="120" 
        y="90"
        width="400"
        height="320"
        preserveAspectRatio="xMidYMid meet"
      />

      <!-- Section Title -->

      <text
        x="22"
        y="490"
        class="section-title"
      >
        Data Perhitungan
      </text>

      <!-- Card 1 -->

      <rect
        x="22"
        y="510"
        width="185"
        height="54"
        class="card"
      />

      <text
        x="34"
        y="530"
        class="label"
      >
        Produk
      </text>

      <text
        x="34"
        y="550"
        class="value"
      >
        ${result.productDetail.type || ''}
        S${result.productDetail.series || ''}
      </text>

      <!-- Card 2 -->

      <rect
        x="228"
        y="510"
        width="185"
        height="54"
        class="card"
      />

      <text
        x="240"
        y="530"
        class="label"
      >
        Lokasi Cabang
      </text>

      <text
        x="240"
        y="550"
        class="value"
      >
        ${result.location.toUpperCase()}
      </text>

      <!-- Card 3 -->

      <rect
        x="434"
        y="510"
        width="185"
        height="54"
        class="card"
      />

      <text
        x="446"
        y="530"
        class="label"
      >
        Ukuran
      </text>

      <text
        x="446"
        y="550"
        class="value"
      >
        ${result.lebar} x ${result.tinggi} m
      </text>

      <!-- Parameter -->

      <text
        x="22"
        y="605"
        class="section-title"
      >
        Parameter Tambahan
      </text>

      ${fixedGlass.join('')}

      <!-- Divider -->

      <line
        x1="22"
        y1="705"
        x2="620"
        y2="705"
        stroke="#cbd5e1"
        stroke-width="1"
      />

      <!-- Total -->

      <text
        x="22"
        y="742"
        class="section-title"
      >
        Total Estimasi Harga
      </text>

      <text
        x="620"
        y="742"
        text-anchor="end"
        class="price"
      >
        ${formatCurrency(result.summary.total)}
      </text>

      <!-- Bottom Divider -->

      <line
        x1="22"
        y1="765"
        x2="620"
        y2="765"
        stroke="#e5e7eb"
        stroke-width="1"
      />

    </svg>
    `
  return svg

  // const itemsHtml = result.summary.material.map(item => {
  //   const category = item.category === 'glass' ? 'Kaca' : 'Material'
  //   return `
  //     <tr>
  //       <td>${item.name}</td>
  //       <td>${category}</td>
  //       <td>${item.rawformula}</td>
  //       <td>${item.formula}</td>
  //       <td>${formatCurrency(item.itemPrice)}</td>
  //       <td>${formatCurrency(item.totalPrice)}</td>
  //     </tr>`
  // }).join('')


  //   return `<!DOCTYPE html>
  // <html lang="id">
  // <head>
  //   <meta charset="UTF-8">
  //   <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //   <style>
  //   <style>

  //     * { box-sizing: border-box;}
  //     body { margin: 0; padding: 24px; width: 600px; background: #fff; font-family: Arial, Helvetica, sans-serif; color: #1f2937; }
  //     .container {width: 100%; overflow: visible;}
  //    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
  //     .logo-box { display: flex; align-items: center; gap: 28px; }
  //     .logo-icon { width: 56px; height: 56px; border-radius: 18px; background: #1d4ed8; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px; font-weight: 700; }
  //     .brand-title { margin: 0; font-size: 22px; font-weight: 700; }
  //     .brand-subtitle { margin: 0 0 0; color: #6b7280 !important; font-size: 12px; }
  //     .meta { text-align: right; color: #6b7280; font-size: 14px; }
  //     .section { margin-bottom: 24px; }
  //     .section-title { margin: 0 0 14px; font-size: 18px; font-weight: 700; }
  //     .info-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  //     .info-card { padding: 12px 12px; border-radius: 10px; background: #f8fafc; border: 1px solid #e5e7eb; }
  //     .info-label { display: block; font-size: 10px; color: #6b7280; margin-bottom: 3px; }
  //     .info-value { font-size: 12px; font-weight: 700; color: #111827; }
  //     table { width: 100%; border-collapse: collapse; margin-top: 14px; }
  //     th, td { padding: 14px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 14px; }
  //     th { background: #eef2ff; color: #1d4ed8; font-weight: 700; }
  //     .total-row td { padding: 14px 0 !important; border-top: 2px solid #dbeafe; font-size: 16px; font-weight: 700; }
  //   </style>
  // </head>
  // <body>
  // <div class="container">
  //   <div class="card">
  //     <div class="header">
  //       <div class="logo-box">
  //        <img width="100" src="https://delica.co.id/images/logo.png">
  //         <div>
  //           <p class="brand-title">Hasil Perhitungan Harga</p>
  //           <p class="brand-subtitle"> ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}, ${new Date().toLocaleTimeString('id-ID')} WIB</p>
  //         </div>
  //       </div>

  //     </div>
  //     <div> <img style="padding-left: 16px; padding-right: 16px; display: block; margin: 0 auto;" width="300px" src="https://res.cloudinary.com/dhia7amjx/image/upload/v1704190949/delica/${result.productDetail.imageUrl}"> </div>
  //     <div class="section" style="padding-top: 24px">
  //       <p class="section-title">Data Perhitungan</p>
  //       <div class="info-grid">
  //         <div class="info-card">
  //           <span class="info-label">Produk</span>
  //           <span class="info-value">${result.productDetail.type || ''} S${result.productDetail.series || ''}</span>
  //         </div>
  //         <div class="info-card">
  //           <span class="info-label">Lokasi Cabang</span>
  //           <span class="info-value">${result.location.toUpperCase() || ''}</span>
  //         </div>
  //         <div class="info-card">
  //           <span class="info-label">Ukuran</span>
  //           <span class="info-value">${result.lebar} x ${result.tinggi} m</span>
  //         </div>
  //       </div>
  //     </div>
  //     <div class="section">
  //     <p class="section-title">Parameter Tambahan</p>
  //       <div class="info-grid">
  //       ${result.fixGlassTop ?
  //       `<div class="info-card">
  //           <span class="info-label">Fix Glass Top</span>
  //           <span class="info-value">${result.fixGlassTop || "-"}</span>
  //         </div>` : ''}
  //       ${result.fixGlassBottom ?
  //       `<div class="info-card">
  //           <span class="info-label">Fix Glass Bottom</span>
  //           <span class="info-value">${result.fixGlassBottom || "-"}</span>
  //         </div>` : ''}
  //         <div class="info-card">
  //           <span class="info-label">Kaca</span>
  //           <span class="info-value">${result.summary.material[0].name}</span>
  //         </div>
  //         <div class="info-card">
  //           <span class="info-label">Jumlah Daun</span>
  //           <span class="info-value">${result.productDetail.doorLeaves}</span>
  //         </div>
  //       </div>
  //     </div>
  //     <div class="section">
  //       <table>
  //         <tbody>
  //           <tr class="total-row">
  //             <td colspan="5">Total Estimasi Harga</td>
  //             <td style="text-align: right">${formatCurrency(result.summary.total)}</td>
  //           </tr>
  //         </tbody>
  //       </table>
  //     </div>
  //   </div>
  // </div>
  // </body>
  // </html>`
}

async function uploadImageToCloudinary(imageBuffer, fileName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: `${fileName.replace(/\.[^/.]+$/, '')}`,
        folder: 'calculated',
        format: 'jpg',
        quality: '70',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`))
        } else {
          resolve(result.secure_url)
        }
      }
    )
    uploadStream.end(imageBuffer)
  })
}

async function deleteImage(req, res) {
  try {
    const { publicId, imageUrl } = req.body
    let idToDelete = publicId

    if (!publicId && imageUrl) {
      const match = imageUrl.match(/\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[^/.]+)?$|upload\/(.+?)$/)
      idToDelete = match ? (match[1] || match[2]) : null
    }

    if (!idToDelete) {
      return res.status(400).json({
        message: 'Error',
        error: 'Please provide publicId or imageUrl'
      })
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(idToDelete, (error, result) => {
        if (error) {
          return res.status(500).json({
            message: 'Error',
            error: `Failed to delete image: ${error.message}`
          })
        }
        return res.status(200).json({
          message: 'Ok',
          data: {
            publicId: idToDelete,
            result: result.result
          }
        })
      })
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error',
      error: error.message
    })
  }
}
// <table>
//   <thead>
//     <tr>
//       <th>Item</th>
//       <th>Kategori</th>
//       <th>Formula</th>
//       <th>Nilai</th>
//       <th>Harga Satuan</th>
//       <th>Total Harga</th>
//     </tr>
//   </thead>
//   <tbody>
//     ${itemsHtml}
//     <tr class="total-row">
//       <td colspan="5">Total Harga</td>
//       <td>${formatCurrency(result.summary.total)}</td>
//     </tr>
//   </tbody>
// </table>

async function create(req, res) {
  try {
    const { type, series, doorLeaves, description, fixGlassTop, fixGlassBottom, material, imageUrl } = req.body
    const product = new ProductModel({ type, series, doorLeaves, description, fixGlassTop, fixGlassBottom, material, imageUrl })
    const data = await product.save()
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
  const { keyword } = req.query
  const query = {}
  if (keyword) query.name = { "$regex": keyword, "$options": "i" }
  try {
    const data = await ProductModel.find(query)
    data.map(el => el.imageUrl = process.env.ASSETS_URL + el.imageUrl)
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
    const data = await ProductModel.findById(id)
    data.imageUrl = process.env.ASSETS_URL + data.imageUrl
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
  const { type, series, doorLeaves, description, fixGlassTop, fixGlassBottom, material, imageUrl } = req.body
  imageUrl.replace(process.env.ASSETS_URL, '')
  const product = new ProductModel({ type, series, doorLeaves, description, fixGlassTop, fixGlassBottom, material, imageUrl }, { _id: false })
  const { id } = req.params
  try {
    const data = await ProductModel.findByIdAndUpdate(id, product)
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
    await ProductModel.findByIdAndDelete(id)
    return res.status(200).json({
      message: 'Ok',
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

async function hitung(req, res) {
  try {
    const { productId, locationId, lebar, tinggi, fixGlassTop, fixGlassBottom, selectedGlass, generateImage } = req.body

    const productDetail = await ProductModel.findById(productId) || null
    const location = await LocationModel.findById(locationId) || null
    const glass = await GlassModel.findById(selectedGlass) || null
    const material = await MaterialModel.find({}) || null

    // Convert to object for easy access
    const materialObj = {}
    material.forEach(m => {
      materialObj[m._id.toString()] = m
    })

    const summary = {
      material: [],
      total: 0
    }
    let result = null

    productDetail.material.map(el => {
      if (el.idMaterial) {
        const item = {
          name: '',
          id: null,
          category: 'material',
          formula: null,
          rawformula: null,
          itemPrice: null,
          totalPrice: null
        }
        if (el.idMaterial === 'Kaca') {
          const glassItem = glass
          glassItem.price = {}
          item.name = glassItem.name
          item.itemPrice = location.idGlassPrice[selectedGlass]
          item.category = 'glass'
        }
        else {
          item.itemPrice = location.idMaterialPrice[el.idMaterial]
          item.name = materialObj[el.idMaterial].name
        }
        const formula = el.formula.replace('L', Number(lebar)).replace('T', Number(tinggi)).replace('A', Number(fixGlassTop)).replace('B', Number(fixGlassBottom))
        item.rawformula = el.formula
        item.formula = eval(formula)
        item.id = el.idMaterial
        item.totalPrice = item.itemPrice * item.formula
        summary.material.push(item)
        summary.total += item.totalPrice
      }
    })
    result = {
      summary: summary,
      lebar: lebar,
      tinggi: tinggi,
      fixGlassTop: fixGlassTop,
      fixGlassBottom: fixGlassBottom,
      productDetail: productDetail,
      location: location.location
    }

    const response = {
      message: 'Ok',
      data: result
    }

    if (generateImage) {
      const html = await buildPriceCalculationHtml(result)
      // const imageBuffer = await sharp({ html, encoding: 'buffer', puppeteerArgs: { args: ['--no-sandbox', '--disable-setuid-sandbox'] } })
      const imageBuffer = await sharp(Buffer.from(html)).jpeg({ quality: 70 })

        .toBuffer()

      if (req.body.asBlob) {
        res.set('Content-Type', 'image/png')
        return res.status(200).send(imageBuffer)
      }

      if (req.body.uploadToCloudinary) {
        const timestamp = Date.now()
        const fileName = `price-calculation-${timestamp}.png`
        const cloudinaryUrl = await uploadImageToCloudinary(imageBuffer, fileName)
        response.imageUrl = cloudinaryUrl
      } else {
        response.imageBase64 = imageBuffer.toString('base64')
      }
    }

    return res.status(200).json(response)

  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

module.exports = { create, findAll, findOne, update, deleteOne, hitung, deleteImage }

