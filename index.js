const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path"); // Import path module
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

const loadEmailTemplate = (name, email, message, section) => {
  const templatePath = path.join(__dirname, "public", "emailTemplate.html"); // Path to public/emailTemplate.html

  if (!fs.existsSync(templatePath)) {
    throw new Error("Template file not found: " + templatePath);
  }

  const template = fs.readFileSync(templatePath, "utf-8");

  const updatedTemplate = template
    .replace("{{name}}", name)
    .replace("{{email}}", email)
    .replace("{{message}}", message)
    .replace("{{section}}", section);

  return updatedTemplate;
};

app.use(express.static(path.join(__dirname, "public")));

app.post("/mail", function (req, res) {
  res.set("Content-Type", "application/json");
  const { email, name, message, section } = req.body;

  try {
    const emailContent = loadEmailTemplate(name, email, message, section);
    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MJ_SENDER_EMAIL,
            Name: name,
          },
          To: [
            {
              Email: "anoopjadhav@gmail.com",
              Name: "Anoop Jadhav",
            },
          ],
          Subject: "Portfolio | You got a new message",
          TextPart: message,
          HTMLPart: emailContent,
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
        console.error("Error sending email:", err);
        res.status(400).send({
          msg: "failed",
          errorCode: err.statusCode,
          errorMessage: err,
        });
      });
  } catch (error) {
    console.error("Error loading email template:", error);
    res.status(500).send({
      msg: "failed",
      errorMessage: error.message,
    });
  }
});

app.listen(PORT, function () {
  console.error(`listening on port ${PORT}`);
});
