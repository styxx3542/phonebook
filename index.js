const express = require("express");
const app = express();

const cors = require('cors');
require('dotenv').config()

const Person = require('./models/person')

const requestLogger = (req,re,next) => {
    console.log('Method: ',req.method)
    console.log('Path: ',req.path)
    console.log('Body: ',req.body)
    console.log('---')
    next()
}

const errorHandler = (err,req,res,next) => {
    console.error(err)
    if (err.name === 'CastError'){
        return res.status(400).send({error : 'malformatted id'})
    }
    else if(err.name === 'ValidationError'){
      return res.status(400).json({ error: err.message })
    }
    next(err)
}

const unknownEndpoint = (req,re) => {
    re.status(404).send({error: 'unknown endpoint'})
}

app.use(cors())
app.use(express.json());
app.use(requestLogger)
app.use(express.static('build'))

app.get('/api/persons',(req,res) => {
  Person.find({}).then(people => {
    res.json(people)
  })
})

app.get('/api/persons/:id',(req,res) => {
  Person.findById(req.params.id).then(person => {
    if(person)
    {
      res.json(person)
    }
    else{
      res.status(404).end()
    }
  })
  .catch(err => next(err))
})

app.delete('/api/persons/:id',(req,res,next) => {
  Person.findByIdAndRemove(req.params.id)
  .then(result => {
    res.status(204).end()
  })
  .catch(err => next(err)) 
})

app.post('/api/persons',(req,res,next) => {
  const body = req.body
  const person = new Person({
    name: body.name,
    phoneNumber: body.phoneNumber
  })
  if(!body.name)res.status(400).json({
    error: "Please enter a name"
  })
  else if(!body.phoneNumber)res.status(400).json({
    error: "Please enter a number"
  })
  else{
  person.save().then(savedNote => {
    res.json(savedNote)
  })
.catch(err => next(err))}
})

app.put('/api/persons/:id',(req,res,next) => {
  const body = req.body
  const person = {
    name: body.name,
    phoneNumber: body.phoneNumber,
  }
  Person.findByIdAndUpdate(req.params.id,person,{new: true,runValidators: true, contest: 'query'})
  .then(updatedPerson => {
    res.json(updatedPerson)
  })
  .catch(err => next(err))
})
app.use(unknownEndpoint)
app.use(errorHandler)
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})