const express = require("express");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 5366;
const dbPath = path.resolve(__dirname, "db", "db.json");

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Pages
app.get("/", (request, response) => {
    response.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/notes", (request, response) => {
    response.status(200).sendFile(path.join(__dirname, "public", "notes.html"));
});

// Assets
app.get("/assets/:dir/:file", (request, response) => {
    let file = path.join(__dirname, "public", "assets", request.params.dir, request.params.file);
    if (fs.existsSync(file)) {
        response.status(200).sendFile(file);
    }
    else {
        response.status(404).end();
    }
});

// API

// Get all notes from db
app.get("/api/notes", (request, response) => {
    response.status(200).sendFile(dbPath);
});

// Post a new note to db
app.post("/api/notes", (request, response) => {
    let db = require(dbPath);
    db.push(new Note(request.body.title, request.body.text));
    updateDb(db)
        .then(() => {
            response.status(200).end();
        })
        .catch(error => {
            console.error(error);
            response.status(500).end();
        });
});

// Delete a note from db
app.delete("/api/notes/:id", (request, response) => {
    let db = require(dbPath);
    let i = db.findIndex(note => note.id === request.params.id);
    if (i !== -1) {
        db.splice(i, 1);
        updateDb(db)
            .then(() => {
                response.status(200).end();
            })
            .catch(error => {
                console.error(error);
                response.status(500).end();
            });
    }
    else {
        response.status(400).end();
    }
});

// Start server
app.listen(PORT, function() {
    console.log(`Listening on PORT ${PORT}`);
});

// Utils

// Update the database file
function updateDb(db) {
    return fs.promises.writeFile(dbPath, JSON.stringify(db));
}

// Note object
function Note(title, text) {
    this.title = title;
    this.text = text;
    this.id = UID(16, title + text);
}

// Generate a unique ID
function UID(length, salt) {
    const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    let output = "";
    length = Math.max(0, Math.floor(length));
    for (let i = 0; i < length; i++) {
        let index = randomIndex(charset);
        if (salt) {
            index = (index + randomIndex(salt)) % charset.length;
        }
        output += charset[index];
    }
    return output;
}

// Get a random index from an iterable with a length
function randomIndex(iterable) {
    if (iterable.length) {
        return Math.floor(Math.random() * iterable.length);
    }
}
