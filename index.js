const path = require("path");
const express = require("express");
const https = require("https");
const fs = require("fs");
const helmet = require("helmet");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

require("dotenv").config();

const PORT = 3000;

const googleAuthConfig = {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}

function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log("Google profile", profile);
    done(null, profile);
}

passport.use(new GoogleStrategy(googleAuthConfig, verifyCallback))

const app = express();

app.use(helmet());

app.use(passport.initialize())

function checkLoggedIn (req, res, next) {
    const isLoggedIn = true;

    if (!isLoggedIn) {
        return res.status(401).json({
            error: "You must log in!"
        })
    }
    next();
}

app.get('/auth/google', passport.authenticate("google", {
    scope: ["email"]
}))
app.get('/auth/google/callback',
    passport.authenticate("google", {
        failureRedirect: "/failure",
        successRedirect: "/",
        session: false
    }),
    (req, res) => {
        console.log("Google called us back")
    }
)
app.get('/auth/logout', (req, res) => {})


app.get("/failure", (req, res) => {
    return res.send("Failed to log in!")
})

app.get('/secret', checkLoggedIn, (req, res) => {
    return res.send("Your personal secret value is 42!")
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
})

https.createServer({
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
}, app).listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
})
