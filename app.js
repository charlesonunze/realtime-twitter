const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const passportSocketIo = require('passport.socketio');
// const logger = require('morgan');
const mongoose = require('./db/db');

const indexRouter = require('./routes/index');
const accountRouter = require('./routes/account');

const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIO(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(
	express.urlencoded({
		extended: false,
	}),
);
app.use(express.static(path.join(__dirname, 'public')));

const SECRET = 'secret-stuff';
const sessionStore = new MongoStore({
	url: 'mongodb://root:abc123@ds217560.mlab.com:17560/twitter',
	autoReconnect: true,
});

// configs for cookieParser, session and flash
app.use(
	session({
		secret: SECRET,
		resave: true,
		saveUninitialized: true,
		store: sessionStore,
		cookie: {
			maxAge: 2592000000,
		},
	}),
);
app.use(flash());
app.use(cookieParser());

// set global variables
app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	res.locals.message = req.flash('message');
	res.locals.error = req.flash('error');
	// res.locals.user = req.user || null;
	next();
});

// 07064712056
// passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
	res.locals.user = req.user || null;
	next();
});
app.use(indexRouter);
app.use(accountRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

io.use(
	passportSocketIo.authorize({
		cookieParser: cookieParser, // the same middleware you registrer in express
		key: 'connect.sid', // the name of the cookie where express/connect stores its session_id
		secret: SECRET, // the session_secret to parse the cookie
		store: sessionStore, // we NEED to use a sessionstore. no memorystore please
		success: onAuthorizeSuccess, // *optional* callback on success - read more below
		fail: onAuthorizeFail, // *optional* callback on fail/error - read more below
	}),
);

function onAuthorizeSuccess(data, accept) {
	console.log('----------------------------------');
	console.log('successful connection to socket.io');
	// The accept-callback still allows us to decide whether to
	// accept the connection or not.
	accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
	if (error) throw new Error(message);
	console.log('----------------------------------');
	console.log('failed connection to socket.io:', message);
	// We use this callback to log all of our failed connections.
	accept(null, false);
}

require('./config/socket')(io);

server.listen(port, () => {
	console.log('----------------------------------');
	console.log(`Server started on ${port}`);
});

module.exports = app;
