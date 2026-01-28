require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const axios = require('axios');

async function getSample() {
    try {
        const res = await axios.get('http://localhost:5000/api/products?limit=1');
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}
getSample();
