const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLSchema } = require('graphql');
const CategorieType = require('./types/categorieType');
const Categorie = require('../models/Categorie');
const Campaign = require('../models/Campaign');

const CampaignType = require('./types/campaignType');

// Define the RootQuery
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    categories: {
      type: new GraphQLList(CategorieType),
      args: {
        lang: { type: GraphQLString }
      },
      resolve: async (_, { lang = 'en' }) => {
        try {
          const categories = await Categorie.find();
          // Return categories with lang in _context
          return categories.map(category => ({
            ...category._doc,
            _context: { lang } // Store lang for use in CategorieType
          }));
        } catch (error) {
          throw new Error('Error fetching categories: ' + error.message);
        }
      }
    },


    campaigns: {
      type: new GraphQLList(CampaignType),
      args: {
        lang: { type: GraphQLString }
      },
      resolve: async (_, { lang = 'en' }) => {
        try {
          const campaigns = await Campaign.find();
          return campaigns.map(campaign => ({
            ...campaign._doc,
            _context: { lang }
          }));
        } catch (error) {
          throw new Error('Error fetching campaigns: ' + error.message);
        }
      }
    },
    campaignsByCategory: {
      type: new GraphQLList(CampaignType),
      args: {
        categorie: { type: GraphQLString },
        lang: { type: GraphQLString }
      },
      resolve: async (_, { categorie, lang = 'en' }) => {
        try {
          const campaigns = await Campaign.find({ categorie });
          return campaigns.map(campaign => ({
            ...campaign._doc,
            _context: { lang }
          }));
        } catch (error) {
          throw new Error('Error fetching campaigns by category: ' + error.message);
        }
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery
});