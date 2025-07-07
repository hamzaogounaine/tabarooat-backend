const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    age : {
        type : Number,
        required : true
    },
    resetToken: {
        type: String,
        default: null
    },
    resetTokenExpire: {
        type: Date,
        default: null
    },
    isVerified :{
        type : Boolean,
        default : false
    },
    emailVerificationToken : String,
    emailVerificationTokenExpire : Date,
    termsAccepted : {
        type : Boolean,
        default : false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);