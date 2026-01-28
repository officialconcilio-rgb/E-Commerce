const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`${col.name}: ${count} documents`);
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
