import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import {
  generateSignedFileUrl,
  verifySignedFileToken,
} from "../src/modules/files/file-token.service.js";
import { resolveSafePath } from "../src/modules/storage/storage.service.js";
import { authenticate, authorize } from "../src/modules/auth/auth.middleware.js";
import { normalizeBbox } from "../src/modules/evaluations/evaluation.model.js";
import RegisterDto from "../src/modules/auth/dto/register.dto.js";
import CreateTenderDto from "../src/modules/tenders/dto/create-tender.dto.js";

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

test("Signed URLs - Rejects sibling-prefix directory traversal (../uploads_backup/leak.pdf)", () => {
  assert.throws(
    () => resolveSafePath("../uploads_backup/leak.pdf"),
    (err) => {
      assert.match(err.message, /Path traversal detected/);
      return true;
    }
  );
});

test("Signed URLs - Enforces FILE_URL_SECRET in production", (t) => {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevSecret = process.env.FILE_URL_SECRET;
  process.env.NODE_ENV = "production";
  delete process.env.FILE_URL_SECRET;

  t.after(() => {
    process.env.NODE_ENV = prevNodeEnv;
    if (prevSecret !== undefined) {
      process.env.FILE_URL_SECRET = prevSecret;
    }
  });

  assert.throws(
    () => generateSignedFileUrl("bids/660c1d2e4f8b9a001f3e7a12/doc.pdf"),
    /FATAL: FILE_URL_SECRET environment variable must be set in production/
  );
});

test("Auth & RBAC - Rejects anonymous request (401), malformed token id (401), and wrong role (403)", async (t) => {
  const prevSecret = process.env.JWT_ACCESS_SECRET;
  process.env.JWT_ACCESS_SECRET = "test_jwt_access_secret_min_32_characters_long";
  t.after(() => {
    process.env.JWT_ACCESS_SECRET = prevSecret;
  });

  // 1. Anonymous request denied with 401
  await assert.rejects(
    () => authenticate({ headers: {} }, {}, () => {}),
    (err) => {
      assert.equal(err.statusCode, 401);
      assert.equal(err.message, "Not authenticated");
      return true;
    }
  );

  // 2. Malformed decoded.id denied with 401 instead of CastError
  const malformedToken = jwt.sign(
    { id: "not-an-objectid", role: "admin" },
    process.env.JWT_ACCESS_SECRET
  );
  await assert.rejects(
    () =>
      authenticate(
        { headers: { authorization: `Bearer ${malformedToken}` } },
        {},
        () => {}
      ),
    (err) => {
      assert.equal(err.statusCode, 401);
      assert.equal(err.message, "Invalid token payload");
      return true;
    }
  );

  // 3. Wrong role (customer/bidder) denied with 403
  const guard = authorize("admin", "procurement_officer");
  assert.throws(
    () => guard({ user: { id: "660c1d2e4f8b9a001f3e7a03", role: "customer" } }, {}, () => {}),
    (err) => {
      assert.equal(err.statusCode, 403);
      assert.equal(err.message, "You do not have permission to perform this action");
      return true;
    }
  );
});

test("BBox Normalization - Converts [x, y, w, h] array to { x, y, w, h } object", () => {
  assert.deepEqual(normalizeBbox([0.704, 0.692, 0.145, 0.015]), {
    x: 0.704,
    y: 0.692,
    w: 0.145,
    h: 0.015,
  });
});

test("Security Input Validation - Rejects XSS script payloads, NoSQL operators, admin self-registration, and oversized strings", () => {
  // 1. Script payload rejected
  const xssResult = RegisterDto.validateData({
    name: "<script>alert(1)</script>",
    email: "user@example.com",
    password: "Password@123",
  });
  assert.ok(xssResult.errors);
  assert.match(xssResult.errors[0], /disallowed script/i);

  // 2. NoSQL $gt operator rejected
  const nosqlResult = CreateTenderDto.validateData({
    bidNumber: "GEM/2026/B/1234567",
    organisation: { $gt: "" },
    itemCategory: "Telecom",
    quantity: 1,
    estimatedValue: 1000,
    bidEndDate: "2026-12-31T00:00:00.000Z",
  });
  assert.ok(nosqlResult.errors);
  assert.match(nosqlResult.errors[0], /disallowed query operator/i);

  // 3. Self-registration as admin rejected
  const adminReg = RegisterDto.validateData({
    name: "Attacker",
    email: "attacker@example.com",
    password: "Password@123",
    role: "admin",
  });
  assert.ok(adminReg.errors);

  // 4. Oversized string rejected
  const oversized = CreateTenderDto.validateData({
    bidNumber: "GEM/2026/B/1234567",
    organisation: "A".repeat(5000),
    itemCategory: "Telecom",
    quantity: 1,
    estimatedValue: 1000,
    bidEndDate: "2026-12-31T00:00:00.000Z",
  });
  assert.ok(oversized.errors);
});
