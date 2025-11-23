const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const db = require("../models");

const bcrypt = require("bcryptjs");

const BCRYPT_ROUNDS = 10;
const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const MAX_HASH_LENGTH = 190;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function generateHash() {
    const hash = [];
    for (let i = 0; i < MAX_HASH_LENGTH; i++) {
        hash.push(CHARS[getRandomInt(CHARS.length)]);
    }
    return hash.join("");
}

passport.use(
    "signup",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            session: false,
            passReqToCallback: true,
        },
        async (req, email, password, done) => {
            try {
                const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

                const user = await db.User.create({
                    email: email,
                    password: hashedPassword,
                    firstName: req.body.firstName || null,
                    lastName: req.body.lastName || null,
                    birthday: req.body.birthday ? req.body.birthday.substring(0, 10) : null,
                    address1: req.body.address1 || null,
                    address2: req.body.address2 || null,
                    city: req.body.city || null,
                    state: req.body.state || null,
                    zipCode: req.body.zipCode || null,
                    phoneNumber: req.body.phoneNumber || null,
                    personalEmail: req.body.personalEmail || null,
                    facebook: req.body.facebook || null,
                    linkedin: req.body.linkedin || null,
                    instagram: req.body.instagram || null,
                    schoolYear: req.body.schoolYear || null,
                    schoolState: req.body.schoolState || null,
                    schoolCity: req.body.schoolCity || null,
                    degreeLevel: req.body.degreeLevel || null,
                    graduationYear: req.body.graduationYear || null,
                    major: req.body.major || null,
                    major2: req.body.major2 || null,
                    schoolName: req.body.schoolName || null,
                    acceptanceStatus: "00",
                    hash: generateHash(),
                    emailVerified: 1,
                    level: 1,
                    profilePic: "pictures\\user\\avatar.png",
                });
                return done(null, { email: user.email, userId: user.id, hash: user.hash });
            } catch (e) {
                console.log(e);
                return done(e);
            }
        }
    )
);

passport.use(
    "guestSignup",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            session: false,
            passReqToCallback: true,
        },
        async (req, email, password, done) => {
            try {
                const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
                const user = await db.User.create({
                    email: email,
                    password: hashedPassword,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    birthday: req.body.birthday,
                    acceptanceStatus: "00",
                    hash: generateHash(),
                    emailVerified: 0,
                    level: 0,
                    profilePic: "pictures\\user\\avatar.png",
                });
                return done(null, { email: user.email, userId: user.id, hash: user.hash });
            } catch (e) {
                return done(e);
            }
        }
    )
);

passport.use(
    "login",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            session: false,
        },
        async (email, password, done) => {
            try {
                const user = await db.User.findOne({ where: { email: email } });
                if (user) {
                    if (user.emailVerified === 0) {
                        return done(null, false, { message: "Email not verified!" });
                    }
                    const response = await bcrypt.compare(password, user.password);
                    if (response) {
                        return done(
                            null,
                            { email: user.email, userId: user.id, level: user.level },
                            { message: "Logged in Successfully" }
                        );
                    }
                    return done(null, false, { message: "Password did not match" });
                }
                return done(null, false, { message: "Email not found" });
            } catch (e) {
                return done(e);
            }
        }
    )
);

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.AMSA_JWT_KEY || 'amsa-default-jwt-secret-key-for-development',
};

passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const user = await db.User.findOne({
                where: { id: jwt_payload.userId, email: jwt_payload.email, level: jwt_payload.level },
            });
            if (user) {
                return done(null, { email: user.email, userId: user.id, level: user.level });
            }
            return done(null, false, { message: "Invalid Token" });
        } catch (e) {
            return done(e);
        }
    })
);
