const jwt = require("jsonwebtoken");
const db = require("../models");

const generateHash = require("../utility/hash").generateHash;
const sendEmail = require("../utility/email").sendEmail;
const bcrypt = require("bcryptjs");
const BCRYPT_ROUNDS = 10;
const passport = require("passport");
const path = require("path");

exports.createUser = (req, res, next) => {
    passport.authenticate("signup", async (err, user, info) => {
        try {
            if (err || !user) {
                return res.status(404).json({ message: err });
            }
            // sendVerificationEmail(user).then();
            return res.status(201).json({
                message: "User created!",
            });
        } catch (e) {
            next(e);
        }
    })(req, res, next);
};

exports.createGuestUser = (req, res, next) => {
    passport.authenticate("guestSignup", async (err, user, info) => {
        try {
            if (err || !user) {
                return res.status(404).json({ message: info.message });
            }
            sendVerificationEmail(user).then();
            return res.status(201).json({
                message: "User created!",
            });
        } catch (e) {
            next(e);
        }
    })(req, res, next);
};

exports.userLogin = (req, res, next) => {
    passport.authenticate("login", async (err, user, info) => {
        try {
            return general_login(err, user, info, req, res, next);
        } catch (e) {
            return next(e);
        }
    })(req, res, next);
};

exports.updateProfile = async (req, res, next) => {
    try {
        const User = db.User;
        const userId = req.user.userId;
        const user = await User.findOne({ where: { id: userId } });
        if (user) {
            // Convert birthday to MySQL-compatible format (YYYY-MM-DD)
            let birthday = req.body.birthday;
            if (birthday && typeof birthday === 'string') {
                // If it's an ISO date string, extract just the date part
                birthday = birthday.split('T')[0];
            }

            const new_user = {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                birthday: birthday,
                address1: req.body.address1,
                address2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                zipCode: req.body.zipCode,
                phoneNumber: req.body.phoneNumber,
                personalEmail: req.body.personalEmail,
                facebook: req.body.facebook,
                instagram: req.body.instagram,
                linkedin: req.body.linkedin,
                degreeLevel: req.body.degreeLevel,
                graduationYear: req.body.graduationYear,
                major: req.body.major,
                major2: req.body.major2,
                schoolName: req.body.schoolName,
                schoolYear: req.body.schoolYear,
                schoolCity: req.body.schoolCity,
                schoolState: req.body.schoolState,
                bio: req.body.bio,
            };
            const updated = await user.update(new_user);
            if (updated) {
                return res.status(200).json({
                    message: "User updated successfully",
                });
            } else {
                return res.status(400).json({
                    message: "User failed to update",
                });
            }
        } else {
            return res.status(404).json({
                message: "User not found",
            });
        }
    } catch (e) {
        console.error("Profile update error:", e);
        return res.status(500).json({
            message: "Server not available",
            error: e.message || JSON.stringify(e),
        });
    }
};

