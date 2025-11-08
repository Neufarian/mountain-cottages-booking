import mongoose from 'mongoose'

const cottageSchema = new mongoose.Schema({
    id: Number,
    name: String,
    location: String,
    services: String,
    owner: String,
    phone: String,
    pictures: Array,
    prices: {
        summer: Number,
        winter: Number
    },
    coordinates: {
        x: String,
        y: String
    },
    reservations: Array,
    dateAvailable: Date
}, {
    versionKey: false
})

export default mongoose.model('CottageModel', cottageSchema, 'cottages')