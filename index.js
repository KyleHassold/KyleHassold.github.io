const yelp = require('./yelp');

const searchRequest = {
    latitude: 37.786882,
    longitude: -122.399972,
    radius: 8046,
    categories: 'bars,french,italian,japanese,korean,mexican,seafood,vegetarian,vegan',
    limit: 20,
    sort_by: 'rating',
    price: '1,2,3,4',
    open_now: true,
};

yelp.searchYelp(searchRequest).then(restaurants => {
    console.log(restaurants);
});