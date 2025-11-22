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

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const fileStorage = multer.memoryStorage();

const app = express();
// Enable compression for all responses
app.use(compression());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Multer middleware
app.use(multer({ storage: fileStorage, limits: { fileSize: 1024 * 1024 * 3 } }).single('image'));

// Custom middleware to upload to Supabase
app.use(async (req, res, next) => {
    if (req.file) {
        try {
            const folder = req.url.split('/')[2] || 'misc';
            const filename = new Date().getTime() + '-' + req.file.originalname;
            const filePath = `${folder}/${filename}`;

            const { data, error } = await supabase.storage
                .from('pictures')
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false
                });

            if (error) {
                console.error('Supabase upload error:', error);
                return next(error);
            }

            const { data: publicUrlData } = supabase.storage
                .from('pictures')
                .getPublicUrl(filePath);

            // Update req.file.path to be the public URL, so controllers work as expected
            // Note: Controllers expect a relative path or full URL depending on usage.
            // Based on user.js: image.path.substring(...) logic might break.
            // We should update controllers or mock the path here.

            // For now, let's set the path to the full URL.
            // We will need to fix the controllers to handle this.
            req.file.path = publicUrlData.publicUrl;

            // Also attach it to body if needed, but req.file is standard.
        } catch (err) {
            console.error('Upload middleware error:', err);
            return next(err);
        }
    }
    next();
});

// app.use(express.static(path_join(__dirname, 'public')));
// app.use('/pictures', express.static(path_join(__dirname, 'pictures')));

// const accessLogStream = createWriteStream(
//     path_join(__dirname, 'access.log'),
//     { flags: 'a' }
// );

app.use(helmet());
// app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('combined')); // Log to stdout instead

app.use((req, res, next) => {
    // Allow requests from production frontend
    const allowedOrigins = [
        'https://amsa.mn',
        'http://localhost:4200',
        'http://localhost:3000',
        'https://amsa-frontend-vercel.vercel.app', // Add new frontend URL
        'https://amsa-backend-vercel.vercel.app'   // Add self
    ];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin) || !origin) { // Allow no origin (e.g. server-to-server or tools)
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
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

// Global readiness middleware for API routes: return 503 with Retry-After while DB is initializing
app.use('/api', async (req, res, next) => {
    try {
        const db = require('./models');
        if (db && typeof db.isReady === 'function' && !db.isReady()) {
            // If DB is not ready, wait for the init promise to resolve
            if (db.initPromise) {
                console.log('Waiting for DB init...');
                await db.initPromise;
            }

            // Check again after waiting
            if (!db.isReady()) {
                // Suggest the client retry after a short period
                res.setHeader('Retry-After', '3');
                return res.status(503).json({ status: 'db_not_ready' });
            }
        }
    } catch (err) {
        // If models import or check fails, allow request to proceed and be handled by route-level error handling
        console.warn('Readiness middleware error:', err && err.message ? err.message : err);
    }
    next();
});

// Routes
app.use('/api/user', usersRoutes);
app.use('/api/badge', badgesRoutes);
app.use('/api/post', postsRoutes);
app.use('/api/interact', interactionsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/search', searchRoutes);

// Health endpoint: returns 200 only when DB is initialized; otherwise 503
app.get('/health', (req, res) => {
    try {
        const db = require('./models');
        if (db && typeof db.isReady === 'function' && db.isReady()) {
            return res.status(200).json({ status: 'ok' });
        }
        return res.status(503).json({ status: 'db_not_ready' });
    } catch (err) {
        return res.status(500).json({ status: 'error', error: String(err) });
    }
});

// Temporary debug endpoint (do not expose in production) — returns DB host Node sees and DNS lookup result
app.get('/__debug/db-host', async (req, res) => {
    try {
        const raw = process.env.DATABASE_URL || process.env.DB_URL || null;
        let host = null;
        if (raw) {
            try {
                // Use URL to parse host; works if DATABASE_URL includes protocol (postgres://...)
                host = new URL(raw).hostname;
            } catch (e) {
                // Fallback: extract between @ and : or /
                const afterAt = raw.split('@')[1] || raw;
                host = afterAt.split(':')[0].split('/')[0];
            }
        }

        const dns = require('dns').promises;
        let lookup = null;
        if (host) {
            try {
                lookup = await dns.lookup(host);
            } catch (e) {
                lookup = { error: e.message };
            }
        }

        return res.json({ host: host || null, lookup });
    } catch (err) {
        return res.status(500).json({ error: String(err) });
    }
});

console.log('Username:', process.env.AMSA_MYSQL_USER);
console.log('Database:', process.env.AMSA_MYSQL_DATABASE);

// Startup DNS check for the DATABASE_URL host — logs resolution result to help diagnose ENOTFOUND on Vercel
(async () => {
    try {
        const raw = process.env.DATABASE_URL || process.env.DB_URL || null;
        if (!raw) {
            console.log('Startup DNS check: no DATABASE_URL or DB_URL env var found');
        } else {
            let host = null;
            try {
                host = new URL(raw).hostname;
            } catch (e) {
                const afterAt = raw.split('@')[1] || raw;
                host = afterAt.split(':')[0].split('/')[0];
            }
            const dns = require('dns').promises;
            try {
                const lookup = await dns.lookup(host);
                console.log('Startup DNS lookup:', host, '->', lookup);
            } catch (err) {
                console.warn('Startup DNS lookup failed for host', host, ':', err && err.message ? err.message : err);
            }
        }
    } catch (err) {
        console.warn('Startup DNS check error:', err && err.message ? err.message : err);
    }
})();

// Caching all the variables
require('./utility/cache').setAllVariables().then(() => {
    console.log('All cache is set!');
});

//Handle errors
app.use(function (err, req, res, next) {
    console.log(err);
    return res.status(err.status || 500).json({ error: JSON.stringify(err) });
});

module.exports = app;





