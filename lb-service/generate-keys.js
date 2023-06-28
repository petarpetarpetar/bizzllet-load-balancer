const { ec } = require("elliptic");
const curve = new ec("secp256k1");

// Generate a key pair
const keyPair = curve.genKeyPair();

// Get the private and public key in hexadecimal format
const privateKey = keyPair.getPrivate("hex");
const publicKey = keyPair.getPublic("hex");

console.log("Private Key:", privateKey);
console.log("Public Key:", publicKey);

// Sign a message
const message = "Hello, world!";
const signature = keyPair.sign(message);

console.log("Signature:", {
  r: signature.r.toString("hex"),
  s: signature.s.toString("hex"),
});

// Verify the signature
const isSignatureValid = keyPair.verify(message, signature);
console.log("Is Signature Valid?", isSignatureValid);
