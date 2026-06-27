function parseBoolean ( value )
{
  return value === true || value === 'true'
}

async function getVersion ( req, res )
{
  return res.status( 200 ).json( {
    currentVersion: process.env.APP_CURRENT_VERSION,
    latestVersion: process.env.APP_LATEST_VERSION,
    updateUrl: process.env.APP_UPDATE_URL,
    message: 'Versi terbaru aplikasi sudah tersedia.'
  } )
}

module.exports = { getVersion }
