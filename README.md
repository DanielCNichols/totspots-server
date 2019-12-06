#### Links

Live app: https://totspots.now.sh/

Client repo: https://github.com/DanielCNichols/totspots-app


# Totspots API

Hi! My name is Daniel. Thank you for dropping by the Totspots repo.


Totspots is a trip-planning and reviews application built with the needs of parents in mind. The goal of this project is to provide parents of small children with need-to-know information about venues and events in their town, answering questions such as:

- "Can I get a stroller in there?"
- "Do they have changing tables?"
- "If my child has a meltdown, how long will it take us to get the check?"

The app functions based on user-submitted reviews and suggestions for establishments in their town. All reviews are public and can be upvoted by other users. The venue/event's overall ratings are based on the average of these collected reviews. Other features include the ability for users to save their favorite venues to their account as well as viewing and updating their previous reviews.

## Using the API

At present, this app features venues and events from Durham, NC (a lovely city full of great places to be). Note that at present, all seed information is crowdsourced from volunteers in the community.

## Organization

The Totspots Api makes use of the following endpoints, and generates the following responses: 

#### api/users

  GET: /api/users/account- retrieves the users account information
  <pre><code>
{
    "username": "nkuser",
    "first_name": "Nevil",
    "last_name": "Kirsop",
    "city": Durham,
    "state": NC,
    "email": "nkirsop1@goodreads.com"
}
</pre></code>

  /api/users/favorites- Accesses the user's saved venues
  GET: 
  <pre><code>
[
    {
        "venue_name": "Bull McCabes",
        "city": "durham",
        "state": "nc",
        "address": "123 Main St.",
        "zipcode": "25874",
        "venue_type": "bar",
        "id": 46,
        "url": "http://www.website.com",
        "phone": "4564564566"
    }
]
</pre></code>

  POST: Adds favorite
  <pre><code>
    {
        "venue_name": "Bull McCabes",
        "city": "durham",
        "state": "nc",
        "address": "123 Main St.",
        "zipcode": "25874",
        "venue_type": "bar",
        "id": 46,
        "url": "http://www.reddit.com",
        "phone": "4564564566"
    }
    </pre></code>

  DELETE: Responds with 204

#### api/venues

api/venues/profile/:venueId: Returns aggregate information about a venue for use in the venue's profile page. 

GET: 
<pre><code>
{
    "venue_name": "Bull McCabes",
    "city": "Durham",
    "state": "NC",
    "address": "123 Main st.",
    "zipcode": "27705",
    "phone": "9196283061",
    "url": "http://www.bullmccabesirishpub.com",
    "venue_type": "Bar",
    "id": 1,
    "avgPrice": "2.2000000000000000",
    "avgRating": "2.4000000000000000",
    "avgVolume": "3.6000000000000000"
}
</pre></code>

api/venues/:city/:state/:type- Returns a listing of venues based on city, state, and type provided by the user. 

<pre><code>
[
    {
        "id": "1",
        "venue_name": "Bull McCabes",
        "venue_type": "Bar",
        "address": "123 Main st.",
        "city": "Durham",
        "state": "NC",
        "zipcode": "27705",
        "phone": "9196283061",
        "url": "http://www.bullmccabesirishpub.com",
        "avgRating": "2.4000000000000000",
        "avgPrice": "2.2000000000000000",
        "avgVolume": "3.6000000000000000"
    },
    {
        "id": "6",
        "venue_name": "Ponysaurus",
        "venue_type": "Bar",
        "address": "159 West chapel st.",
        "city": "Durham",
        "state": "NC",
        "zipcode": "27705",
        "phone": "8843697669",
        "url": "http://ponysaurusbrewing.com/",
        "avgRating": "4.0000000000000000",
        "avgPrice": "3.0000000000000000",
        "avgVolume": "4.5000000000000000"
    }
  ]
  </pre></code>

/api/venues/:venueId/amenities- Returns a listing of amenities by venue

<pre><code>
[
    {
        "venue_name": "Bull McCabes",
        "amenity_name": "Changing Table"
    },
    {
        "venue_name": "Bull McCabes",
        "amenity_name": "Outdoor Seating Available"
    },
    {
        "venue_name": "Bull McCabes",
        "amenity_name": "Fast Checkout"
    },
]
</pre></code>


