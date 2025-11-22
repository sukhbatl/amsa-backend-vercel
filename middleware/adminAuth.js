

module.exports = (req, res, next) => {
    if (req.level && req.level < 7) {
        return res.status(403).json({message: 'You do not have privilege to do this operation.'});
    }
    next();
};
