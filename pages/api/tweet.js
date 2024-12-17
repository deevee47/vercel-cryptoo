const axios = require("axios");
const { TwitterApi } = require("twitter-api-v2");
const admin = require("firebase-admin");

admin.initializeApp();
const dbRef = admin.firestore().doc("tokens/demo");

module.exports = async (req, res) => {
  const { refreshToken } = (await dbRef.get()).data();

  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await twitterClient.refreshOAuth2Token(refreshToken);

  await dbRef.set({ accessToken, refreshToken: newRefreshToken });

  const { btcPrice, ethPrice } = await fetchCryptoPrices();
  const { fearGreed, valueClassification } = await fetchingFearGreed();
  const volume = await fetch24Volume();
  const nextTweet = `
  CRYPTO NOW
      
  BTC: $${btcPrice.toLocaleString()}
  ETH: $${ethPrice.toLocaleString()}
  
  Fear & Greed Index: ${fearGreed}/100 (${valueClassification})

  24h Volume: ${volume}
  `;

  const { data } = await refreshedClient.v2.tweet(nextTweet);
  res.send(data);
};

// Add the fetch functions from your current code (fetchCryptoPrices, fetchingFearGreed, etc.)


const fetchCryptoPrices = async () => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin,ethereum",
          vs_currencies: "usd",
        },
      }
    );
    const { bitcoin, ethereum } = response.data;
    return {
      btcPrice: bitcoin.usd,
      ethPrice: ethereum.usd,
    };
  } catch (error) {
    console.error("Error fetching crypto prices:", error.message);
    throw new Error("Failed to fetch crypto prices");
  }
};

const fetchingFearGreed = async () => {
  try {
    const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v3/fear-and-greed/latest",
      {
        headers: {
          "X-CMC_PRO_API_KEY": "267b187e-0386-4cfa-8b11-6cfa5b9e137c",
        },
      }
    );

    const { value, value_classification } = response.data.data;
    console.log("Value:", { value, value_classification });

    return { fearGreed: value, valueClassification: value_classification };
  } catch (error) {
    console.error("Error fetching Fear and Greed data:", error.message);
    return { fearGreed: "N/A", valueClassification: "N/A" }; // Fallback values
  }
};

const fetch24Volume = async () => {
  try {
    const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest",
      {
        headers: {
          "X-CMC_PRO_API_KEY": "267b187e-0386-4cfa-8b11-6cfa5b9e137c",
        },
      }
    );

    const mainData = response.data.data.quote.USD.total_volume_24h;

    // Convert to billions and format with 2 decimal places
    const volumeInBillions = (mainData / 1_000_000_000).toFixed(2);

    return `$${volumeInBillions}B`; // Example: "2.50 Billion"
  } catch (error) {
    console.error("Error fetching 24H Volume:", error.message);
    return "N/A"; // Fallback values
  }
};
 
 
// const fetchLiquidation = async () => {
//   const res = await axios.get(
//     "https://api.cryptometer.io/liquidation-data/?api_key=95jrv1F6qXAx1olaFg89DnmOI2pa0enD769hsQf9"
//   );
//   console.log(res.data.data)
// }
