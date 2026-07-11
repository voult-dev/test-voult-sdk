function base64URLToBuffer(base64URL) {
  const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i += 1) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

function bufferToBase64URL(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function decodeCreationOptions(options) {
  const publicKey = { ...options };

  if (publicKey.challenge) {
    publicKey.challenge = base64URLToBuffer(publicKey.challenge);
  }

  if (publicKey.user?.id) {
    publicKey.user = {
      ...publicKey.user,
      id: base64URLToBuffer(publicKey.user.id),
    };
  }

  if (Array.isArray(publicKey.excludeCredentials)) {
    publicKey.excludeCredentials = publicKey.excludeCredentials.map((cred) => ({
      ...cred,
      id: base64URLToBuffer(cred.id),
    }));
  }

  return publicKey;
}

function decodeRequestOptions(options) {
  const publicKey = { ...options };

  if (publicKey.challenge) {
    publicKey.challenge = base64URLToBuffer(publicKey.challenge);
  }

  if (Array.isArray(publicKey.allowCredentials)) {
    publicKey.allowCredentials = publicKey.allowCredentials.map((cred) => ({
      ...cred,
      id: base64URLToBuffer(cred.id),
    }));
  }

  return publicKey;
}

function serializeCredential(credential) {
  const response = credential.response;

  const serialized = {
    id: credential.id,
    rawId: bufferToBase64URL(credential.rawId),
    type: credential.type,
    response: {},
  };

  if (response.clientDataJSON) {
    serialized.response.clientDataJSON = bufferToBase64URL(response.clientDataJSON);
  }

  if (response.attestationObject) {
    serialized.response.attestationObject = bufferToBase64URL(response.attestationObject);
  }

  if (response.authenticatorData) {
    serialized.response.authenticatorData = bufferToBase64URL(response.authenticatorData);
  }

  if (response.signature) {
    serialized.response.signature = bufferToBase64URL(response.signature);
  }

  if (response.userHandle) {
    serialized.response.userHandle = bufferToBase64URL(response.userHandle);
  }

  return serialized;
}

export async function createPasskey(options) {
  const credential = await navigator.credentials.create({
    publicKey: decodeCreationOptions(options),
  });
  return serializeCredential(credential);
}

export async function getPasskey(options) {
  const credential = await navigator.credentials.get({
    publicKey: decodeRequestOptions(options),
  });
  return serializeCredential(credential);
}

export function isWebAuthnSupported() {
  return Boolean(window.PublicKeyCredential);
}
