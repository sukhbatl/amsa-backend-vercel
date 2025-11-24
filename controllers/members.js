const db = require('../models');

const sequelize = db.sequelize;



module.exports.getAllMembers = async (req, res, next) => {
    try {
        const members = await db.User.findAll({ attributes: ['id', 'firstName', 'lastName', 'schoolName'] });
        return res.status(200).json(members);
    } catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports.getGraduationYearMembers = async (req, res, next) => {
    try {
        // Get the graduation year from the authenticated user
        const userId = req.userData?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const referenceUser = await db.User.findByPk(userId, { attributes: ['graduationYear'] });

        if (!referenceUser || !referenceUser.graduationYear) {
            return res.status(404).json({ message: 'Graduation year not set for your profile' });
        }

        // Find all members with the same graduation year
        const members = await db.User.findAll({
            where: { graduationYear: referenceUser.graduationYear },
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'schoolName']
        });

        return res.status(200).json(members);
    } catch (e) {
        console.error('Error fetching graduation year members:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}
