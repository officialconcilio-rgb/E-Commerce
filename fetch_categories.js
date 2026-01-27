const axios = require('axios');

async function fetchCategories() {
    try {
        const response = await axios.get('http://localhost:5000/api/products/categories');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error fetching categories:', error.message);
    }
}

fetchCategories();
