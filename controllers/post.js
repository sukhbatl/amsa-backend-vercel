const db = require('../models');
const Post = db.Post;
const User = db.User;
const Like = db.Like;
const Tag = db.Tag;
const Comment = db.Comment;
const PostsTags = db.PostsTags;
const extractContent = require('../utility/extract').extractContent;
const path = require('path');
const sequelize = db.sequelize;
const getCombinations = require('../utility/tag').getCombinations;
const setAllVariables = require('../utility/cache').setAllVariables;

module.exports.newPost = async (req, res, next) => {
    try {
        const image = req.file;
        if (!image) {
            return res.status(422).json({message: 'Image not a valid'});
        }
        const currentFolder = __dirname.split(path.sep).pop();
        const imagePath = image.path.substring(__dirname.length - currentFolder.length);
        const post = {
            title: req.body.title,
            subTitle: req.body.subTitle,
            content: req.body.content,
            picUrl: imagePath,
            type: 'blog',
            category: req.body.category,
            tags: req.body.tags,
            UserId: req.user.userId
        };
        const result = await createPost(post, req.body.tags);

        if (result) {
            setAllVariables().then();
            return res.status(200).json({message: 'Blog Created!'});
        } else {
            return res.status(500).json({message: 'Blog was not created!'});
        }
    } catch (e) {
        return res.status(500).json({message: 'Server error'});
    }
};

module.exports.newArticle = async (req, res, next) => {
    try {
        const image = req.file;
        if (!image) {
            return res.status(422).json({message: 'Image not a valid'});
        }
        const currentFolder = __dirname.split(path.sep).pop();
        const imagePath = image.path.substring(__dirname.length - currentFolder.length);
        const post = {
            title: req.body.title,
            subTitle: req.body.subTitle,
            content: req.body.content,
            picUrl: imagePath,
            type: 'article',
            category: req.body.category,
            tags: req.body.tags,
            UserId: req.user.userId
        };

        const result = await createPost(post, req.body.tags);

        if (result) {
            setAllVariables().then();
            return res.status(200).json({message: 'Article Created!'});
        } else {
            return res.status(500).json({message: 'Article was not created!'});
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: 'Server error'});
    }
};

module.exports.getRecentArticles = async (req, res, next) => {
    try {
        const q = {
            pageSize: 10,
            pageNumber: 0,
        };

        if (req.query.pageSize) {
            q.pageSize = +req.query.pageSize;
        }

        if (req.query.pageNumber) {
            q.pageNumber = +req.query.pageNumber;
        }

        const articles = await getPosts(q.pageSize, q.pageNumber * q.pageSize, 'article');

        const new_articles = articles.map(x => {
            const innerText = extractContent(x.content);
            if (innerText) {
                x.content = innerText.substring(0, 200);
            }
            return x;
        });

        return res.status(201).json(new_articles);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: 'Server error'});
    }
};

module.exports.getRecentPosts = async (req, res, next) => {
    try {
        const q = {
            pageSize: 8,
            pageNumber: 0,
        };

        if (req.query.pageSize) {
            q.pageSize = +req.query.pageSize;
        }

        if (req.query.pageNumber) {
            q.pageNumber = +req.query.pageNumber;
        }

        const blogs = await getPosts(q.pageSize, q.pageNumber * q.pageSize, 'blog');

        const new_blogs = blogs.map(x => {
            const innerText = extractContent(x.content);
            if (innerText) {
                x.content = innerText.substring(0, 100);
            }
            return x;
        });

        return res.status(201).json(new_blogs);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: 'Server error'});
    }
};

module.exports.getPost = async (req, res, next) => {
    try {
        const id = req.params.id;
        const post = await Post.findOne({
            where: {id},
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'bio', 'profilePic']
            }, {
                model: Comment,
                include: [{
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'profilePic']
                }]
            }, {
                model: Like,
                include: [{
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'profilePic']
                }]
            }]
        });
        if (post) {
            return res.status(200).json(post);
        }
        return res.status(404).json({message: 'Post not found'});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: 'Server error'});
    }
};

