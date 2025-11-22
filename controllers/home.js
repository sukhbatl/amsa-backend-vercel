const db = require('../models');

module.exports.getHomeData = async (req, res, next) => {
    try {
        // Access models dynamically to ensure they are loaded after DB init
        const Post = db.Post;
        const Role = db.Role;
        const User = db.User;

        // If models haven't been initialized yet (Sequelize retry in progress), return 503 so clients can retry.
        if (!Post || !Role || !User) {
            console.warn('getHomeData: DB models not ready yet');
            order: [['year', 'DESC']],
                raw: true
        });

        if (!maxYear) {
            return res.status(200).json({
                recentArticles: await articlePromise,
                recentBlogs: await blogPromise,
                recentTuz: []
            });
        }

        const rolePromise = Role.findAll({
            where: { year: maxYear['year'] },
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

        return res.status(404).json({ message: 'Not found' })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
};
