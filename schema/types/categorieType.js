const { GraphQLObjectType, GraphQLString, GraphQLID } = require('graphql');

// Define the CategoryTranslations type for the 'tr' field
const CategoryTranslationsType = new GraphQLObjectType({
  name: 'CategoryTranslations',
  fields: {
    ar: { type: GraphQLString },
    fr: { type: GraphQLString }
  }
});

// Define the CategorieType
const CategorieType = new GraphQLObjectType({
  name: 'Categorie',
  fields: {
    _id: { type: GraphQLID },
    name: {
      type: GraphQLString,
      resolve: (parent) => {
        const lang = parent._context?.lang || 'en'; // Use lang from _context, default to 'en'
        return parent.tr && parent.tr[lang] ? parent.tr[lang] : parent.name;
      }
    },
    tr: { type: CategoryTranslationsType },
    icon: { type: GraphQLString },
    origin_name : {
      type : GraphQLString,
      resolve : (parent) => {
        return parent.name
      }
     }
  }
});

module.exports = CategorieType;