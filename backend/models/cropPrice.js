import mongoose from 'mongoose';

const cropPriceSchema = new mongoose.Schema({
    commodity: {
        type: String,
        required: true,
        trim: true
    },
    market: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    modalPrice: {
        type: Number,
        required: true
    },
    minPrice: {
        type: Number
    },
    maxPrice: {
        type: Number
    },
    arrivalDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// Adding indexes to make searching by crop and location very fast
cropPriceSchema.index({ commodity: 1, state: 1, district: 1 });
cropPriceSchema.index({ arrivalDate: -1 });

export default mongoose.model('CropPrice', cropPriceSchema);