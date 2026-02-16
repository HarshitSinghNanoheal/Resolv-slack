import express from "express";
import "dotenv/config";
import { verifySlackRequest } from "./middleware.js";
import {
  getSpaceFromTeamId,
  getUserFromSpaceUserId,
} from "./controllers/strapiControllers.js";
import { RESOLV_IP_ADDRESS } from "./utils/constant.js";
// import axios from "axios";

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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/slack/commands", verifySlackRequest, async (req, res) => {
  const teamId = req.body.team_id;
  const userId = req.body.user_id;

  const tenant = await getSpaceFromTeamId(teamId);

  if (!tenant) {
    return res.json({
      response_type: "ephemeral",
      text: "Resolv is not connected to this Slack workspace.",
    });
  }

  const resolvUser = await getUserFromSpaceUserId(tenant.documentId, userId);

  if (!resolvUser) {
    const redirectUrl = `/${tenant.url}/settings/account?slack_id=${userId}`;

    const finalUrl = `${RESOLV_IP_ADDRESS}?redirected_to=${encodeURIComponent(
      redirectUrl,
    )}`;

    return res.json({
      response_type: "ephemeral",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Your Slack account is not linked to this Resolv space.",
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Link My Account",
              },
              style: "primary",
              url: finalUrl,
            },
          ],
        },
      ],
    });
  }
  console.log("resolvUser", resolvUser);
  const name = `${resolvUser.users_permissions_user.firstname} ${resolvUser.users_permissions_user.lastname}`;
  const spaceName = tenant.name;
  // Use Haya to return the response
  return res.json({
    response_type: "in_channel",
    text: `Hi ${name} 👋 How can I help you in ${spaceName}?`,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
