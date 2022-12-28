const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const corsOptions = {
  origin: process.env.PORTFOLIO_APP_URL,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const PORT = process.env.PORT || 8001;

const mailjet = require("node-mailjet").connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

app.use(
  cors({
    corsOptions,
  })
);
// Answer API requests.
app.post("/mail", function (req, res) {
  res.set("Content-Type", "application/json");
  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: req.body.userEmail,
          Name: req.body.userName,
        },
        To: [
          {
            Email: "anoopjadhav@gmail.com",
            Name: "Anoop Jadhav",
          },
        ],
        Subject: "AJ Portfolio | Feedback",
        TextPart: "Feedback",
        HTMLPart: `<h3>FeedBack</h3><p>${req.body.userMessage}</p>`,
        CustomID: "portfolio-feedback",
      },
    ],
  });
  request
    .then((result) => {
      console.log("Email Sent");
      res.send({
        msg: "success",
      });
    })
    .catch((err) => {
      res.send({
        msg: "fail",
      });
      console.log(err.statusCode);
    });
});

app.listen(PORT, function () {
  console.error(`listening on port ${PORT}`);
});