module.exports.updatePost = async (req, res, next) => {
  try {
      let picUrl = req.body.picUrl;
      const id = req.params.id;

      if (req.file) {
          picUrl = req.file.path;
      }

      const post = {
          title: req.body.title,
          subTitle: req.body.subTitle,
          content: req.body.content,
          picUrl,
          category: req.body.category,
          tags: req.body.tags,
      };

      const currentPost = await Post.findOne({where: {id, userId: req.user.userId}});
      if (currentPost) {
          return await sequelize.transaction(async (t) => {
              const promises = [];
              const updatedPost = currentPost.update(post, {transaction: t});
              promises.push(updatedPost);

              const deletedTags = PostsTags.destroy({where: {PostId: id}});
              promises.push(deletedTags);

              await Promise.all(promises);

              if (await createTags(id, req.body.tags, t)) {
                  setAllVariables().then();
                  return res.status(200).json({message: 'Updated Successfully!'});
              }
              return res.status(500).json({message: 'Server Error'});
          });
      }
      return res.status(401).json({message: 'Not Authorized!'});
  } catch (e) {
      return res.status(500).json({message: 'Server error'});
  }
};

module.exports.deletePost = async (req, res, next) => {
  try {
      const id = +req.params.id;
      const deleted = await Post.destroy({where: {id, UserId: req.user.userId}});
      if (deleted > 0) {
          return res.status(200).json({message: 'Deleted'});
      } else {
          return res.status(403).json({message: 'Not Authorized'});
      }

  } catch (e) {
      return res.status(500).json({message: 'Server error'});
  }
};

async function getPosts(limit, offset, type) {
    try {
        return await Post.findAll({
            limit,
            offset,
            where: {type},
            order: [['CreatedAt', 'DESC']]
        });
    } catch (e) {
        return [];
    }
}

async function createPost(post, tagsString) {
    try {
        return await sequelize.transaction(async (t) => {
            const postResult = await Post.create(post, {transaction: t});

            const tags = tagsString.split(',').map(x => x.toLowerCase());

            // Creating and Fetching tag IDs
            const tagCombinations = getCombinations(tags);

            const tagFetchingPromises = [];

            for (let i = 0; i < tagCombinations.length; i++) {
                const name = tagCombinations[i];
                tagFetchingPromises.push(Tag.findOne({where: {name}, attributes: ['id']}));
            }

            const fetchResults = await Promise.all(tagFetchingPromises);
            const tagIDs = [];
            const tagInsertions = [];
            for (let i = 0; i < fetchResults.length; i++) {
                if (fetchResults[i]) {
                    tagIDs.push(fetchResults[i].id);
                } else {
                    tagInsertions.push({name: tagCombinations[i]});
                }
            }

            if (tagInsertions.length > 0) {
                const tagInsertionResults = await Tag.bulkCreate(
                    tagInsertions,
                    {
                        transaction: t,
                        returning: true,
                        raw: true
                    });

                for (let i = 0; i < tagInsertions.length; i++) {
                    tagIDs.push(tagInsertionResults[i].id);
                }
            }

            // Inserting tag IDs into PostsTags
            const postTags = [];

            for (let i = 0; i < tagIDs.length; i++) {
                postTags.push({TagId: tagIDs[i], PostId: postResult.id});
            }

            await PostsTags.bulkCreate(postTags, {transaction: t, raw: true});

            return true;
        });
    } catch (e) {
        console.log(e);
        return false;
    }
}

async function createTags(PostId, tagsString, t) {
    try {
        const tags = tagsString.split(',').map(x => x.toLowerCase());

        // Creating and Fetching tag IDs
        const tagCombinations = getCombinations(tags);

        const tagFetchingPromises = [];

        for (let i = 0; i < tagCombinations.length; i++) {
            const name = tagCombinations[i];
            tagFetchingPromises.push(Tag.findOne({where: {name}, attributes: ['id']}));
        }

        const fetchResults = await Promise.all(tagFetchingPromises);
        const tagIDs = [];
        const tagInsertions = [];
        for (let i = 0; i < fetchResults.length; i++) {
            if (fetchResults[i]) {
                tagIDs.push(fetchResults[i].id);
            } else {
                tagInsertions.push({name: tagCombinations[i]});
            }
        }

        if (tagInsertions.length > 0) {
            const tagInsertionResults = await Tag.bulkCreate(
                tagInsertions,
                {
                    transaction: t,
                    returning: true,
                    raw: true
                });

            for (let i = 0; i < tagInsertions.length; i++) {
                tagIDs.push(tagInsertionResults[i].id);
            }
        }

        // Inserting tag IDs into PostsTags
        const postTags = [];

        for (let i = 0; i < tagIDs.length; i++) {
            postTags.push({TagId: tagIDs[i], PostId});
        }

        await PostsTags.bulkCreate(postTags, {transaction: t, raw: true});

        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}
