const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { TwitterApi } = require("twitter-api-v2");

admin.initializeApp();
const dbRef = admin.firestore().doc("tokens/demo");

const twitterClient = new TwitterApi({
  clientId: "MGU5N1JnNGFQWHhKVjNEREZucU06MTpjaQ",
  clientSecret: "8Tkqj-L9Y3Ot_ePDz_yOI__EY7FaE5x7FbtvZlL6kdQByeu6HA",
});

const callbackURL =
  "http://127.0.0.1:5000/firestore-crypto/us-central1/callback";

module.exports = async (req, res) => {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callbackURL,
    { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] }
  );

  // Store verifier in Firestore
  await dbRef.set({ codeVerifier, state });
  res.redirect(url);
};
