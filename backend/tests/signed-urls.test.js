import test from "node:test";
import assert from "node:assert/strict";
import {
  generateSignedFileUrl,
  verifySignedFileToken,
} from "../src/modules/files/file-token.service.js";

test("Signed URLs - Successfully generates and verifies valid token", () => {
  const storageKey = "bids/660c1d2e4f8b9a001f3e7a12/pages/sample-page-1.png";
  const signed = generateSignedFileUrl(storageKey, 300000);

  assert.ok(signed.url.startsWith("/api/v1/files/"));
  assert.ok(signed.token);
  assert.ok(signed.expiresAt);

  const verifiedKey = verifySignedFileToken(signed.token);
  assert.equal(verifiedKey, storageKey);
});

test("Signed URLs - Rejects expired token", () => {
  const storageKey = "bids/660c1d2e4f8b9a001f3e7a12/pages/sample-page-2.png";
  // Negative TTL to create an already-expired token
  const signed = generateSignedFileUrl(storageKey, -1000);

  assert.throws(
    () => verifySignedFileToken(signed.token),
    (err) => {
      assert.equal(err.statusCode, 401);
      assert.match(err.message, /expired/);
      return true;
    }
  );
});

test("Signed URLs - Rejects tampered signature", () => {
  const storageKey = "bids/660c1d2e4f8b9a001f3e7a12/pages/sample-page-3.png";
  const signed = generateSignedFileUrl(storageKey, 300000);

  const parts = signed.token.split(".");
  const tamperedToken = `${parts[0]}.forgedSignature1234567890`;

  assert.throws(
    () => verifySignedFileToken(tamperedToken),
    (err) => {
      assert.equal(err.statusCode, 401);
      assert.match(err.message, /signature/);
      return true;
    }
  );
});

test("Signed URLs - Rejects path traversal in storageKey", () => {
  const maliciousKey = "../../../etc/passwd";

  assert.throws(
    () => generateSignedFileUrl(maliciousKey),
    (err) => {
      assert.match(err.message, /Path traversal/);
      return true;
    }
  );
});
