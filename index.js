require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const port = process.env.PORT;
const date = new Date();
const Person = require("./models/person");

app.use(express.static("build"));
app.use(cors());
app.use(express.json());
morgan.token("response", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :response"
  )
);
const errorHandler = (error, request, response, next) => {
  console.log("ERROR", error.name, ": ", error.message);

  if (error.name === "CastError") {
    console.log("id was not correctly defined");
    return response.status(400).send({ error: "malformatted id" });
  }

  if (error.name === "deleteError") {
    console.log("person already deleted");
    return response.status(409).send({ error: "person already deleted" });
  }

  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.get("/info", (req, res) => {
  Person.find({}).then((persons) => {
    console.log("retrieving data (all resources) from MongoDB:");
    console.log(persons.length);
    res.send(
      `<p>Phonebook has info for ${
        persons.length
      } people</p>${date.toTimeString()}<br></br>${date.toLocaleDateString()}`
    );
  });
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    console.log("retrieving data (all resources) from MongoDB:");
    console.log(persons);
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      console.log("retrieving data (single resource) from MongoDB:");

      if (person) {
        console.log(person);
        res.json(person);
      } else {
        console.log("no resource was found");
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  console.log("deleting resource");
  Person.findByIdAndRemove(req.params.id)
    .then((deletedPerson) => {
      if (deletedPerson) {
        console.log("deleted person:");
        console.log(deletedPerson);
        res.status(204).end();
      } else {
        try {
          const deleteError = new Error("Person already deleted");
          deleteError.name = "deleteError";
          throw deleteError;
        } catch (error) {
          next(error);
        }
      }
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
  console.log("Adding resource");
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

  // const names = persons.map((person) => person.name);
  // if (names.includes(req.body.name)) {
  //   return res.status(400).json({
  //     error: "Name must be unique.",
  //   });
  // }

  const person = new Person({
    name: req.body.name,
    number: req.body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      console.log("responding with saved person:");
      console.log(savedPerson);
      res.json(savedPerson);
    })
    .catch((error) => next(error));
});

// const generateId = () => {
//   return Math.floor(Math.random() * (100 + persons.length));
// };

app.put("/api/persons/:id", (req, res, next) => {
  const person = {
    name: req.body.name,
    number: req.body.number,
  };
  console.log("Updating resource");
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      if (updatedPerson) {
        res.json(updatedPerson);
      } else {
        try {
          const deleteError = new Error("Person already deleted");
          deleteError.name = "deleteError";
          throw deleteError;
        } catch (error) {
          next(error);
        }
      }
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
