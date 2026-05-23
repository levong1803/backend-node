import { GoogleGenAI } from "@google/genai";

const keys = [
  "AIzaSyAWwCP7IcCuVELpbsVDy_g6zkXUfAvS6v4",
  "AIzaSyDlRX6WMJwYptt0WsPHD8svMFNooQzuDPw",
  "AIzaSyBPSUNoBi7VFNfWBrjkrG-u0eUj-O6Syqo",
  "AIzaSyDz9FSPIxoCMb5brbE_v-GJTR9bEgLsHtk",
  "AIzaSyCyNQRvzoEiKKeykXyWs0hG8aF8ERAWfks",
  "AIzaSyCl9ncqJV2XH5L6GUKAvFuzPiQAsLQa5Pc",
  "AIzaSyCWWrw7gOLH_Yl7uIvvrrXojqU4fnx-0hQ",
  "AIzaSyBcDw9dCeCEfbcCC68jGNbK30DjejyrVmQ",
  "AIzaSyAy35Ywl-ceFyCbn14SIYxnQYyQGaZ2mV0",
  "AIzaSyDSftSRuApZSynpSl0xnUsDf-xTEFq3rWI",
  "AIzaSyAkDhdRsNl-FNoLGcLgTMBt8usCsIXHVuI",
  "AIzaSyBnpctFzwCgSmQ55JAiRKGzugDe1BldAQs",
  "AIzaSyBarNMr7pjyUFdsMnlBhJE8r3JvJiOP4Ow",
  "AIzaSyBFrGCee8vX_hYh186x_Z8kXTgLSh51QcQ",
  "AIzaSyCTCdPKbOV-bf4RRDm2FqZ1Ileee4Xos3c",
  "AIzaSyCAYfQqw8Wbbto6CyZtlb-w2PZKDxiETd0",
  "AIzaSyBnmWtwzfDsaUS8s2iN71oJDv9E3eqAV1k",
  "AIzaSyCTbtSWEfJ3kqjZVeRXuVqXHEYUAuDfLSA",
  "AIzaSyC-ixFMi7hB0huJc2Oy3ALi27JrF6CRPns",
  "AIzaSyBbl5LroyFq9HdrdjmKP_HtcChtWQBAv4g",
  "AIzaSyDKbvryNo1M3iDPTAJg5hVKh7xZ1WRFNm0",
  "AIzaSyA_pb8pBH0TjUgqXtmqw7ic4V69dktxcSg",
  "AIzaSyDZkI_c1ASm69nHKbEPAtZpkXF3c_bAaMg",
  "AIzaSyCBs1IMQXruTAzss1t9-8V9vVqcPIO2znk",
  "AIzaSyCl3xbNG9ZIkaBptVezAEc5ZUXUG4uZXEI",
  "AIzaSyDOy6kBhH_Hjbt0oW7kM-F7rMB18lxtRV8",
  "AIzaSyBZe7xiTsFN_a1VI3iJsIqvfib3YAHwuEk",
  "AIzaSyBiQ7tV0CvefYQPxo9nSmPcOG-WsW5GrSA",
  "AIzaSyBNZ8xR9xIGq_LpZa57iD553u5SWWn7hy4",
  "AIzaSyBq1WYoYvRuY9AOzUI3Zw__upQaceOP8Dc",
  "AIzaSyAeVhAMNmqJBWuyqkVZOolKW3GDm62Ospo",
];

async function testKey(key, index) {
  try {
    const client = new GoogleGenAI({ apiKey: key });
    const res = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Say OK",
    });
    const text = (res.text ?? "").trim();
    console.log(`[${index}] OK  key=${key.slice(0,12)}... response="${text.slice(0,30)}"`);
    return { key, index, ok: true };
  } catch (e) {
    const msg = e.message?.slice(0, 80) ?? "unknown";
    console.log(`[${index}] FAIL key=${key.slice(0,12)}... err=${msg}`);
    return { key, index, ok: false };
  }
}

async function main() {
  console.log(`Testing ${keys.length} keys...`);
  const working = [];
  // Test in batches of 5 to avoid overwhelming
  for (let i = 0; i < keys.length; i += 5) {
    const batch = keys.slice(i, i + 5);
    const results = await Promise.all(batch.map((k, j) => testKey(k, i + j)));
    for (const r of results) {
      if (r.ok) working.push(r);
    }
    if (working.length >= 3) break; // found enough
  }
  console.log(`\n=== WORKING KEYS (${working.length}): ===`);
  for (const w of working) {
    console.log(`  [${w.index}] ${w.key}`);
  }
  if (working.length === 0) {
    console.log("  NONE - all keys failed!");
  }
}

main();
