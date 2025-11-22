const db = require('../models');
const User = db.User;
const sequelize = db.sequelize;



module.exports.getAllMembers = async (req, res, next) => {
    try {
        const members = await User.findAll({ attributes: ['id', 'firstName', 'lastName', 'schoolName'] });
        return res.status(200).json(members);
    } catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports.getGraduationYearMembers = async (req, res, next) => {
    try {
        const members = await sequelize.query('select id, firstName, lastName, email, profilePic, schoolName from amsamn_website_db.Users where graduationYear = (SELECT graduationYear FROM amsamn_website_db.Users where id = 1);')
        return res.status(200).json(members[0]);
    } catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
}