exports.getUser = async (req, res, next) => {
    try {
        const User = db.User;
        const UsersBadges = db.UsersBadges;
        const Badge = db.Badge;
        const Post = db.Post;

        let userId = req.user.userId;
        let exclude = ["createdAt", "updatedAt", "hash", "password"];
        if (req.params.id) {
            userId = req.params.id;
            exclude = [
                "createdAt",
                "updatedAt",
                "hash",
                "password",
                "birthday",
                "address1",
                "address2",
                "city",
                "state",
                "zipCode",
                "phoneNumber",
                "acceptanceStatus",
                "emailVerified",
                "level",
                "schoolCity",
                "schoolState",
                "schoolYear",
            ];
        }
        const user = await User.findOne({
            where: { id: userId },
            attributes: { exclude },
            include: [
                {
                    model: UsersBadges,
                    attributes: ["id"],
                    include: [
                        {
                            model: Badge,
                            attributes: ["id", "name", "description", "picUrl"],
                        },
                    ],
                },
                {
                    model: Post,
                    attributes: ["id", "title", "picUrl", "subTitle", "type", "category", "tags"],
                },
            ],
        });
        if (user) {
            const userJSON = user.toJSON();
            userJSON["Badges"] = userJSON["UsersBadges"].map((u) => u["Badge"]);
            delete userJSON["UsersBadges"];
            return res.status(200).json(userJSON);
        } else {
            return res.status(404).json({
                message: "User not found",
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Server not available",
            error: e.message
        });
    }
};

exports.getPublicUser = async (req, res, next) => {
    try {
        const User = db.User;
        const UsersBadges = db.UsersBadges;
        const Badge = db.Badge;
        const Post = db.Post;

        const userId = req.params.id;
        const exclude = [
            "createdAt",
            "updatedAt",
            "hash",
            "password",
            "birthday",
            "address1",
            "address2",
            "city",
            "state",
            "zipCode",
            "phoneNumber",
            "acceptanceStatus",
            "emailVerified",
            "level",
            "schoolCity",
            "schoolState",
            "schoolYear",
            "email",
            "personalEmail",
        ];

        const user = await User.findOne({
            where: { id: userId },
            attributes: { exclude },
            include: [
                {
                    model: UsersBadges,
                    attributes: ["id"],
                    include: [
                        {
                            model: Badge,
                            attributes: ["id", "name", "description", "picUrl"],
                        },
                    ],
                },
                {
                    model: Post,
                    attributes: ["id", "title", "picUrl", "subTitle", "type", "category", "tags"],
                },
            ],
        });
        if (user) {
            const userJSON = user.toJSON();
            userJSON["Badges"] = userJSON["UsersBadges"].map((u) => u["Badge"]);
            delete userJSON["UsersBadges"];
            return res.status(200).json(userJSON);
        } else {
            return res.status(404).json({
                message: "User not found",
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Server not available",
            error: e.message
        });
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const User = db.User;
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;

        const user = await User.findOne({ where: { id: req.user.userId } });

        if (user) {
            const response = await bcrypt.compare(currentPassword, user.password);

            if (response) {
                const newHashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
                await user.update({ password: newHashedPassword });
                return res.status(200).json({ message: "Password updated!" });
            }
            return res.status(200).json({ message: "Password did not match" });
        }
        return res.status(200).json({ message: "User not found" });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Server not available",
            error: e.message
        });
    }
};

exports.forgotPasswordEmail = async (req, res, next) => {
    try {
        const User = db.User;
        const { email } = req.body;
        console.log(email);

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Invalid email input' });
        };

        // console.log('tring to find user');
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Email not found!' });
        };
        // console.log(user.email);

        // const hash = crypto.randomBytes(48).toString('hex');
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWYXZ';
        const hashArr = [];
        for (let i = 0; i < 64; i++) {
            hashArr.push(chars[Math.floor(Math.random() * chars.length)]);
        }
        const hash = hashArr.join('');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        console.log(hash);

        await user.update({
            hash,
            hashExpiresAt: expiresAt,
        });

        const resetLink = `https://amsa.mn/reset?hash=${encodeURIComponent(hash)}&email=${encodeURIComponent(email)}`;

        // await user.update({hash});

        await sendEmail(
            email,
            'amsa.mn - Password reset',
            `
                    <p>You requested a password reset.</p>
                    <p>Click <a href="${resetLink}" target="_blank">here</a> to reset your password.</p>
                    <p>This link will expire in 1 hour.</p>
                `
        );

        return res.status(200).json({
            message: 'Password reset email sent!',
        });
    } catch (e) {
        console.error('Forgot password error:', e);
        return res.status(500).json({
            message: "Server not available",
            error: e.message
        });
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const User = db.User;
        const { email, password, hash } = req.body;

        const user = await User.findOne({
            where: { email, hash },
        });

        if (!user || !user.hashExpiresAt || new Date() > user.hashExpiresAt) {
            throw new BadRequestException('Invalid or expired reset link.');
        }

        const hashPassword = await bcrypt.hash(password, 10);

        await user.update({
            password: hashPassword,
            hash: null,
            hashExpiresAt: null,
        });

        return res.status(200).json({
            message: 'Password reset successfully!',
        });
    } catch (e) {
        console.error('Reset Password Error:', e);
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
}

