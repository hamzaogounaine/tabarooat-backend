const mongoose = require('mongoose')

const raiserSchema = mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    
    // Address Information
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        }
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    phoneVerificationToken: String,
    phoneVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // Identity Verification
    nationalId: {
        type: String,
        required: true,
        unique: true
    },
    identityDocuments: [{
        type: {
            type: String,
            enum: ['national_id', 'passport', 'driving_license'],
            required: true
        },
        frontImage: String, // URL to uploaded image
        backImage: String,  // URL to uploaded image
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Profile Information
    profileImage: String,
    bio: {
        type: String,
        maxlength: 500
    },
    
    // Social Media Links
    socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String,
        website: String
    },
    
    // Bank Account Information
    bankAccount: {
        accountNumber: {
            type: String,
        
        },
        routingNumber: String,
        bankName: {
            type: String,
        
        },
        accountHolderName: {
            type: String,
        
        },
        iban: String,
        swiftCode: String
    },
    
    // Verification Status
    verificationStatus: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected'],
        default: 'pending'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationDate: Date,
    verificationNotes: String,
    
    // Account Status
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'banned', 'pending_approval'],
        default: 'pending_approval'
    }, 
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    
    // Activity Tracking
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockedUntil: Date,
    
    // Fundraising Statistics
    totalCampaigns: {
        type: Number,
        default: 0
    },
    activeCampaigns: {
        type: Number,
        default: 0
    },
    totalRaised: {
        type: Number,
        default: 0
    },
    totalWithdrawn: {
        type: Number,
        default: 0
    },
    
    // Rating and Reviews
    rating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    
    // Notification Preferences
    notifications: {
        email: {
            donations: {
                type: Boolean,
                default: true
            },
            comments: {
                type: Boolean,
                default: true
            },
            updates: {
                type: Boolean,
                default: true
            },
            marketing: {
                type: Boolean,
                default: false
            }
        },
        sms: {
            donations: {
                type: Boolean,
                default: true
            },
            urgent: {
                type: Boolean,
                default: true
            }
        },
        push: {
            donations: {
                type: Boolean,
                default: true
            },
            comments: {
                type: Boolean,
                default: false
            }
        }
    },
    
 
    
    // Verification Tokens
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    phoneVerificationToken: String,
    phoneVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // Referral System
  
    
    // Terms and Conditions
    termsAccepted: {
        type: Boolean,
        required: true,
        default: false
    },
    termsAcceptedDate: {type : Date , default : Date.now()} ,
    privacyPolicyAccepted: {
        type: Boolean,
        required: true,
        default: false
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

raiserSchema.index({ email: 1 });
raiserSchema.index({ nationalId: 1 });
raiserSchema.index({ verificationStatus: 1 });
raiserSchema.index({ accountStatus: 1 });


raiserSchema.methods.incLoginAttempts = function() {
    if (this.lockedUntil && this.lockedUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockedUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockedUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    
    return this.updateOne(updates);
};

raiserSchema.virtual('isLocked').get(function() {
    return !!(this.lockedUntil && this.lockedUntil > Date.now());
});

raiserSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockedUntil: 1 }
    });
};

module.exports = mongoose.model("Raiser" , raiserSchema)