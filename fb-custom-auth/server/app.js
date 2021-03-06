/** 
 * Server: Custom Token Generator
 *  -https://github.com/ksachdeva/firebase-custom-auth-example
 * 
 * Running
 *  $npm install
 *  $nodemon app.js
 */

const restify = require('restify');
const firebase = require('firebase');
const _ = require('lodash');

const app = restify.createServer(
    {
        name: 'Custom Login',
        version: '1.0.0'
    }
);
app.use(restify.acceptParser(app.acceptable));
app.use(restify.authorizationParser());
app.use(restify.dateParser());
app.use(restify.queryParser());
app.use(restify.jsonp());
app.use(restify.gzipResponse());
app.use(restify.bodyParser());
app.use(restify.CORS());

// we will just create one end point
// where the user will submit his username password
const FB_DB_URL = 'https://vivid-torch-3052.firebaseio.com/';
const SERVICE_ACCOUNT_FILE = 'ngfire2test-service-account.json';

// this make sure that we are authenticated to the account
const fbAppRef = firebase.initializeApp({
    serviceAccount: SERVICE_ACCOUNT_FILE,
    databaseURL: FB_DB_URL
});

// pre-created accounts (in real life they will be in some database)
const account1 = {
    name: 'HyunSoo Lee',
    username: 'hslee@gmail.com',
    password: '1234',
    uuid: '596677b3-b6e6-4405-80ae-4c75928df132'
};

const account2 = {
    name: 'Bharat Sachdeva',
    username: 'bsachdeva@someemail.com',
    password: 'password2',
    uuid: '372313db-6f3e-4da4-aa68-5596f2cf0067'
};

const dbAccounts = [account1, account2];

/*
app.get('/', (req, res, next) => {
    res.send("hello: req: " + req.body );
});
*/

// How to POST JSON data with Curl from Terminal/Commandline to Test Spring REST?
//  -http://stackoverflow.com/questions/7172784/how-to-post-json-data-with-curl-from-terminal-commandline-to-test-spring-rest
// $curl -H "Content-Type: application/json" \
//  -X POST -d '{"username":"hslee@gmail.com","password":"1234"}' \
//  http://localhost:8080/login
app.post('/login', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(username + '/' + password );

    // finding which account will match the upplied credentials
    const accounts = _.filter(dbAccounts, {
        username: username,
        password: password
    });

    if (accounts === undefined || accounts === null || accounts.length === 0) {
        res.send(400);
        return next();
    }
    // should be the only one in the array
    const theAccount = accounts[0];

    // finally we are using firebase to generate the custom token
    const fbAppAuth = fbAppRef.auth();
    const token = fbAppAuth.createCustomToken(theAccount.uuid, {
        name: theAccount.name
    });
    console.log("Token: " + token );

    res.send({
        token
    });
});

app.post('/kakao', (req, res, next) => {
    const uid = "kakao" + req.body.uid; // uid가 Number 경우, ERROR
    const username = req.body.username;
    console.log(uid + '/' + username );

    if (uid === undefined || uid === null ) {
        res.send(400);
        return next();
    }

    // finally we are using firebase to generate the custom token
    const fbAppAuth = fbAppRef.auth();
    const token = fbAppAuth.createCustomToken(uid, {
        name: username
    });
    // console.log("Token: " + token );

    res.send({
        token
    });
});

// For Stack Trace
app.on('uncaughtException', function (req, res, route, err) {
    console.log('uncaughtException', err.stack);
});

app.listen(8080, () => {
    console.log('%s listening at %s', app.name, app.url)
});