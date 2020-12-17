const express = require("express");
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");

const dbDir = path.resolve(__dirname, "db");
const dbPath = path.join(dbDir, "db.json");

const PORT = process.env.PORT || 5366;

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
if (initDb()) {
    app.listen(PORT, function() {
        console.log(`Listening on PORT ${PORT}`);
    });
}

// Utils

// Initialize/verify the existence of the database
function initDb() {
    try {
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir);
        }
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, "[]");
        }
        return true;
    }
    catch {
        return false;
    }
}

// Update the database file
function updateDb(db) {
    return fs.promises.writeFile(dbPath, JSON.stringify(db));
}

// Note object
function Note(title, text) {
    this.title = title;
    this.text = text;
    this.id = uuid.v4();
}
