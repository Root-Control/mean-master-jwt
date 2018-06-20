'use strict';

/**
 * Module dependencies
 */
const path = require('path'),
  mongoose = require('mongoose'),
  translate = require('google-translate-api'),
  Article = mongoose.model('Article'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an article
 */
exports.create = async (req, res) => {
  var article = new Article(req.body);
  article.user = req.user;

  try {
    await article.save();
    res.json(article);
  } catch(err) {
      return res.status(422).send({ message: errorHandler.getErrorMessage(err) });    
  }
};

/**
 * Show the current article
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var article = req.article ? req.article.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  article.isCurrentUserOwner = !!(req.user && article.user && article.user._id.toString() === req.user._id.toString());

  res.json(article);
};

/**
 * Update an article
 */
exports.update = async (req, res) => {
  var article = req.article;

  article.title = req.body.title;
  article.content = req.body.content;

  try {
    await article.save();
    res.json(article);
  } catch(err) {
      return res.status(422).send({ message: errorHandler.getErrorMessage(err) });
  }
};

/**
 * Delete an article
 */
exports.delete = async (req, res) => {
  var article = req.article;
  try {
    await article.remove();
    res.json(article);
  } catch(err) {
      return res.status(422).send({ message: errorHandler.getErrorMessage(err) });    
  }
};

/**
 * List of Articles
 */
exports.list = async (req, res) => {
  try {
    let articles = await Article.find();
    res.json(articles);   
  } catch(err) {
      return res.status(422).send({ message: errorHandler.getErrorMessage(err) });    
  }
};

/**
 * Article middleware
 */
exports.articleByID = async (req, res, next, id) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Article is invalid'
    });
  }

  try {
    let article = await Article.findById(id).populate('user', 'displayName');
    if(!article) {
      return res.status(404).send({
        message: 'No article with that identifier has been found'
      });      
    }
    req.article = article;
    next();
  } catch(err) {
    return next(err);
  }
};
