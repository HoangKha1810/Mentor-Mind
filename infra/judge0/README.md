# Judge0 operations

MentorMind uses Judge0 CE 1.13.1 for JavaScript 63, TypeScript 74, Python 71,
Java 62, and C++ 54. The server and worker images are pinned to the same amd64
digest in `docker-compose.yml`.

## Why `/box/main.cpp` happens

Judge0 first runs `isolate --cg --init` and uses its stdout as the sandbox work
directory. If isolate fails and returns an empty path, Judge0 tries to write the
source file at `/box/<file>` and Ruby reports `rb_sysopen`. Changing the request
between plain text and Base64 cannot repair that sandbox.

Judge0 1.13.1 uses an isolate build that requires a Linux amd64 Docker host with
cgroup v1. Upstream cgroup v2 support is not yet part of a stable Judge0 release.

## VPS setup

Run the host gate before starting or updating Judge0:

```bash
pnpm judge0:preflight
```

If Docker reports cgroup v2 on Ubuntu, back up `/etc/default/grub`, preserve its
existing kernel arguments, add `systemd.unified_cgroup_hierarchy=0`, run
`sudo update-grub`, and reboot. Continue only after this prints `1`:

```bash
docker info --format '{{.CgroupVersion}}'
```

Start only the Judge0 services. Never remove `judge0-data` while repairing the
worker.

```bash
docker compose --profile judge0 up -d judge0-db judge0-redis judge0-server judge0-worker
pnpm judge0:smoke
```

The smoke test verifies the five language IDs and executes all five compilers in
parallel. Use extra rounds after infrastructure changes:

```bash
JUDGE0_SMOKE_ROUNDS=3 pnpm judge0:smoke
```

If it fails with `/box`, inspect the worker before restarting the API:

```bash
docker compose --profile judge0 logs --tail=300 judge0-worker
docker exec mentormind-judge0-worker sh -lc 'mount | grep cgroup; isolate --version'
```

## Local macOS development

The official image is Linux amd64-only and should not be treated as a reliable
Judge0 host on Apple silicon. Run the API against a verified Linux Judge0 host,
or keep the VPS port private and use an SSH tunnel:

```bash
ssh -N -L 2358:127.0.0.1:2358 deploy@your-vps
JUDGE0_BASE_URL=http://127.0.0.1:2358 pnpm judge0:smoke
```

Do not expose port 2358 publicly without Judge0 authentication and TLS.

References:

- <https://github.com/judge0/judge0/issues/474>
- <https://github.com/judge0/judge0/issues/543>
- <https://github.com/judge0/judge0/pull/599>
