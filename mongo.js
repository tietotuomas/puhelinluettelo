const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Give database's password as an argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://Bullo:${password}@cluster0.uj7im.mongodb.net/tietokantaKomentorivilta?retryWrites=true&w=majority`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const personSchema = new mongoose.Schema(
  {
    name: String,
    number: String,
  },
  { versionKey: false }
);

const Person = new mongoose.model("Person", personSchema);

if (process.argv.length < 5) {
  Person.find({}).then((result) => {
    console.log("phonebook:");
    result.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
} else {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  person.save().then((result) => {
    console.log("added", result.name, "number", result.number, "to phonebook");
    mongoose.connection.close();
  });
}
