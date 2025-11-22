const db = require('../models');
const Post = db.Post;

let allPosts = [];
let cacheTimestamp = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache TTL

module.exports.setAllVariables = async () => {
    try {
        // Only load essential fields for search to reduce memory usage
        const postReq = Post.findAll({
            attributes: ['id', 'title', 'subtitle', 'type', 'picUrl'],
            raw: true,
            // Limit to most recent posts if you have many (optional optimization)
            // order: [['createdAt', 'DESC']],
            // limit: 1000  // Uncomment and adjust if you have thousands of posts
        });

        const posts = await postReq;
        
        // Store only what's needed for search (title and subtitle are strings, keep them minimal)
        allPosts = posts.map(post => ({
            id: post.id,
            title: post.title || '',
            subtitle: post.subtitle || '',
            type: post.type,
            picUrl: post.picUrl
        }));
        
        cacheTimestamp = Date.now();
        console.log(`Cache Reset: ${allPosts.length} posts cached`);
    } catch (e) {
        console.error('Cache error:', e);
    }
};

// Check if cache needs refresh
const shouldRefreshCache = () => {
    if (!cacheTimestamp) return true;
    return (Date.now() - cacheTimestamp) > CACHE_TTL;
};

module.exports.getPosts = () => {
    // Auto-refresh cache if expired (async, non-blocking)
    if (shouldRefreshCache()) {
        module.exports.setAllVariables().catch(err => console.error('Auto cache refresh failed:', err));
    }
    return allPosts;
};

// Force cache refresh
module.exports.refreshCache = module.exports.setAllVariables;
