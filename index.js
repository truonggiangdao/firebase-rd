// Nodejs lib set up
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

//Setup Express
const cors = require('cors')({
  origin: true,
  credentials: true,
});

app.use(cors);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

// Firebase set up
const functions = require('firebase-functions');
const userServices = require('./userServices')

//Create new user
app.post('/register', async (req, res) => {
	const dataJson = req.body;
	try {
		// const userData = {};
		const userAuth = await userServices.addUserAuth(dataJson);
		if (userAuth) {
			const profile = {
				uid: userAuth.uid,
				firstName : dataJson.firstName,
				lastName : dataJson.lastName,
				displayName: dataJson.firstName + dataJson.lastName,
				phoneNumber: (dataJson.phone) ? dataJson.phone : null,
				username: dataJson.username,
				email: dataJson.email,
				accessToken: userAuth.lat,
				refreshToken: userAuth.refreshToken
			}

			userData = await userServices.addUserDB(profile);
			res.send(userData);
		}
	} catch (err) {
		res.send(err);
	}
});

app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let valid = userServices.authenticate(email , password);
  valid.then(data => {
    return res.send(data);
  }).catch(err => {
    return res.send(err)
  });
});

app.get('/logout', (req, res) => {
  let result = userServices.logout();
  res.send(result);
});


app.listen(5000, () => {
  console.log('App listening port', 5000);
});

exports.app = functions.https.onRequest(app);
