import dotenv from 'dotenv';
dotenv.config();
const config = {
  domain: process.env.DOMAIN,
  clientId: process.env.CLIENTID,
};

export default config;
