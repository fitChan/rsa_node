
const crypto = require('crypto');
const express = require('express');
const app = express();
const mysql = require('mysql');

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'cksdn123',
  database : 'rsatest'
});

connection.connect();

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
    },
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
});
const privateKeyObj = crypto.createPrivateKey(privateKey);
const publicKeyObj = crypto.createPublicKey(publicKey);
const privateKeyString = privateKeyObj.export({ type: 'pkcs8', format: 'pem' });
const publicKeyString = publicKeyObj.export({ type: 'spki', format: 'pem' });
// Encrypt a message using the public key
const message = 'this is plain Text';
const encrypted = crypto.publicEncrypt(
    {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
    },
    Buffer.from(message, 'utf8')
);



// Decrypt the message using the private key
const decrypted = crypto.privateDecrypt(
    {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
    },
    encrypted
);

app.post('/save/key', async (req, res) => {
    let public = Buffer.from(publicKeyString, "utf8").toString('base64');
    let private = Buffer.from(privateKeyString, "utf8").toString('base64');
    let enc_text = Buffer.from(encrypted, "utf8").toString('base64');
    const jsonResult = {
        publicKey : public,
        privateKey : private,
        encrypted : enc_text
    }
    
    connection.query(`insert into rsaTable (PRIVATE_KEY, PUBLIC_KEY, ENC_TEXT) VALUES ('${public}', '${private}', '${enc_text}' )`)
    res.send(jsonResult).status(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});