#!/usr/bin/env node

const baseUrl = (process.env.JUDGE0_BASE_URL || process.argv[2] || 'http://127.0.0.1:2358').replace(
  /\/+$/,
  '',
);
const apiKey = process.env.JUDGE0_API_KEY || '';
const authHeader = process.env.JUDGE0_AUTH_HEADER || 'X-RapidAPI-Key';
const rapidApiHost = process.env.JUDGE0_RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
const rounds = positiveInteger(process.env.JUDGE0_SMOKE_ROUNDS, 1);
const expected = 'MentorMind 7';
const input = `${expected}\n`;

const runtimes = [
  {
    label: 'JavaScript',
    id: 63,
    source: "process.stdout.write(require('fs').readFileSync(0, 'utf8').trim());",
  },
  {
    label: 'TypeScript',
    id: 74,
    source:
      "declare const require: any;\ndeclare const process: any;\nconst fs = require('fs');\nconst value: string = fs.readFileSync(0, 'utf8').trim();\nprocess.stdout.write(value);",
  },
  {
    label: 'Python',
    id: 71,
    source: 'import sys\nsys.stdout.write(sys.stdin.read().strip())',
  },
  {
    label: 'Java',
    id: 62,
    source:
      'import java.io.*;\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    System.out.print(new String(System.in.readAllBytes()).trim());\n  }\n}',
  },
  {
    label: 'C++',
    id: 54,
    source:
      "#include <iostream>\n#include <sstream>\n#include <string>\nusing namespace std;\nint main() {\n  ostringstream out; out << cin.rdbuf();\n  string value = out.str();\n  while (!value.empty() && (value.back() == '\\n' || value.back() == '\\r')) value.pop_back();\n  cout << value;\n  return 0;\n}",
  },
];

await verifyLanguages();

for (let round = 1; round <= rounds; round += 1) {
  const results = await Promise.all(runtimes.map((runtime) => execute(runtime)));
  for (const result of results) {
    console.log(
      `PASS round=${round} language=${result.label} id=${result.id} time=${result.time ?? '-'} memory=${result.memory ?? '-'}`,
    );
  }
}

console.log(`Judge0 smoke test passed: ${runtimes.length * rounds}/${runtimes.length * rounds}.`);

async function verifyLanguages() {
  const languages = await requestJson(`${baseUrl}/languages`);
  if (!Array.isArray(languages)) {
    throw new Error('Judge0 /languages did not return an array.');
  }
  for (const runtime of runtimes) {
    if (!languages.some((language) => language?.id === runtime.id)) {
      throw new Error(`Judge0 language ${runtime.label} (${runtime.id}) is unavailable.`);
    }
  }
}

async function execute(runtime) {
  const submission = await requestJson(`${baseUrl}/submissions?base64_encoded=true&wait=true`, {
    method: 'POST',
    body: JSON.stringify({
      language_id: runtime.id,
      source_code: encode(runtime.source),
      stdin: encode(input),
      expected_output: encode(expected),
      cpu_time_limit: 3,
      wall_time_limit: 6,
      memory_limit: 256000,
    }),
  });
  const result = await waitForResult(submission);
  const stdout = decode(result.stdout) ?? '';

  if (result.status?.id !== 3 || stdout !== expected) {
    const diagnostic =
      decode(result.compile_output) ||
      decode(result.stderr) ||
      decode(result.message) ||
      result.status?.description ||
      'Unknown Judge0 failure';
    throw new Error(
      `${runtime.label} (${runtime.id}) failed with status ${result.status?.id ?? 'missing'}: ${diagnostic}`,
    );
  }

  return { ...runtime, time: result.time, memory: result.memory };
}

async function waitForResult(initial) {
  if (isTerminal(initial)) {
    return initial;
  }
  if (!initial?.token) {
    throw new Error('Judge0 returned neither a terminal status nor a submission token.');
  }

  for (let attempt = 0; attempt < 60; attempt += 1) {
    await delay(250);
    const result = await requestJson(
      `${baseUrl}/submissions/${encodeURIComponent(initial.token)}` +
        '?base64_encoded=true&fields=token,stdout,stderr,compile_output,message,time,memory,status',
    );
    if (isTerminal(result)) {
      return result;
    }
  }
  throw new Error(`Judge0 submission ${initial.token} did not finish in time.`);
}

async function requestJson(url, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(init.headers || {}),
      },
      signal: controller.signal,
    });
    const body = await response.text();
    if (!response.ok) {
      throw new Error(`Judge0 HTTP ${response.status}: ${body.slice(0, 1000)}`);
    }
    return JSON.parse(body);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Judge0 request timed out: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function authHeaders() {
  if (!apiKey) {
    return {};
  }
  return {
    [authHeader]: apiKey,
    ...(authHeader === 'X-RapidAPI-Key' ? { 'X-RapidAPI-Host': rapidApiHost } : {}),
  };
}

function isTerminal(submission) {
  return typeof submission?.status?.id === 'number' && ![1, 2].includes(submission.status.id);
}

function encode(value) {
  return Buffer.from(value, 'utf8').toString('base64');
}

function decode(value) {
  return typeof value === 'string' && value
    ? Buffer.from(value, 'base64').toString('utf8')
    : undefined;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
