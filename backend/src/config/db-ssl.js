const ca = process.env.DB_SSL_CA_BASE64;

module.exports =
  process.env.DB_SSL === 'true'
    ? ca
      ? { ca: Buffer.from(ca, 'base64') }
      : {}
    : undefined;
