import { confirm, input, password, select } from "@inquirer/prompts";

/**
 * @param {{ storeHash: string, accessToken: string }} config
 * @returns {Promise<Response>}
 */
const fetchChannels = async ({ storeHash, accessToken }) =>
  fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/channels?type:in=storefront&platform:in=bigcommerce,next&available=true`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-auth-token": accessToken,
      },
    }
  );

/**
 * @param {{ storeHash: string, accessToken: string, channelId: string }} config
 * @returns {Promise<Response>}
 */
const fetchChannel = async ({ storeHash, accessToken, channelId }) =>
  fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/channels/${channelId}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-auth-token": accessToken,
      },
    }
  );

/**
 * @param {{ storeHash: string, accessToken: string, channelName: string }} config
 * @returns {Promise<Response>}
 */
const createChannel = async ({ storeHash, accessToken, channelName }) =>
  fetch(`https://api.bigcommerce.com/stores/${storeHash}/v3/channels`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-auth-token": accessToken,
    },
    body: JSON.stringify({
      name: channelName,
      type: "storefront",
      platform: "next",
      status: "prelaunch",
      is_listable_from_ui: true,
    }),
  });

/** @returns {Promise<string>} */
const promptStoreHash = async () =>
  input({ message: "Please enter your store hash" });

/** @returns {Promise<string>} */
const promptAccessToken = async () => {
  console.log("Please create an access token with the following scopes:");
  console.log("- Carts: read-only");
  console.log("- Sites & routes: modify");
  console.log("- Channel settings: modify");
  console.log("- Storefront API customer impersonation tokens: manage");
  console.log(
    "http://login.bigcommerce.com/deep-links/settings/api-accounts/create"
  );

  return password({
    message: "Please enter your store's access token",
  });
};

/** @returns {Promise<boolean>} */
const promptUseExistingChannel = async () =>
  confirm({
    message: "Would you like to connect to an existing channel?",
    default: false,
  });

/**
 * @param {{ storeHash: string, accessToken: string }} config
 * @returns {Promise<number>}
 */
const promptNewChannelId = async ({ storeHash, accessToken }) => {
  const channelName = await input({
    message: "Please enter a unique name for your new channel",
  });

  const res = await createChannel({
    storeHash,
    accessToken,
    channelName,
  });

  if (!res.ok) {
    switch (res.status) {
      case 401:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was entered correctly.`
        );
      case 403:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was created with the correct scopes.`
        );
      case 404:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your store hash was entered correctly.`
        );
      case 409:
        console.log("Channel name already exists");
        return promptNewChannelId({ storeHash, accessToken });
      default:
        throw new Error(`${res.status} ${res.statusText}`);
    }
  }

  const { data } = await res.json();

  return data.id;
};

/**
 * @param {{ storeHash: string, accessToken: string }} config
 * @returns {Promise<number | null>}
 */
const promptExistingChannelId = async ({ storeHash, accessToken }) => {
  const res = await fetchChannels({ storeHash, accessToken });

  if (!res.ok) {
    switch (res.status) {
      case 401:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was entered correctly.`
        );
      case 403:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was created with the correct scopes.`
        );
      case 404:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your store hash was entered correctly.`
        );
      default:
        throw new Error(`${res.status} ${res.statusText}`);
    }
  }

  const { data } = await res.json();

  const choices = data
    .filter(({ id }) => id !== 1)
    .map(({ id, name }) => ({
      name: `Channel ID: ${id} Channel Name: ${name}`,
      value: id,
    }))
    .concat({ name: "Enter custom ID", value: null });

  return select({
    message: "Choose an existing Channel ID below",
    choices,
  });
};

/**
 * @param {{ storeHash: string, accessToken: string }} config
 * @returns {Promise<number>}
 */
const promptCustomChannelId = async ({ storeHash, accessToken }) => {
  const channelId = await input({
    message: "Enter an existing Channel ID",
  });

  const res = await fetchChannel({
    storeHash,
    accessToken,
    channelId,
  });

  if (!res.ok) {
    switch (res.status) {
      case 404:
        console.log(
          "Channel ID not found. Ensure that channel ID exists in your store."
        );
        return promptCustomChannelId({ storeHash, accessToken });
      default:
        throw new Error(`${res.status} ${res.statusText}`);
    }
  }

  const { data } = await res.json();

  return data.id;
};

/**
 * @param {{ storeHash: string, accessToken: string }} config
 * @returns {Promise<number>}
 */
const getChannelId = async ({ storeHash, accessToken }) => {
  const shouldUseExistingChannel = await promptUseExistingChannel();

  if (shouldUseExistingChannel) {
    const selectedChannelId = await promptExistingChannelId({
      storeHash,
      accessToken,
    });

    if (!selectedChannelId) {
      return promptCustomChannelId({ storeHash, accessToken });
    }

    return selectedChannelId;
  }

  return promptNewChannelId({ storeHash, accessToken });
};

/** @param {{ storeHash: string, accessToken: string, channelId: number }} env */
const logEnv = ({ storeHash, accessToken, channelId }) => {
  console.log(`\nBIGCOMMERCE_STORE_HASH=${storeHash}`);
  console.log(`BIGCOMMERCE_ACCESS_TOKEN=${accessToken}`);
  console.log(`BIGCOMMERCE_CHANNEL_ID=${channelId}`);
};

const setup = async () => {
  const storeHash = await promptStoreHash();
  const accessToken = await promptAccessToken();

  const channelId = await getChannelId({ storeHash, accessToken });

  logEnv({ storeHash, accessToken, channelId });
};

setup();
