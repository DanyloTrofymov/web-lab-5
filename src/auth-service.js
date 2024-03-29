import createAuth0Client from '@auth0/auth0-spa-js';
import { user, isAuthenticated, popupOpen, token } from './store';
import config from './auth-config';

async function createClient() {
  //eslint-disable-next-line
  return await createAuth0Client({
    domain: config.domain,
    //eslint-disable-next-line
    client_id: config.clientId,
  });
}

async function loginWithPopup(client, options) {
  popupOpen.set(true);
  try {
    await client.loginWithPopup(options);
    user.set(await client.getUser());
    isAuthenticated.set(true);
    const accessToken = await client.getIdTokenClaims();
    if (accessToken) {
      token.set(accessToken.__raw);
    }
  } catch (e) {
    // eslint-disable-next-line
    console.error(e);
    throw new Error(e);
  } finally {
    popupOpen.set(false);
  }
}

function logout(client) {
  return client.logout();
}

const auth = {
  createClient,
  loginWithPopup,
  logout,
};

export default auth;
