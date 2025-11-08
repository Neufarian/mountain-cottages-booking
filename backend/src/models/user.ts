import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    gender: String,
    address: String,
    phone: String,
    email: String,
    profileImage: String,
    creditCard: String,
    type: String,
    status: String
}, {
    versionKey: false
})

export default mongoose.model('UserModel', userSchema, 'users')