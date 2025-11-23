const db = require('../models');
const path = require('path');
const sendEmail = require('../utility/email').sendEmail;

module.exports.newBadge = async (req, res, next) => {
    try {
        const image = req.file;
        if (!image) {
            return res.status(422).json({ message: 'Image not a valid' });
        }
        const currentFolder = __dirname.split(path.sep).pop();
        const imagePath = image.path.substring(__dirname.length - currentFolder.length);
        const newBadge = {
            name: req.body.name,
            picUrl: imagePath,
            title: req.body.title,
            description: req.body.description,
        };

        await db.Badge.create(newBadge);

        return res.status(201).json({ message: 'Badge Created Successfully' });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports.assignBadge = async (req, res, next) => {
    try {
        const UserId = req.body.UserId;
        const BadgeId = req.body.BadgeId;
        const assignment = {
            UserId,
            BadgeId
        };
        await db.UsersBadges.create(assignment);

        sendBadgeNotification(UserId, BadgeId).then();

        return res.status(201).json({ message: 'Badge Assigned Successfully' });
    } catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get current user's all badges
module.exports.getBadges = async (req, res, next) => {
    try {
        const badges = await db.UsersBadges.findAll({
            where: { UserId: req.user.userId },
            attributes: [],
            include: [{
                model: db.Badge,
                attributes: ['id', 'title', 'name', 'description', 'picUrl']
            }]
        });
        if (badges) {
            return res.status(200).json(badges.map(b => b.Badge));
        } else {
            return res.status(200).json([]);
        }

    } catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get all the badges in the Database
module.exports.getAllBadges = async (req, res, next) => {
    try {
        const badges = await db.Badge.findAll({
            attributes: ['id', 'name', 'description', 'picUrl']
        });
        if (badges) {
            return res.status(200).json(badges);
        } else {
            return res.status(200).json([]);
        }

    } catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// Delete a given badge
module.exports.deleteBadge = async (req, res, next) => {
    try {
        const id = +req.params.id;
        const result = await db.Badge.destroy({ where: { id } });
        if (result > 0) {
            return res.status(200).json({ message: 'Deleted' });
        } else {
            return res.status(404).json({ message: 'Item not found' });
        }
    } catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get all the users who owns the given badge
module.exports.getAllUsers = async (req, res, next) => {
    try {
        const id = +req.params.id;
        console.log(id);
        const badgePromise = db.Badge.findOne({
            where: { id },
            attributes: ['id', 'name', 'description', 'picUrl'],
        });

        const usersPromise = db.UsersBadges.findAll({
            where: { BadgeId: id },
            attributes: [],
            include: [{
                model: db.User,
                attributes: ['id', 'firstName', 'lastName', 'email', 'schoolName', 'profilePic']
            }]
        });

        const results = await Promise.all([badgePromise, usersPromise]);
        // console.log(results[0].toJSON());
        // console.log(results[1].toJSON());
        if (results[0] && results[1]) {
            return res.status(200).json({ Badge: results[0], Users: results[1].map(x => x.User) });
        }
        return res.status(404).json({ message: 'Badge not found' });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Server error' });
    }
};

sendBadgeNotification = async (userID, badgeID) => {
    try {

        const user = await db.User.findOne({ where: { id: userID }, attributes: ['firstName', 'lastName', 'personalEmail'] });
        const badge = await db.Badge.findOne({ where: { id: badgeID }, attributes: ['name'] });


        const html = `
            Hello ${user.firstName}, ${user.lastName}!
            <br>
            Congrats! A Badge named - ${badge.name} has been assigned to you. 
            Click <a href="${process.env.AMSA_FRONTEND_ADDRESS}/badges/${badgeID}" target="_blank">here</a> to see who else has this badge.
            <br>
            <br>
            Sincerely, AMSA`;
        sendEmail(user.personalEmail, 'AMSA.mn - You earned a new badge!', html).then();
    } catch (e) {
        return e;
    }
};
