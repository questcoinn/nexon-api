const express = require('express');
const path = require('path');
require('dotenv').config();

const landingRouter = require('./routes/landing_router');
const fifa4Router = require('./routes/fifa4_router');
const errorRouter = require('./routes/error_router');

const app = express();

const { HOST, PORT } = process.env;

/* view engine */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
/* statuscode from 304 to 200 */
app.set('etag', false);

/* static */
app.use(express.static(path.join(__dirname, 'public'), { etag: false }));

/* Set proxy for cors */
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', HOST);
//     next();
// });

/* routers */
app.use('/', landingRouter);
app.use('/fifa4', fifa4Router);

/* error */
app.use('*', errorRouter);

/* listen */
app.listen(PORT, () => {
    console.log(`Server listening at http://${HOST}:${PORT}`);
});
