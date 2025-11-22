const db = require('../models');
const Post = db.Post;
const Role = db.Role;
const User = db.User;

module.exports.getHomeData = async(req, res, next) => {
    try {
        // If models haven't been initialized yet (Sequelize retry in progress), return 503 so clients can retry.
        if (!Post) {
            console.warn('getHomeData: DB models not ready yet');
            res.setHeader('Retry-After', '3');
            return res.status(503).json({ message: 'Service temporarily unavailable. DB not ready.' });
        }
        const promises = [];
        const articlePromise = Post.findAll({
            limit: 4,
            attributes: ['id', 'title', 'subtitle', 'picUrl', 'createdAt', 'updatedAt'],
            where: {type: 'article'},
            order: [['createdAt', 'DESC']]
        });
        promises.push(articlePromise);

        const blogPromise = Post.findAll({
            limit: 4,
            attributes: ['id', 'title', 'subtitle', 'picUrl', 'createdAt', 'updatedAt'],
            where: {type: 'blog'},
            order: [['createdAt', 'DESC']]
        });
        promises.push(blogPromise);

        const maxYear = await Role.findOne({
            attributes: ['year'],
            order: [['year', 'DESC']],
            raw: true
        });

        const rolePromise = Role.findAll({
            where: {year: maxYear['year']},
            attributes: ['name', 'year', 'UserId'],
            include: [{
                model: User,
                attributes: ['firstName', 'lastName', 'email', 'schoolName', 'profilePic']
            }]
        });
        promises.push(rolePromise);

        const responses = await Promise.all(promises);

        if (responses) {
            return res.status(200).json({
                recentArticles: responses[0],
                recentBlogs: responses[1],
                recentTuz: responses[2]
            });
        }

        return res.status(404).json({message: 'Not found'})
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: 'Server error'});
    }
};
