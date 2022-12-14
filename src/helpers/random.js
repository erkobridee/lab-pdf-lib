const getRandomFloat = (min, max) => Math.random() * (max - min + 1) + min;

const getRandomDecimal = (min, max, fixed = 2) =>
  +getRandomFloat(min, max).toFixed(fixed);

const getRandomInt = (min, max) => Math.floor(getRandomFloat(min, max));

const getRandomBoolean = () => getRandomInt(0, 1) === 0;

/**
 * from a given array get a random item from it
 *
 * @param {Array} items
 * @param {number} inNumber
 *
 * returm item
 */
const getRandomItem = (items, inNumber = items.length) =>
  items[Math.floor(Math.random() * inNumber)];

//----------------------------------------------------------------------------//

const names = [
  "Rolando Morales",
  "Forest Cherry",
  "Mack Cline",
  "Cornelius Anthony",
  "Omar Anderson",
  "Rick Gates",
  "Cecil Taylor",
  "Terrance Myers",
  "Xavier Dunlap",
  "Augustine Ruiz",
  "Lon Rich",
  "Jacob Hart",
  "Bobbie Murphy",
  "Carlo Kramer",
  "Herbert Tucker",
  "Salvador Flynn",
  "Amado Hancock",
  "Raymundo Giles",
  "Roberto Duran",
  "Pat Hayes",
  "Robt Ashley",
  "Eduardo Chan",
  "Pat Mckay",
  "Randolph Durham",
  "Julio Mcgrath",
  "Harold Bartlett",
  "Les Terry",
  "Sung Johns",
  "Bob Gordon",
  "Wesley Hickman",
  "Dorian Watson",
  "Kim Donovan",
  "Ignacio Morris",
  "Efrain Grimes",
  "Marlin Chambers",
  "Lance Gallagher",
  "Dan Vang",
  "Ulysses Duncan",
  "Reid Pennington",
  "Eldon Chang",
  "Carlo Hamilton",
  "Foster Frank",
  "Collin Mcgrath",
  "Brad Orr",
  "Leo Burnett",
  "Lazaro Reeves",
  "Sam Crawford",
  "Kendrick Mason",
  "Prince Meadows",
  "Rudolph Macias",
  "Carmen Boone",
  "Lakisha Vang",
  "Lora Todd",
  "Tracey Berry",
  "Ofelia Jackson",
  "Estelle Pena",
  "Pam Strong",
  "Katharine Kaiser",
  "Naomi Harris",
  "Essie Lowery",
  "Frieda Mccann",
  "Melissa Maldonado",
  "Kelsey Farmer",
  "Claudia Roth",
  "Staci Gray",
  "Bridgette Fitzpatrick",
  "Diane Cummings",
  "Freda Gregory",
  "Marylou Gates",
  "Evangeline Calderon",
  "Lacy Soto",
  "Ebony Berger",
  "Ginger Hobbs",
  "Ruthie Palmer",
  "Shelly Hurley",
  "Lynette Santos",
  "Freda Harrison",
  "Alyce Quinn",
  "Stefanie Jordan",
  "Tamara Cobb",
  "Erin Romero",
  "Fanny Turner",
  "Corinne Marquez",
  "Shawna Cooley",
  "Candice Lewis",
  "Rena Jones",
  "Della Berg",
  "Jeanie Ward",
  "Fanny Ortega",
  "Penelope Mcintosh",
  "Virginia Miller",
  "Myra Ayers",
  "Aileen Freeman",
  "Matilda Vang",
  "Cora Santana",
  "Josephine Berger",
  "Darlene Conway",
  "Alfreda Bowers",
  "Fanny Navarro",
  "Linda Sloan",
];

const getRandomName = (size) => {
  if (!size) {
    size = getRandomInt(1, 4);
  }
  const namesLenght = names.length;
  const nameArray = [];
  for (let i = 0; i < size; i++) {
    nameArray.push(getRandomItem(names, namesLenght));
  }
  return nameArray.join(" ");
};

module.exports = {
  getRandomFloat,
  getRandomDecimal,
  getRandomInt,
  getRandomBoolean,
  getRandomItem,

  names,
  getRandomName,
};
