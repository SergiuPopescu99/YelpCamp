
const Campground = require('../models/campground')
const mongoose = require('mongoose')
const cities = require('./cities')
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true })
const { places, descriptors } = require('./seedHelpers')
const { modelName } = require('../models/campground')
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once("open", () => {
    console.log("MONGO CONNECTION OPEN!")
});
const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {


    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "63c6a2ca5a47e7a76c742462",
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque fugit laboriosam minus dolore pariatur sit consequuntur veritatis quisquam hic, eligendi nisi accusamus ut quaerat, nesciunt similique dolorem veniam. Quaerat, magni!',
            price: price,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dzma1n5wq/image/upload/v1674143432/YelpCamp/hp0exiylhu7pecwn5ldt.png',
                    filename: 'YelpCamp/hp0exiylhu7pecwn5ldt',

                },
                {
                    url: 'https://res.cloudinary.com/dzma1n5wq/image/upload/v1674143432/YelpCamp/wqvsi3u1rzbvax8m3s32.png',
                    filename: 'YelpCamp/wqvsi3u1rzbvax8m3s32',

                }
            ]
        })
        await camp.save()
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})