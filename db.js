var spicedPg = require("spiced-pg");

var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:jorgehuertamerino:password@localhost:5432/plastic"
);

module.exports.addSigners = function addSigners(signature, user_id) {
    if (signature == 1) {
        signature = null;
    }
    console.log("signature: ", signature);
    return db.query(
        "INSERT INTO signaturesTable (signature, user_id) VALUES ($1, $2) returning id",
        [signature || null, user_id || null]
    );
};

module.exports.getAllSigners = function getAllSigners() {
    return db.query(
        `SELECT firstname, lastname, age, city, url, signaturesTable.id
        FROM signaturesTable
        LEFT JOIN usersTable
        ON usersTable.id = signaturesTable.user_id
        LEFT JOIN userprofilesTable
        ON userprofilesTable.user_id = signaturesTable.user_id`
    );
};

module.exports.countSigners = function countSigners() {
    return db.query("SELECT COUNT (*) FROM signaturesTable");
};

module.exports.canvasUrl = function canvasUrl(id) {
    return db.query("SELECT signature FROM signaturesTable WHERE id=$1", [id]);
};

module.exports.addSignersTwo = function addSignersTwo(
    firstname,
    lastname,
    email,
    password
) {
    return db.query(
        `INSERT INTO usersTable (firstname, lastname, email, password)
VALUES ($1, $2, $3, $4) returning id`,
        [firstname || null, lastname || null, email || null, password || null]
    );
};

module.exports.getEmail = function getEmail(email) {
    return db.query(
        `SELECT firstname, lastname, password, usersTable.id, signaturesTable.id AS sigID
        FROM usersTable LEFT JOIN signaturesTable ON usersTable.id = signaturesTable.user_id WHERE email=$1`,
        [email]
    );
};

module.exports.userProfiles = function userProfiles(age, city, url, user_id) {
    return db.query(
        "INSERT INTO userprofilesTable (age, city, url, user_id) VALUES ($1, $2, $3, $4) returning id",
        [age, city, url, user_id]
    );
};

module.exports.getAllSignersByCity = function getAllSignersByCity(city) {
    return db.query(
        `SELECT usersTable.firstname, usersTable.lastname, userprofilesTable.age, userprofilesTable.city
        FROM userprofilesTable
        LEFT JOIN usersTable
        ON usersTable.id = userprofilesTable.user_id
        WHERE city=$1`,
        [city]
    );
};

module.exports.toEditProfile = function toEditProfile(id) {
    return db.query(
        `SELECT usersTable.firstname, usersTable.lastname, usersTable.email, userprofilesTable.age, userprofilesTable.city, userprofilesTable.url
        FROM usersTable
        LEFT JOIN userprofilesTable
        ON usersTable.id = userprofilesTable.user_id
        WHERE usersTable.id = $1`,
        [id]
    );
};

module.exports.deleteSignature = function deleteSignature(signature) {
    return db.query(`DELETE FROM signaturesTable WHERE user_id=$1`, [
        signature
    ]);
};
