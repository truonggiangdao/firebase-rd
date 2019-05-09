const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

const firebaseConfig = require('./firebaseConfig.json');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();
const auth = admin.auth();

async function addUserAuth(data) {
	const dataAuth = await auth.createUser({
		email : data.email,
		password : data.password
	});
	return dataAuth;
}

function addUserDB(profile) {
	return new Promise((resolve, reject) => {
		const user = db.collection('users').doc(profile.uid);
		user.set(profile).then( (data) => {
			return resolve(data);
		}). catch( (err) => {
			return reject(err);
		});
	});
}

const authenticate = (email, password) => {
  return new Promise((resolve, reject) => {
    firebase.auth().signInWithEmailAndPassword(email, password).then(async data => {
      let infoUser = await getUserInfoFromDB(data.user);
      return resolve(infoUser);
    }).catch(err => {
      console.log(err);
      return reject(err);
    });
  });
}

const getUserInfoFromDB = (userInfo) => {
  let uid = userInfo.uid;
  return new Promise((resolve, reject) => {
    let usercRef = db.collection("users").doc(uid);
    usercRef.get().then(doc => {
      let dataDoc = doc.data();
      return resolve(dataDoc);
    }).catch(err => {
      return reject(err);
    });
  })
}

const logout = () => {
  firebase.auth().signOut().then(() => {
    return 'Sign-out successful';
  }).catch(err => {
    return err;
  });
}

module.exports = {
  addUserAuth: addUserAuth,
  addUserDB: addUserDB,
  authenticate: authenticate,
  logout: logout
}