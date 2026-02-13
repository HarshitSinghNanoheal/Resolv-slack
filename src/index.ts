import express from "express";
import "dotenv/config";
import { verifySlackRequest } from "./middleware.js";
// import axios from "axios";
// import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 5000;
// Capture raw body for Slack verification
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
  }),
);


app.post(
  "/slack/commands",
  verifySlackRequest,
  async (req, res) => {
    const { text } = req.body;

    res.json({
      response_type: "ephemeral",
      text: `You said: ${text}`,
    });
  }
);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
