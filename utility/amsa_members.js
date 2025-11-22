



const db = require('../models');
const User = db.User;
const fs = require('fs');
const bcrypt = require('bcryptjs');
const nodeMailer = require('nodemailer');


const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    s = s.toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1)
};


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function generateHash() {
    const hash = [];
    for (let i = 0; i < 12; i++) {
        hash.push(CHARS[getRandomInt(CHARS.length)]);
    }
    return hash.join('');
}


function amsa_members_json() {
    const rows = fs.readFileSync('./utility/amsa_members.txt', 'utf8').trim().split('\n').slice(1);
    const users = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i].trim().split(',');

        let user = {
            firstName: capitalize(row[1]).trim(),
            lastName: capitalize(row[0]).trim(),
            email: row[2].toLowerCase().trim(),
            personalEmail: row[3].toLowerCase().trim(),
            schoolName: row[4].trim(),
            birthday: new Date(),
            major: row[7].trim(),
            major2: row[8].trim(),
            phoneNumber: row[10].trim(),
            graduationYear: row[11].trim()
        };

        if (row[9]) {
            const birthday = row[9].split('/');
            const year = parseInt(birthday[2]);
            const month = parseInt(birthday[0]);
            const date = parseInt(birthday[1]);
            user.birthday = new Date(year, month, date);
        }

        if (!user.email && !user.personalEmail) {
            user.email = user.firstName + user.lastName + '@a.mn';
            user.personalEmail = user.firstName + user.lastName + '@a.mn';
        }

        if (user.email && !user.personalEmail) {
            user.personalEmail = user.email;
        }

        if (!user.email && user.personalEmail) {
            user.email = user.personalEmail;
        }
        user.password = generateHash();
        users.push(user);
    }
    fs.writeFileSync('./utility/amsa_members_json.txt', JSON.stringify(users));
}

async function hash_password_users() {
    const users = JSON.parse(fs.readFileSync('./utility/amsa_members_json.txt', 'utf8'));

    for (let i = 0; i < users.length; i++) {
        users[i].password = await bcrypt.hash(users[i].password, 10);
        console.log(i);
    }

    fs.writeFileSync('./utility/amsa_members_json_hashed_password.txt', JSON.stringify(users));
}


async function insert_users() {
    try {
        const users = JSON.parse(fs.readFileSync('./utility/amsa_members_json_hashed_password.txt', 'utf8'));


        for (let i = 0; i < users.length; i++) {
            const user = await User.findOne({where: {email: users[i].email}});
            if (!user) {
                await User.create(users[i]);
            }
            console.log(i);
        }

        console.log('done');
    } catch (e) {
        console.log(e);
    }
}


async function send_emails() {
    try {





    } catch (e) {
        console.log(e);
    }
}



const sendEmail = async function(toEmail, subject, html) {
    try {
        const transporter = nodeMailer.createTransport({
            host: 'mail.amsa.mn',
            port: 465,
            auth: {
                user: 'news@amsa.mn',
                pass: 'AmsaAmoxNews123$'
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: 'news@amsa.mn', // sender address
            to: toEmail, // list of receivers
            subject: subject, // Subject line
            html: html, // plain text body
            // attachments: [{path: './attachments/AMSA_2019-2020_election.pdf'}]
        };
        let message = 'default msg';
        await transporter.sendMail(mailOptions).then(() => {
            message = 'Sent to ' + toEmail;
        }).catch((e) => {
            console.log(e);
            message = 'Not sent to ' + toEmail;
        });
        console.log(message);
        return message;
    } catch (e) {
        console.log(e);
    }
};



(async () => {
    try {
        const users = JSON.parse(fs.readFileSync('./utility/amsa_members_json.txt', 'utf8'));
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const eduEmail = user.email;
            const personalEmail = user.personalEmail;

            const html = `
                Hello ${user.firstName} ${user.lastName}
                <br>
                We have created an AMSA account for you based on the form you filled when you joined AMSA, and here is your login info.
                <br>
                <br>
                email: ${eduEmail}
                <br>
                password: ${user.password}
                <br>
                <br>
                Please login using the above credentials at <a href="${process.env.AMSA_FRONTEND_ADDRESS}" target="_blank">AMSA.mn</a>
                <br>
                AMSA
            `;

            if (eduEmail !== personalEmail) {
                if (!eduEmail.endsWith('@a.mn')) {
                    await sendEmail(eduEmail, 'Your AMSA account has been created!', html);
                }
                if (!personalEmail.endsWith('@a.mn')) {
                    await sendEmail(eduEmail, 'Your AMSA account has been created!', html);
                }
            } else {
                if (!eduEmail.endsWith('@a.mn')) {
                    await sendEmail(eduEmail, 'Your AMSA account has been created!', html);
                }
            }
        }


    } catch (e) {
        console.log(e);
    }

})();
