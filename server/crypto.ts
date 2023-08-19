const encode = (data: string) => {
  const encoder = new TextEncoder()
  return encoder.encode(data)
}

const decode = (bytestream: ArrayBuffer) => {
  const decoder = new TextDecoder()
  return decoder.decode(bytestream)
}

async function getKey(): Promise<CryptoKey> {
  // todo: make this an actual key
  const data = new ArrayBuffer(32);

  const key = await crypto.subtle.importKey("raw", data, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);

  return key;
}

const pack = (buffer: ArrayBuffer) => {
  return btoa(
    String.fromCharCode.apply(null, new Uint8Array(buffer) as any)
  )
}

const unpack = (packed: string) => {
  const string = atob(packed)
  const buffer = new ArrayBuffer(string.length)
  const bufferView = new Uint8Array(buffer)
  for (let i = 0; i < string.length; i++) {
    bufferView[i] = string.charCodeAt(i)
  }
  return buffer
}

export async function encrypt(value: string): Promise<string> {
  console.log("Encrypting");

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await getKey();

  const cipher = await crypto.subtle.encrypt({
    name: 'AES-GCM',
    iv: iv,
  }, key, encode(value));

  return pack(iv) + '.' + pack(cipher);
}

export async function decrypt(value: string): Promise<string> {
  console.log("Decrypting");

  const [iv, ciphertext] = value.split('.');

  if (!iv || !ciphertext) {
    throw new Error("Invalid!");
  }

  const decrypted = await crypto.subtle.decrypt({
    name: "AES-GCM",
    iv: unpack(iv)
  }, await getKey(), unpack(ciphertext));

  return decode(decrypted);

}
