import { TwitterApi } from "twitter-api-v2";
import admin from "firebase-admin";

// Initialize Firestore Admin SDK
const dbRef = admin.firestore().doc("tokens/demo");

const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

const callbackURL = process.env.CALLBACK_URL;

export default async function handler(req, res) {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callbackURL,
    { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] }
  );

  // Store verifier in Firestore
  await dbRef.set({ codeVerifier, state });

  return res.redirect(url);
}
