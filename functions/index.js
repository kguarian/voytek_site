// Description: This is the index file for the Firebase Cloud Functions
//              that are used to retrieve data from the Firebase Realtime
//              Database. The data is then sent to the client side of the
//              application for use in the visualizations of EEG data.
// Author: Kenton Guarian
const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");
admin.initializeApp();
const { v4: uuidv4 } = require('uuid');
const { ref, push } = require("firebase/database");
const { json } = require("stream/consumers");

// a non-cloud function that is used to test the connection to the database


 /**
  * @param {functions.https.Request} request a formality of a web handler
  * @param {functions.Response} response a formality of a web handler
  * @return {Promise<functions.Response>} a promise that resolves to a response describing the result. Either data array or error message.
  */
exports.getDataJSON = functions.https.onRequest((request, response) => {
  // get database reference
  const database = admin.database();
  // just true for now. We need to adjust this whenever we change the db contents
  // we'll also have to adjust this when we randomize and limit the data we show
  // in the client side
  const signalCount = 48;
  const dataArray = [];
  for (let i = 0; i < signalCount; i++) {
    console.log(`data id: ${i}`);
    // TODO: use this to randomize the data we show in the client side
    const ref = database.ref(`sig_${i}`);
    const dataPromise = ref
      .once('value', snapshot => snapshot.val())
      .catch(error => {
        console.error(error);
        response
          .status(500)
          .send(`Error retrieving data from Realtime Database: ${error}`);
      });
    dataArray.push(dataPromise);
    console.log(`data·id: ${i} finished`);
  }
  // send all the data to the client side as a JSON string and selection
  Promise.all(dataArray).then(dataArray => {
    console.log(`data array:${dataArray}`);
    cors(request, response, () => {
      response.send(JSON.stringify(dataArray));
    });
  });
});

/**
 * @param {functions.https.Request} request a formality of a web handler. request.body.tuplist is an array of arrays of length 2.
 * Each inner array is a tuple of the form [x1, x2] where x1 and x2 are numbers. x1 is the infimum of a selection and x2 is the supremum.
 * @param {functions.Response} response a formality of a web handler
 * @return {Promise<functions.Response>} a promise that resolves to a response describing the result. Either data array or error message.
 */
exports.SubmitSelections = functions.https.onRequest((request, response) => {
  try {
    // get arguments
    const tuplist = request.body.tuplist;
    // make unique id
    const userId = uuidv4();
    // make database reference
    const db = admin.database();
    // push to database under users
    push(ref(db, 'users'), {
      userId: userId,
      tuplist: tuplist
    });
    // send response that's not an error message
    cors(request, response, () => {
      response.send(JSON.stringify({ userId: userId }));
    });
  } catch (error) {
    // send an error message
    console.error(error);
    cors(request, response, () => {
      response.status(500).send(`An error occurred: ${error.message}`);
    });
  }
});
