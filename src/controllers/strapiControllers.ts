import axios from "axios";

const STRAPI_IP_ADDRESS = process.env.STRAPI_IP_ADDRESS;
const STRAPI_API_KEY = process.env.STRAPI_API_KEY;

export const getSpaceFromTeamId = async (teamId: string) => {
  try {
    const url = `${STRAPI_IP_ADDRESS}/api/tenant-details?filters[slack_id][$eq]=${teamId}&populate[0]=tenant`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_API_KEY}`,
      },
    });
    if (!response.data?.data?.[0]?.tenant) {
      return null;
    }
    const tenant = response.data?.data?.[0]?.tenant;
    console.log("tenant", {
      ...tenant,
      slack_token: response.data?.data?.[0]?.slack_token,
    });
    return tenant;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getUserFromSpaceUserId = async (
  spaceId: string,
  userId: string,
) => {
  try {
    const url = `${STRAPI_IP_ADDRESS}/api/privileges?filters[tenant][documentId][$eq]=${spaceId}&filters[job_title][$eq]=${userId}&populate[0]=users_permissions_user`; // change the field name from job_title to slack_user in strapi and here as well later
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_API_KEY}`,
      },
    });
    if (!response.data.data?.[0]?.users_permissions_user) {
      return null;
    }
    return response.data.data[0];
  } catch (e) {
    console.log(e);
    return null;
  }
};
