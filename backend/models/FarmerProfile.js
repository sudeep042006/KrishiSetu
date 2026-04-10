import mongoose from 'mongoose';

const FarmerProfileSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    profilePhoto: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    },
    profilePhotoPublicId: {
        type: String,
        default: ""
    },
    aadhaar: {
        type: String,
    },
    //location
    village: {
        type: String,
    },
    district: {
        type: String,
    },
    state: {
        type: String,
    },
    //farm Details
    landArea: {
        type: String,
    },
    crops: {
        type: [String],
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
    
})

const FarmerProfile = mongoose.model("FarmerProfile",FarmerProfileSchema);

export default FarmerProfile;
