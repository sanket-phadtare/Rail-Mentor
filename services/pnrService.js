const axios = require("axios");

async function fetchPNR(pnr) {

    const response = await axios.get(
        `https://api.irctc.dev/api/v1/pnr/${pnr}`,
        {
            headers: {
                "x-api-key": process.env.IRCTC_API_KEY
            }
        }
    );

    return response.data;
}

module.exports = {
    fetchPNR
};