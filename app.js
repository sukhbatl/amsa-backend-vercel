// Load environment variables from .env file (for local development only)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const createWriteStream = require('fs').createWriteStream;
const path_join = require('path').join;
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const compression = require('compression');

const usersRoutes = require('./routes/user');
const badgesRoutes = require('./routes/badge');
const postsRoutes = require('./routes/post');
const interactionsRoutes = require('./routes/interact');
const membersRoutes = require('./routes/members');
const homeRoutes = require('./routes/home');
const searchRoutes = require('./routes/search');

const passport = require('passport');
require('./config/passport');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.url.split('/')[2];
        cb(null, path_join(__dirname, 'pictures', folder));
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname);
    },
    fileFilter: (req, file, cb) => {
        if (file.mimeType === 'image/png' || file.mimeType === 'image/jpeg' || file.mimeType === 'image/jpg') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

const app = express();
// Enable compression for all responses
app.use(compression());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false}));
// parse application/json
app.use(bodyParser.json());
app.use(multer({storage: fileStorage, limits: {fileSize: 1024 * 1024 * 3}}).single('image'));
app.use(express.static(path_join(__dirname, 'public')));
app.use('/pictures', express.static(path_join(__dirname, 'pictures')));

const accessLogStream = createWriteStream(
    path_join(__dirname, 'access.log'),
    { flags: 'a'}
);

app.use(helmet());
app.use(morgan('combined', { stream: accessLogStream }));

app.use((req, res, next) => {
    // Allow requests from production frontend
    const allowedOrigins = ['https://amsa.mn', 'http://localhost:4200', 'http://localhost:3000'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV !== 'production') {
        // In development, allow any origin
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS, PUT');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});
app.use(passport.initialize());

// Routes
app.use('/api/user', usersRoutes);
app.use('/api/badge', badgesRoutes);
app.use('/api/post', postsRoutes);
app.use('/api/interact', interactionsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/search', searchRoutes);

console.log('Username:', process.env.AMSA_MYSQL_USER);
console.log('Database:', process.env.AMSA_MYSQL_DATABASE);

// Caching all the variables
require('./utility/cache').setAllVariables().then(() => {
    console.log('All cache is set!');
});

//Handle errors
app.use(function(err, req, res, next) {
    console.log(err);
    return res.status(err.status || 500).json({ error : JSON.stringify(err) });
});

module.exports = app;





