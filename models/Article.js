var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    photoUrl: {
        type: String,
    },

    url: {
        type: String,
    },

    comment: {
        type: Schema.Types.ObjectId,
        ref: "comment"
    }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;