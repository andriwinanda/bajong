const admin = require( 'firebase-admin' )

function getServiceAccount ()
{
  if ( process.env.FIREBASE_SERVICE_ACCOUNT_JSON )
  {
    const serviceAccount = JSON.parse( process.env.FIREBASE_SERVICE_ACCOUNT_JSON )
    if ( serviceAccount.private_key )
    {
      serviceAccount.private_key = serviceAccount.private_key.replace( /\\n/g, '\n' )
    }
    return serviceAccount
  }

  if ( process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY )
  {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace( /\\n/g, '\n' )
    }
  }

  return null
}

function getFirebaseApp ()
{
  if ( admin.apps.length ) return admin.app()

  const serviceAccount = getServiceAccount()
  if ( !serviceAccount )
  {
    throw new Error( 'Firebase service account is not configured' )
  }

  return admin.initializeApp( {
    credential: admin.credential.cert( serviceAccount )
  } )
}

async function sendNotificationToTokens ( tokens, payload )
{
  const validTokens = ( Array.isArray( tokens ) ? tokens : [ tokens ] ).filter( token => !!token )
  if ( !validTokens.length )
  {
    throw new Error( 'User does not have an FCM token' )
  }

  getFirebaseApp()

  const message = {
    tokens: validTokens,
    notification: {
      title: payload.title,
      body: payload.body
    },
    android: {
      priority: 'high'
    },
    apns: {
      headers: {
        'apns-priority': '10'
      }
    },
    webpush: {
      headers: {
        Urgency: 'high'
      }
    },
    data: Object.entries( payload.data || {} ).reduce( ( result, item ) =>
    {
      result[ item[ 0 ] ] = String( item[ 1 ] )
      return result
    }, {} )
  }

  return admin.messaging().sendEachForMulticast( message )
}

module.exports = { sendNotificationToTokens }
