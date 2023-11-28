const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_CONNECT_URI)
		console.log("Connect to MongoDB successfully")
	} catch (error) {
		console.log("Connect failed " + error.message )
	}
}

module.exports = connectDB