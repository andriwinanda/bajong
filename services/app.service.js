function parseBoolean ( value )
{
  return value === true || value === 'true'
}

async function getVersion ( req, res )
{
  return res.status( 200 ).json( {
    latestVersion: process.env.APP_LATEST_VERSION,
    message: 'Versi terbaru aplikasi sudah tersedia.'
  } )
}

module.exports = { getVersion }
