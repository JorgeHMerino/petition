const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const db = require("./db");
const handlebars = require("express-handlebars");
const bcrypt = require("./bcrypt");

app.use(express.static("./public"));
app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(
    cookieSession({
        secret: `I'm always happy.`,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 2
    })
);

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

app.use(require("cookie-parser")());

//////////////////////////////////////////////////////////////////////////////
// PART 1 AND PART 2
// GET/PETITION

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main"
    });
});

// POST/PETITION

app.post("/petition", (req, res) => {
    db.addSigners(req.body.signature, req.session.id)
        .then(data => {
            req.session.signatureId = data.rows[0].id;
            res.redirect("/thankyou");
        })
        .catch(error => {
            console.log(error);
            res.render("petition", {
                layout: "main",
                error: "error"
            });
        });
});

// GET/THANKS

app.get("/thankyou", (req, res) => {
    Promise.all([
        db.countSigners(),
        db.canvasUrl(req.session.signatureId)
    ]).then(([num, img]) => {
        console.log("num: ", num);
        console.log("img: ", img);
        res.render("thankyou", {
            layout: "main",
            countSigners: num.rows[0].count,
            canvasUrl: img.rows[0].signature
        });
    });
});

// GET/SIGNERS

app.get("/signers", (req, res) => {
    return db.getAllSigners().then(data => {
        console.log("data: ", data);
        res.render("signers", {
            layout: "main",
            signerslist: data.rows
        });
    });
});
//////////////////////////////////////////////////////////////////////////////
// PART 3
// GET/REGISTER

app.get("/", (req, res) => {
    res.render("register", {
        layout: "main",
        login: "login"
    });
});

// POST/REGISTER

app.post("/register", (req, res) => {
    bcrypt.hashPassword(req.body.password).then(hashedP => {
        db.addSignersTwo(
            req.body.firstname,
            req.body.lastname,
            req.body.email,
            hashedP
        )
            .then(results => {
                req.session.id = results.rows[0].id;
                res.redirect("/profile");
            })
            .catch(error => {
                console.log("error: ", error);
                res.render("register", {
                    layout: "main",
                    errortwo: "error"
                });
            });
    });
});

// GET/LOGIN

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

// POST/LOGIN

app.post("/login", (req, res) => {
    return db.getEmail(req.body.email).then(correo => {
        console.log(correo);
        bcrypt
            .checkPassword(req.body.password, correo.rows[0].password)
            .then(yes => {
                console.log("true: ", yes);
                if (yes) {
                    req.session.id = correo.rows[0].id;
                    if (correo.rows[0].sigid) {
                        req.session.sigid = correo.rows[0].sigid;
                        res.redirect("/thankyou");
                    } else {
                        res.redirect("/petition");
                    }
                } else {
                    throw new Error();
                }
            })
            .catch(error => {
                console.log("error: ", error);
                res.render("login", {
                    layout: "main",
                    errorthree: "error"
                });
            });
    });
});

//////////////////////////////////////////////////////////////////////////////
//PART 4

// GET/PROFILE

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

// POST/PROFILE

app.post("/profile", (req, res) => {
    db.userProfiles(req.body.age, req.body.city, req.body.url, req.session.id)
        .then(data => {
            console.log(data);
            res.redirect("/petition");
        })
        .catch(error => {
            console.log(error);
            res.render("profile", {
                layout: "main",
                errorfour: "error"
            });
        });
});

// GET/SIGNERS/:CITY

app.get("/signers/:city", (req, res) => {
    return db.getAllSignersByCity(req.params.city).then(data => {
        console.log(data.rows);
        res.render("signers", {
            layout: "main",
            signerslist: data.rows
        });
    });
});

//////////////////////////////////////////////////////////////////////////////
//PART 5

app.get("/editprofile", (req, res) => {
    return db.toEditProfile(req.session.id).then(data => {
        console.log(data);
        res.render("editprofile", {
            layout: "main",
            populate: data.rows[0]
        });
    });
});

app.post("/delete", (req, res) => {
    return db.deleteSignature(req.session.id).then(data => {
        console.log(data);
        res.redirect("petition");
    });
});

app.post("/logout", (req, res) => {
    res.redirect("/");
});

//////////////////////////////////////////////////////////////////////////////
app.listen(process.env.PORT || 8080, () =>
    console.log("Petition listening, me escucha!!!")
);
