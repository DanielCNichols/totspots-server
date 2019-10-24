function makeVenuesArray() {
  return [
    {
      venue_name: 'Bull McCabes',
      city: 'Durham',
      state: 'NC',
      id: 1,
      address: '123 Main st.',
      zipcode: '27705',
      venue_type: 'Bar',
      url: 'thisisaurl',
      phone: 3333333333
    },
    {
      venue_name: 'Ponysaurus',
      city: 'Durham',
      state: 'NC',
      id: 2,
      address: '159 West chapel st.',
      zipcode: '27705',
      venue_type: 'Bar',
      url: 'thisisalsoaurl',
      phone: 7894561233
    }
  ];
}

function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: 'Daniel',
      last_name: 'Nichols',
      email: 'dcnichols@gmail.com',
      city: 'Durm',
      state: 'NC',
      username: 'dnick',
      password: 'thisisapassword'
    },

    {
      id: 2,
      first_name: 'Daniel',
      last_name: 'Nichols',
      email: 'dcnichols@gmail.com',
      city: 'Durm',
      state: 'NC',
      username: 'dnicszzz',
      password: 'thisisapassword'
    },
  ];
}

function makeFavorites() {
  return [
    {
      user_id: 1,
      venue_id: 2
    },
    {
      user_id: 1,
      venue_id: 2
    }
  ];
}

function makeAmenities() {
  return [
    {
      id: 1,
      amenity_name: 'changing table'
    },

    {
      id: 2,
      amenity_name: 'Stroller Accessible'
    }
  ];
}

function makeAmenVenues() {
  return [
    {
      amenity: 1,
      venue: 1
    },

    {
      amenity: 2,
      venue: 1
    }
  ];
}

function makeReviews() {
  return [
    {
      venue_id: 1,
      content: 'This is a test',
      price: 3,
      id: 1,
      volume: 4,
      starrating: 5,
      user_id: 1
    },
    {
      venue_id: 2,
      content: 'This is also a test',
      price: 2,
      volume: 3,
      id: 2,
      starrating: 4,
      user_id: 1
    }
  ];
}

function makeVotes() {
  return [
    {
      id: 1,
      user_id: 1,
      review_id: 1,
      votestatus: true
    },
    {
      id: 2,
      user_id: 1,
      review_id: 1,
      votestatus: true
    }
  ];
}

function expectedAmenities() {
  return [
    {
      venue_name: 'Bull McCabes',
      amenity_name: 'changing table'
    },
    {
      venue_name: 'Bull McCabes',
      amenity_name: 'Stroller Accessible'
    }
  ];
}

function expectedVenues() {
  return [
    {
      venue_name: 'Bull McCabes',
      city: 'Durham',
      state: 'NC',
      address: '123 Main st.',
      zipcode: '27705',
      venue_type: 'Bar',
      url: 'thisisaurl',
      phone: '3333333333',
      id: '1',
      avgPrice: '3.0000000000000000',
      avgRating: '5.0000000000000000',
      avgVolume: '4.0000000000000000'
    },
    {
      venue_name: 'Ponysaurus',
      city: 'Durham',
      state: 'NC',
      address: '159 West chapel st.',
      zipcode: '27705',
      venue_type: 'Bar',
      id: '2',
      url: 'thisisalsoaurl',
      phone: '7894561233',
      avgPrice: '2.0000000000000000',
      avgRating: '4.0000000000000000',
      avgVolume: '3.0000000000000000'
    }
  ];
}

function makeMaliciousVenue() {
  const maliciousVenue = {
    id: '123',
    venue_name: 'HACKIN IT UP <script>alert("xss")</script>',
    venue_type: 'Bar',
    city: 'Durham',
    state: 'NC',
    zipcode: '12345',
    address: 'thisisanaddress',
    url: 'thisisaurlll',
    phone: '7984651323'
  };

  const cleanedVenue = {
    ...maliciousVenue,
    venue_name: 'HACKIN IT UP &lt;script&gt;alert("xss")&lt;/script&gt;',
    avgPrice: null,
    avgRating: null,
    avgVolume: null
  };

  return {
    maliciousVenue,
    cleanedVenue
  };
}

function newVenue() {
  return {
    venue_name: 'qwert',
    city: 'qwer',
    state: 'qwer',
    address: 'qewr',
    zipcode: 27705,
    venue_type: 'Bar',
    url: 'tqewr',
    phone: '654964654',
    content: 'qwetrqe',
    price: 2,
    volume: 3,
    starrating: 3,
    amenities: [{ amenity: 1 }]
  };
}

function expectedReviews() {
  return [
    {
      id: 1,
      content: 'This is a test',
      price: 3,
      starrating: 5,
      volume: 4,
      date_created: new Date(),
      venue_id: 1,
      user_id: 1,
      first_name: 'Daniel',
      last_name: 'Nichols',
      count: '1'
    },
  ];
}

function expectedCount() {
  return [
    {
      count: "2"
    }
  ]
}


function expectedUserReviews() {
  return [
    {
      venue_id: 1,
      content: 'This is a test',
      price: 3,
      id: 1,
      volume: 4,
      starrating: 5,
      user_id: 1
    },
    {
      venue_id: 2,
      content: 'This is also a test',
      price: 2,
      volume: 3,
      id: 2,
      starrating: 4,
      user_id: 1
    }
  ];
}

module.exports = {
  makeVenuesArray,
  makeAmenities,
  makeAmenVenues,
  makeFavorites,
  makeReviews,
  makeUsersArray,
  makeVotes,
  expectedVenues,
  expectedAmenities,
  makeMaliciousVenue,
  expectedCount,
  expectedUserReviews,
  newVenue,
  expectedReviews
};
