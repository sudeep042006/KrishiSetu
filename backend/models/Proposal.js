import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
    offtakerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cropName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: 'Quintal'
    },
    pricePerUnit: {
        type: Number,
        required: true
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    message: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

const Proposal = mongoose.model('Proposal', proposalSchema);
export default Proposal;