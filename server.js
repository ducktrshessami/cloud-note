const express = require("express");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 5366;

var app = express();
var db = require("./db/db.json");

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
    response.status(200).json(db);
});

// Post a new note to db
app.post("/api/notes", (request, response) => {

});

// Delete a note from db
app.delete("/api/notes/:id", (request, response) => {

});

// Start server
app.listen(PORT, function() {
    console.log(`Listening on PORT ${PORT}`);
});
