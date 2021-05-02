const Express = require("Express");
const morgan = require("morgan");
const cors = require("cors")
const app = Express();
const port = 3001;
const date = new Date();

app.use(cors())
app.use(Express.json());
morgan.token("response", (req, res) => JSON.stringify(req.body))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :response"))

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  res.send(
    `<p>Phonebook has info for ${
      persons.length
    } people</p>${date.toTimeString()}`
  );
});

app.get("/api/persons/:id", (req, res) => {
  console.log("yksittäistä resurssia etsimässä");
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  console.log("resurssia poistamssa");
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  console.log("Resurssia lisäämässä");
  if (!req.body.name && !req.body.number) {
    return res.status(400).json({
      error: "Body missing required information: name and number.",
    });
  }

  if (!req.body.name) {
    return res.status(400).json({
      error: "Body missing required information: name.",
    });
  }

  if (!req.body.number) {
    return res.status(400).json({
      error: "Body missing required information: number.",
    });
  }

  const names = persons.map((person) => person.name);
  if (names.includes(req.body.name)) {
    return res.status(400).json({
      error: "Name must be unique.",
    });
  }

  const ids = persons.map((person) => person.id);
  let id = generateId();
  while (ids.includes(id)) {
    console.log("Arvotaan uusi id");
    id = generateId();
  }
  const person = { name: req.body.name, number: req.body.number, id: id };
  console.log(person);
  persons = persons.concat(person);
  res.json(person);
});

const generateId = () => {
  return Math.floor(Math.random() * (100 + persons.length));
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)



app.listen(port);
console.log(`Server running on port ${port}`);
