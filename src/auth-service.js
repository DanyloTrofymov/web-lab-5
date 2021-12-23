import createAuth0Client from '@auth/auth0-spa-js';
import { user, isAuthenticied, popupOpen, token } from './store';
import config from './auth-onfig';

async function createClient() {
  return await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
  });
}

async function loginWithPopup(client, options) {
  popupOpen.set(true);
  try {
    await client.loginWithPopup(options);
    user.set(await client.getUser());
    const accessToken = await client.getIdTokenClaims();
    token.set(accessToken.__raw);
    isAuthenticied.set(true);
  } catch (e) {
    console.error(e);
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
