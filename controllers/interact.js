const db = require('../models');
const Comment = db.Comment;
const User = db.User;
const Like = db.Like;

module.exports.newComment = async (req, res, next) => {
    try {
        const comment = {
            PostId: req.body.PostId,
            UserId: req.user.userId,
            content: req.body.content
        };
        const created = await Comment.create(comment);
        return res.status(200).json({message: 'Comment Successful!', comment: created});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: 'Server error'});
    }
};

module.exports.likeOrDislike = async (req, res, next) => {
    try {
        const like = {
            PostId: req.body.PostId,
            UserId: req.user.userId
        };
        const isLiked = await Like.findOne({where: like});
        if (isLiked) {
            await isLiked.destroy();
            return res.status(200).json({message: 'Post Like Deleted'});
        }
        await Like.create(like);
        return res.status(200).json({message: 'Post Liked'});
    } catch (e) {
        return res.status(500).json({message: 'Server error'});
    }
};

