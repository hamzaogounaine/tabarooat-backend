const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLInt } = require('graphql');
const Categorie = require('../../models/Categorie');

// Define the CampaignTranslations type for campaignName, description, and tags
const CampaignTranslationsType = new GraphQLObjectType({
  name: 'CampaignTranslations',
  fields: {
    en: { type: GraphQLString },
    fr: { type: GraphQLString },
    ar: { type: GraphQLString }
  }
});

// Define the TagsTranslations type for tags
const TagsTranslationsType = new GraphQLObjectType({
  name: 'TagsTranslations',
  fields: {
    en: { type: new GraphQLList(GraphQLString) },
    fr: { type: new GraphQLList(GraphQLString) },
    ar: { type: new GraphQLList(GraphQLString) }
  }
});

// Define the CampaignType
const CampaignType = new GraphQLObjectType({
  name: 'Campaign',
  fields: {
    _id: { type: GraphQLID },
    campaignName: {
      type: GraphQLString,
      resolve: (parent) => {
        const lang = parent._context?.lang || 'en';
        return parent.campaignName && parent.campaignName[lang] ? parent.campaignName[lang] : parent.campaignName?.en;
      }
    },
    description: {
      type: GraphQLString,
      resolve: (parent) => {
        const lang = parent._context?.lang || 'en';
        return parent.description && parent.description[lang] ? parent.description[lang] : parent.description?.en;
      }
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      resolve: (parent) => {
        const lang = parent._context?.lang || 'en';
        return parent.tags && parent.tags[lang] ? parent.tags[lang] : parent.tags?.en || [];
      }
    },
    categorie: {
      type: GraphQLString,
      resolve: async (parent) => {
        const lang = parent._context?.lang || 'en';
        try {
          // Find the category document where name matches the campaign's categorie
          const category = await Categorie.findOne({ name: parent.categorie });
          if (!category) return parent.categorie; 
          return category.tr && category.tr[lang] ? category.tr[lang] : category.name;
        } catch (error) {
          throw new Error('Error fetching category: ' + error.message);
        }
      }
    },
    raiser_id: { type: GraphQLID },
    goalAmount : {type : GraphQLInt},
    currentAmount : {type : GraphQLInt},
    donorsCount : {type : GraphQLInt},
    deadline : {type : GraphQLInt},
    deadline : {type : GraphQLString},
    createdAt : {type : GraphQLString},
    image : {type : GraphQLString }
  }
});

module.exports = CampaignType;