/api/venues/addVenue 

POST: 

<pre><code>

{
  "id": "128,
  "venue_name": "Clouds",
  "venue_type": "bar",
  "address": "911 N. Gregson St.",
  "city": "durham nc",
  "state": "nc",
  "zipcode": "27701",
  "url": "http://www.reddit.com",
  "Phone": "9191234567"
}

</pre></code>

#### /api/reviews

/api/reviews/venues/:venueId- returns all reviews for a specific venue

GET:
<pre><code>
[
    {
        "id": 8,
        "content": "Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla. Sed vel enim sit amet nunc viverra dapibus. Nulla suscipit ligula in lacus. Curabitur at ipsum ac tellus semper interdum. Mauris ullamcorper purus sit amet nulla. Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
        "price": 2,
        "starrating": 4,
        "volume": 5,
        "date_created": "2019-10-18T19:59:22.209Z",
        "venue_id": 1,
        "user_id": 9,
        "first_name": "Fanni",
        "last_name": "Gerriessen",
        "count": "6"
    },
    {
        "id": 15,
        "content": "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque. Duis bibendum. Morbi non quam nec dui luctus rutrum.",
        "price": 2,
        "starrating": 3,
        "volume": 5,
        "date_created": "2019-10-18T19:59:22.217Z",
        "venue_id": 1,
        "user_id": 4,
        "first_name": "Aline",
        "last_name": "Spedding",
        "count": "4"
    }
]
</pre></code>

api/reviews/:reviewId/Votes
GET: returns a vote count for a specific review

<pre><code>
[
    {
        "count": "2"
    }
]
</pre></code>

POST: Posts vote, and returns an object with vote information

<pre><code>
{
    "id": 100,
    "user_id": 2,
    "review_id": 15,
    "votestatus": true
}
</pre></code>

/api/reviews/userReviews: access all reviews for a specific user

GET: 

<pre><code>
[
    {
        "id": 140,
        "content": "We love this place!!",
        "price": 5,
        "starrating": 2,
        "volume": 5,
        "date_created": "2019-11-12T09:09:00.680Z",
        "venue_id": 80,
        "venue_name": "test"
    },
    {
        "id": 133,
        "content": "We don't like this place at all!",
        "price": 1,
        "starrating": 5,
        "volume": 3,
        "date_created": "2019-11-10T19:44:04.108Z",
        "venue_id": 52,
        "venue_name": "Ponysaurus"
    }
  ]
  </pre></code>

  api/reviews/:venueId

  POST: Post review for a specific venue and returns that review

  <pre><code>
  {
      id: newReview.id,
      venue_id: newReview.venue_id,
      content: xss(newReview.content),
      price: xss(newReview.price),
      volume: xss(newReview.volume),
      starrating: xss(newReview.starrating),
      user_id: xss(newReview.user_id)
    }
    </pre></code>

  api/reviews/users/venues/:reviewId

  GET: Returns a single user review 

  <pre><code>
{
    "id": 3,
    "venue_id": 5,
    "content": "Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros. Vestibulum ac est lacinia nisi venenatis tristique.",
    "price": 1,
    "volume": 5,
    "starrating": 3,
    "user_id": 7,
    "date_created": "2019-10-18T19:59:22.166Z"
}
</pre></code>


Delete: Deletes the review and responds with 204

PATCH: Updates the review and responds with 204


## Technology Used

-Node.js
-Express
-PostgreSQL


### Special Thanks

Special thanks to the Black and Breeze families for their work in gathering venue information for this application.
Thanks to the entire Thinkful team and my mentor for your words of encouragement and guidance. 

Thank you for your interest in this project. I hope you enjoy using this app as much as I enjoyed making it!


## Getting Started 

###Local dev setup

If using user daniel

   mv example.env .env
	 createdb -U daniel totspots
   createdb -U daniel totspots-test

If you are using a password or different user, be sure to update in the .env file. 

   npm install 
	 npm run migrate
	 env MIGRATION_DB_NAME=totspots-test npm run migrate

npm test should work at this point. 

###Scripts

To start the application: npm start

Start nodemon for development: npm run dev

Run tests: npm test

Run migrate up: npm run migrate

Run migrate down: npm run migrate --0






