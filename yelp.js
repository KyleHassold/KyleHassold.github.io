'use strict';

const yelp = require('yelp-fusion');
const config = require('./config');

const apiKey = config.YELP_API_KEY;


function searchYelp(searchRequest) {
    const client = yelp.client(apiKey);
    
    return client.search(searchRequest).then(response => {
        const firstResult = response.jsonBody.businesses[0];
        const prettyJson = JSON.stringify(firstResult, null, 4);
        console.log(prettyJson);
        for (let i = 1; i < response.jsonBody.businesses.length; i++) {
            const prettyJson = JSON.stringify(response.jsonBody.businesses[i], null, 4);
            console.log(prettyJson);
        }

        const restaurants = [];

        for (const result of response.jsonBody.businesses) {
            console.log(result.name);

            const categories = [];
            for (const category of result.categories) {
                categories.push(category.title);
            }

            restaurants.push({
                name: result.name,
                image_url: result.image_url,
                url: result.url,
                review_count: result.review_count,
                categories,
                rating: result.rating,
                transactions: result.transactions,
                price: result.price,
                location: `${result.location.address1}, ${result.location.city}`,
                distance: result.distance
            });
        }

        return Promise.resolve(restaurants);
    
    }).catch(e => {
        console.log(e);
    });
        
}

module.exports = {
    searchYelp
};