const fs = require('fs');
const path = require('path');
const express = require('express');
const {notes} = require('./db/notes.json');

console.log(notes);

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

function createNewNote(body, notes) {
    const note = body;
    notes.push(note);
    fs.writeFileSync(
        path.join(__dirname, './db/notes.json'),
        JSON.stringify({ notes: notes }, null, 2)
    );
    return note;
}

function validateNote(note) {
    if (!note.title || typeof note.title !== 'string') {
        return false;
    }
    if (!note.text || typeof note.text !== 'string') {
        return false;
    }
    return true;
}

function findById(id, notes) {
    const result = notes.filter(note => note.id === id)[0];
    return result;
}

app.get('/api/notes', (req, res) => {
    res.json(notes);
});

app.post('/api/notes', (req, res) => {
    req.body.id = notes.length.toString();

    // if any data in req.body is inocorrect, send 400 error back
    if (!validateNote(req.body)) {
        res.status(400).send('The note is not properly formatted.');
    } else {
        const note = createNewNote(req.body, notes);
        res.json(note);
    } 
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.delete('/api/notes/:id', (req, res) => {
    const result = findById(req.params.id, notes);
    if (result) {
        notes.splice(req.params.id, 1);
        console.log(req.params.id);
        fs.writeFileSync(
            path.join(__dirname, './db/notes.json'),
            JSON.stringify({ notes: notes }, null, 2)
        );
    } else {
        res.send(404);
    }
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});