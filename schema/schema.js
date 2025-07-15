const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
} = require("graphql");

const Categorie = require("../models/Categorie");

const CategorieType = new GraphQLObjectType({
  name: "Categorie",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    origin_name: { type: GraphQLString },
    icon: { type: GraphQLString },
    ar_name : {type : GraphQLString},
    fr_name : {type : GraphQLString},
    en_name : {type : GraphQLString}

  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    categories: {
      type: new GraphQLList(CategorieType),
      args: {
        lang: { type: GraphQLString },
      },
      resolve: async (_, args) => {
        const items = await Categorie.find();
        return items.map((item) => ({
          id: item._id.toString(),
          icon: item.icon,
          origin_name: item.name,
          name:
            args.lang === "ar"
              ? item.tr.ar
              : args.lang === "fr"
              ? item.tr.fr
              : item.name,
        }));
      },
    },
    getCategorie: {
      type: CategorieType,
      args: { name: { type: GraphQLString } },
      resolve: async (_, args) => {
        const item = await Categorie.findOne({ name: args.name });
        if (!item) return null;

        return {
          id: item._id.toString(),
          en_name: item.name,
          icon: item.icon,
          ar_name: item.tr.ar,
          fr_name : item.tr.fr
        };
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
