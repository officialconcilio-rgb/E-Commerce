const mongoose = require('mongoose');
const Category = require('../src/models/Category');
require('dotenv').config();

const categories = [
    {
        name: 'Divine Idols',
        slug: 'divine-idols',
        image: 'https://images.unsplash.com/photo-1544120300-30f14897f379',
        // Fallback to a known working generic idol/spiritual image if this fails, but removing params first
        // Actually, 1544120300-30f14897f379 gave 404. Let's use a definite working texture/one.
        image: 'https://images.unsplash.com/photo-1628103144888-c7aefe8556cc', // Ganesha Statue (Working)
        description: 'Spiritual Grace'
    },
    {
        name: 'Traditional Gifts',
        slug: 'traditional',
        image: 'https://images.unsplash.com/photo-1574354245973-2e22c954546b', // Diya/Lamp (Working)
        description: 'Cultural Heritage'
    },
    {
        name: 'Festive Decor',
        slug: 'festive',
        image: 'https://images.unsplash.com/photo-1513205166258-204b611e92d6', // Lights (Working)
        description: 'Celebratory Charm'
    },
    {
        name: 'Home Decor',
        slug: 'home-decor',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', // Interior (Keep same but no params)
        description: 'Elegant Living'
    },
    {
        name: 'Corporate Gifts',
        slug: 'corporate',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48', // Gift (Keep same but no params)
        description: 'Professional Grace'
    }
];

const updateCategories = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // Using the confirmed Atlas URI from root .env
        const uri = 'mongodb://agarwalansh154_db_user:Ansh1234@ac-3rk2lak-shard-00-00.j1nqhec.mongodb.net:27017,ac-3rk2lak-shard-00-01.j1nqhec.mongodb.net:27017,ac-3rk2lak-shard-00-02.j1nqhec.mongodb.net:27017/ecommerce?ssl=true&replicaSet=atlas-66p41u-shard-0&authSource=admin&retryWrites=true&w=majority';
        await mongoose.connect(uri);
        console.log('Connected.');

        for (const cat of categories) {
            console.log(`Updating ${cat.name}...`);
            const result = await Category.updateOne(
                { slug: cat.slug },
                {
                    $set: {
                        image: cat.image,
                        description: cat.description,
                        name: cat.name // update name too just in case
                    },
                    $setOnInsert: { isActive: true } // ensure active if created (upsert option below)
                },
                { upsert: true } // Create if doesn't exist
            );
            console.log(`Result for ${cat.name}:`, result);
        }

        console.log('All categories updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating categories:', error);
        process.exit(1);
    }
};

updateCategories();
