const tags = require('./tags');

const coffee = {
  1: {
    id: 1,
    shop: 'Billz Coffee',
    name: 'Rocking Water',
    description: 'Soft, with hints of chocolate and cashews',
    prices: {
      large: 3.99,
      medium: 2.99,
      small: 1.99,
    },
    tags: [tags.LIGHT, tags.CHOCOLATE, tags.NUTTY],
  },
  2: {
    id: 2,
    shop: 'Billz Coffee',
    name: 'Cosmos',
    description: 'Complex, with cocoa and cherry notes',
    prices: {
      large: 4.5,
      medium: 3.5,
      small: 2.5,
    },
    tags: [tags.DARK, tags.CHOCOLATE, tags.FRUITY],
  },
  3: {
    id: 3,
    shop: 'Billz Coffee',
    name: 'Old Manhattan',
    description: 'Vibrant, with citrus and tropical notes',
    prices: {
      large: 3.5,
      medium: 2.5,
      small: 1.5,
    },
    tags: [tags.LIGHT, tags.FRUITY],
  },
  4: {
    id: 4,
    shop: 'Green Bottle Coffee',
    name: 'Hayes Valley',
    description: 'Lower-toned and minimally bright',
    prices: {
      large: 4.0,
      medium: 3.0,
      small: 2.0,
    },
    tags: [tags.DARK, tags.ESPRESSO, tags.CHOCOLATE],
  },
  5: {
    id: 5,
    shop: 'Green Bottle Coffee',
    name: 'Affogato',
    description: 'Espresso over ici ice cream',
    prices: {
      medium: 5.5,
    },
    tags: [tags.DARK, tags.ESPRESSO, tags.ICE_CREAM],
  },
  6: {
    id: 6,
    shop: 'Green Bottle Coffee',
    name: 'Hot Chocolate',
    description: 'Rich Chocolate flavor without the caffeine',
    prices: {
      large: 3.99,
      medium: 2.99,
      small: 1.99,
    },
    tags: [tags.CHOCOLATE, tags.DECAF],
  },
  7: {
    id: 7,
    shop: "Peeter's Coffee",
    name: 'Café Domingo®',
    description: 'Toast, Toffee, Nougat',
    prices: {
      large: 3.99,
      medium: 2.99,
      small: 1.99,
    },
    tags: [tags.MEDIUM],
  },
  8: {
    id: 8,
    shop: "Peeter's Coffee",
    name: 'Baridi Blend',
    description: 'White Flower, Seville Orange, Toffee',
    prices: {
      large: 3.99,
      medium: 2.99,
      small: 1.99,
    },
    tags: [tags.MEDIUM, tags.FRUITY],
  },
  9: {
    id: 9,
    shop: "Peeter's Coffee",
    name: 'Luminosa Breakfast Blend',
    description: 'Passionflower, Stone Fruit, Cacao',
    prices: {
      large: 3.99,
      medium: 2.99,
      small: 1.99,
    },
    tags: [tags.LIGHT, tags.FRUITY, tags.CHOCOLATE],
  },
  10: {
    id: 10,
    shop: 'Dutch Sisters',
    name: 'Annihilator',
    description: 'Chocolate macadamia nut breve',
    prices: {
      large: 3.99,
      medium: 2.99,
      small: 1.99,
    },
    tags: [tags.ESPRESSO, tags.NUTTY],
  },
  11: {
    id: 11,
    shop: 'Dutch Sisters',
    name: 'Kicker®',
    description: 'Irish cream breve',
    prices: {
      large: 3.99,
      medium: 2.99,
      small: 1.99,
    },
    tags: [tags.ESPRESSO],
  },
  12: {
    id: 12,
    shop: 'Dutch Sisters',
    name: 'Double Torture',
    description: 'Extra double shot vanilla mocha',
    prices: {
      large: 3.99,
      medium: 2.99,
      small: 1.99,
    },
    tags: [tags.ESPRESSO, tags.VANILLA],
  },
  13: {
    id: 13,
    shop: 'Moondollars',
    name: 'Espresso',
    description: 'Espresso Roast with rich flavor and caramelly sweetness',
    prices: {
      large: 3.99,
      medium: 2.99,
      small: 1.99,
    },
    tags: [tags.ESPRESSO],
  },
  14: {
    id: 14,
    shop: 'Moondollars',
    name: 'Decaf Pike Place® Roast',
    description: 'From our first store in Seattle’s Pike Place Market',
    prices: {
      large: 3.99,
      medium: 2.99,
      small: 1.99,
    },
    tags: [tags.MEDIUM, tags.CHOCOLATE, tags.NUTTY, tags.DECAF],
  },
  15: {
    id: 15,
    shop: 'Moondollars',
    name: 'Caffè Americano',
    description: 'Espresso shots topped with hot water',
    prices: {
      large: 3.99,
      medium: 2.99,
      small: 1.99,
    },
    tags: [tags.ESPRESSO],
  },
};

module.exports = coffee;
