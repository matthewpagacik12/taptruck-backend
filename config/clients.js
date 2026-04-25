const CLIENTS = {
  taptruckct: {
    name: 'Tap Truck CT',
    emailUser: process.env.TAPTRUCK_EMAIL_USER,
    emailPass: process.env.TAPTRUCK_EMAIL_PASS,
    businessEmail: 'taptruckct@gmail.com',
    logo: 'https://taptruckct.com/wp-content/uploads/2024/06/Chris_tap_truck_logo-2.png',
    phone: '(203) 772-8382',
    packages: [
      { label: 'House Package Drinks', value: 'house', price: 12 },
      { label: 'Custom Package', value: 'custom', price: 17 },
      { label: 'Super Custom Package', value: 'super', price: 25 },
    ],
    rates: {
      bartending: 300,
      bartendingLabel: 'Full Service (3 Hour Minimum)',
      mileage: 2,
      freeMiles: 30,
      truckRental: 0,
    },
  },
  taptruckhudsonvalley: {
    name: 'Tap Truck Hudson Valley',
    emailUser: process.env.HUDSONVALLEY_EMAIL_USER,
    emailPass: process.env.HUDSONVALLEY_EMAIL_PASS,
    businessEmail: 'mattpags12+34@gmail.com', // Update business email for Tap Truck Hudson Valley before deployment
    logo: 'https://taptruck-quote-site.netlify.app/hudsonvalley/taptruckhudsonvalley.png',
    phone: '',
    packages: [
      { label: 'The Walkway Over The Hudson', value: 'walkway', price: 12 },
      { label: "Bannerman's Island", value: 'bannermans', price: 16 },
      { label: 'The 845', value: 'the845', price: 20 },
    ],
    rates: {
      bartending: 25,
      bartendingLabel: 'Bartending Service',
      mileage: 3,
      freeMiles: 0,
      truckRental: 100,
    },
  },
};

module.exports = CLIENTS;