const express = require("express");
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

app.use(
  cors({
    corsOptions,
  })
);

const mailJetModule = require("node-mailjet");
const mailjet = mailJetModule.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);
// Answer API requests.
app.post("/mail", function (req, res) {
  res.set("Content-Type", "application/json");
  const { userEmail, userName, userMessage } = req.body;

  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: userEmail,
          Name: userName,
        },
        To: [
          {
            Email: "anoopjadhav@gmail.com",
            Name: "Anoop Jadhav",
          },
        ],
        Subject: "AJ Portfolio | Feedback",
        TextPart: "Feedback",
        HTMLPart: `
            <div><h3>FeedBack</h3><p>${userName}</p><p>${userMessage}</p></div>
          `,
        CustomID: "portfolio-feedback",
      },
    ],
  });
  request
    .then(() => {
      console.log("Email Sent");
      res.status(200).send({
        msg: "success",
      });
    })
    .catch((err) => {
      res.status(400).send({
        msg: "failed",
        errorCode: err.statusCode,
        errorMessage: err,
      });
    });
});

app.listen(PORT, function () {
  console.error(`listening on port ${PORT}`);
});