exports.updateProfilePic = async (req, res, next) => {
    try {
        const User = db.User;
        const image = req.file;
        if (!image) {
            return res.status(422).json({ message: "Image not a valid" });
        }
        // Supabase URL is already in image.path from our middleware
        const imagePath = image.path;

        const updated = await User.update({ profilePic: imagePath }, { where: { id: req.user.userId } });
        if (updated) {
            return res.status(200).json({ message: "Profile pic updated successfully", profilePic: imagePath });
        }
        return res.status(400).json({ message: "Profile pic was not updated" });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Server not available",
            error: e.message
        });
    }
};

exports.verifyEmail = async (req, res, next) => {
    try {
        const User = db.User;
        const hash = req.params.hash;
        const email = req.params.email;

        const user = await User.findOne({ where: { hash, email } });

        if (user) {
            await user.update({ emailVerified: 1, hash: generateHash() });
            return res.status(202).json({ message: "Email verified!" });
        }

        return res.status(202).json({ message: "Failed to verify" });
    } catch (e) {
        return res.status(500).json({
            message: "Server not available",
            error: e.message
        });
    }
};

exports.sendVerificationEmailAgain = async (req, res, next) => {
    try {
        const User = db.User;
        const user = await User.findOne({ where: { email: req.params.email } });
        if (user && user.emailVerified === 0) {
            sendVerificationEmail(user).then();
            return res.status(200).json({ message: "Email has been sent!" });
        }
        return res.status(200).json({ message: "User not found or already verified!" });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Server not available",
            error: e.message
        });
    }
};

exports.getMembers = async (req, res, next) => {
    try {
        const Role = db.Role;
        const User = db.User;

        if (!Role || !User) {
            return res.status(503).json({ message: "DB not ready" });
        }

        const members = await Role.findAll({
            attributes: ["UserId", "name", "year", "yearEnd", "role"],
            include: [
                {
                    model: User,
                    attributes: ["firstName", "lastName", "email", "schoolName", "profilePic", "linkedin"],
                },
            ],
        });

        const tuz_filter = [];
        const sb_filter = [];
        const current_tuz_filter = [];

        // Collecting the Strategy Board members
        for (let i = 0; i < members.length; i++) {
            if (members[i].role === "sb") {
                sb_filter.push(members[i]);
            } else if (members[i].role === "tuz") {
                tuz_filter.push(members[i]);
            }
        }
        // console.log(members.sb)
        // console.log(members.sb.User)

        // Collecting the current Executive Board members
        for (let i = 0; i < members.length; i++) {
            if ((members[i].role === "tuz") & (members[i].year === 2025)) {
                current_tuz_filter.push(members[i]);
            }
        }

        // Collecting the TUZ members in terms of year
        let years = Array.from(new Set(tuz_filter.map((x) => x.year)));

        const tuz_members_object = {};

        for (let i = 0; i < years.length; i++) {
            tuz_members_object[years[i]] = [];
        }

        for (let i = 0; i < tuz_filter.length; i++) {
            const member = tuz_filter[i];
            tuz_members_object[member.year].push(member);
        }

        return res.status(200).json({ tuz: tuz_members_object, sb: sb_filter, current_tuz: current_tuz_filter });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Server not available",
            error: e.message
        });
    }
};

sendVerificationEmail = async (user) => {
    try {
        const reqUrl = process.env.AMSA_FRONTEND_ADDRESS + "/auth/verify/" + user.email + "/" + user.hash;

        const html = `
            Click <a href="${reqUrl}" target="_blank">here</a> to verify your email:
            `;
        sendEmail(user.email, "AMSA.mn - Email verification", html).then();
    } catch (e) {
        return e;
    }
};

function general_login(err, user, info, req, res, next) {
    if (err || !user) {
        return res.status(404).json({ message: info.message });
    }
    req.login(user, { session: false }, async (error) => {
        if (error) return next(error);
        const body = { userId: user.userId || user.id, email: user.email, level: user.level };
        const token = jwt.sign(body, process.env.AMSA_JWT_KEY, { expiresIn: "10d" });
        return res.status(200).json({
            token: token,
            expiresIn: 3600 * 24 * 10,
            level: user.level,
            userId: user.userId || user.id,
        });
    });
}
