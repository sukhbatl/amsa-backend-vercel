const cache = require('../utility/cache');
const getCombinations = require('../utility/tag').getCombinations;
const MAX_COUNT = 5;
const db = require('../models');
const Tag = db.Tag;
const PostsTags = db.PostsTags;
const Post = db.Post;

module.exports.quickSearchAll = async (req, res, next) => {
    try {
        const q = decodeURIComponent(req.query.q);
        const filteredPosts = [];

        const posts = cache.getPosts();

        let count = 0;
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            if (count === MAX_COUNT) {
                break;
            }
            if (post.title.toLowerCase().includes(q) || post.subtitle.toLowerCase().includes(q)) {
                filteredPosts.push(post);
                count++;
            }
        }

        return res.status(200).json({posts: filteredPosts});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: 'Server error'});
    }
};

module.exports.searchAll = async (req, res, next) => {
    try {
        const q = decodeURIComponent(req.query.q);
        const filteredPosts = [];

        let pageSize = 8;
        let pageNumber = 0;

        const queryPageSize = req.query.pageSize;
        if (queryPageSize) {
            pageSize = +queryPageSize;
        }

        const queryPageNumber = req.query.pageNumber;
        if (queryPageNumber) {
            pageNumber = +queryPageNumber;
        }
        const posts = cache.getPosts();

        let count = 0;
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            if (post.title.toLowerCase().includes(q) || post.subtitle.toLowerCase().includes(q)) {
                filteredPosts.push(post);
                count++;
            }
        }

        if (filteredPosts.length < (pageNumber + 1) * pageSize) {
            const diff = Math.min((pageNumber + 1) * pageSize - filteredPosts.length, pageSize);
            let allPosts = [];
            if (diff !== pageSize) {
                allPosts = filteredPosts.slice(pageNumber * pageSize);
            }

            const combinations = getCombinations(q.split(' '));
            const sortedCombinations = combinations.sort(function(a, b){
                return b.length - a.length;
            });

            for (let i = 0; i < sortedCombinations.length; i++) {
                const dbTag = await Tag.findOne({where: {name: sortedCombinations[i]}});
                if (dbTag) {
                    const dbPosts = await Post.findAll({
                        attributes: ['id', 'title', 'subtitle', 'type', 'picUrl'],
                        include: [{
                            model: PostsTags,
                            where: {TagId: dbTag.id},
                            attributes: []
                        }],
                        limit: diff,
                        offset: Math.max((pageSize * pageNumber) - filteredPosts.length, 0),
                        raw: true
                    });
                    allPosts = allPosts.concat(dbPosts);
                    return res.status(200).json({posts: allPosts});
                }
            }
            return res.status(200).json({posts: filteredPosts});
        }
        return res.status(200).json({posts: filteredPosts.slice(pageSize * pageNumber, pageSize * (pageNumber + 1))})

    } catch (e) {
        console.log(e);
        return res.status(500).json({message: 'Server error'});
    }
};
