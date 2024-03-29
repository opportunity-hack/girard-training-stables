const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./src/models/db/connector');
const { errorHandler } = require('./src/middlewares/errorHandler');
const { validateAccessToken } = require('./src/middlewares/auth0.middleware');
// body-parser no longer needed in newer versions of express -aaron
// const bodyParser = require ('body-parser');
const { expressjwt: jwt } = require('express-jwt');
const jwks = require('jwks-rsa');
const { auth } = require('express-oauth2-jwt-bearer');
const { addAccessTokenInterceptor } = require('./src/utils/httpClient')

// Get Auth0 management API token.
addAccessTokenInterceptor()
if (process.env.NODE_ENV === "production") {
    // In production, the access token needs to be refreshed periodically before it expires.
    const cron = require('node-cron');
    cron.schedule("0 */12 * * *", addAccessTokenInterceptor);
}

// environment variables in .env file
require('dotenv').config();

// connects to ATLAS_URI 
connectDB();

// create express server
const app = express();

// port that server will run on
const port = process.env.PORT || 5000;

var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://dev-5wed6txz.us.auth0.com/.well-known/jwks.json'
  }),
  audience: 'https://girard-server.herokuapp.com', // https://girard-server.herokuapp.com
    issuer: 'https://dev-5wed6txz.us.auth0.com/',
  algorithms: ['RS256']
});

app.use(cors());
app.use(express.json());

var winston = require('winston'), expressWinston = require('express-winston');

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.json()
  ),
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) { return false; }
}));

const horseRouter = require('./src/routes/horse');
const lessonRouter = require('./src/routes/lesson');
const userRouter = require('./src/routes/user');
const meRouter = require('./src/routes/me');

// require authentication to access all routes
app.use(validateAccessToken)

app.use('/horses', horseRouter);
app.use('/lessons', lessonRouter);
app.use('/users', userRouter);
app.use('/me', meRouter);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
