const { TwitterApi } = require("twitter-api-v2");
const admin = require("firebase-admin");

admin.initializeApp();
const dbRef = admin.firestore().doc("tokens/demo");

const callbackURL =
  "http://127.0.0.1:5000/firestore-crypto/us-central1/callback";

module.exports = async (req, res) => {
  const { state, code } = req.query;

  const dbSnapshot = await dbRef.get();
  const { codeVerifier, state: storedState } = dbSnapshot.data();

  if (state !== storedState) {
    return res.status(400).send("Stored tokens do not match!");
  }

  const {
    client: loggedClient,
    accessToken,
    refreshToken,
  } = await twitterClient.loginWithOAuth2({
    code,
    codeVerifier,
    redirectUri: callbackURL,
  });

  await dbRef.set({ accessToken, refreshToken });
  const { data } = await loggedClient.v2.me();

  res.send(data);
};
