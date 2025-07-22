const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    // Support multilingual campaign names
    campaignName: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
      fr: { type: String, required: true },
    },

    // Multilingual description
    description: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
      fr: { type: String, required: true },
    },

    goalAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["active", "completed", "pending"],
      default: "active",
    },

    location: {
      city: String,
      country: String,
      address: String,
    },

    images: [String],
    videos: [String],

    // Tags multilingual support: store tags as objects per language
    tags: [
      {
        ar: String,
        en: String,
        fr: String,
      },
    ],

    donations: [
      {
        donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: Number,
        date: Date,
      },
    ],

    updates: [
      {
        message: String,
        date: Date,
      },
    ],

    raiser_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Raiser",
      required: true,
    },

    categorie: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
