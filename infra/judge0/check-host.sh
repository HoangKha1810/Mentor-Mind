#!/usr/bin/env bash

set -euo pipefail

docker_bin="${DOCKER_BIN:-docker}"

fail() {
  printf 'Judge0 preflight failed: %s\n' "$1" >&2
  exit 1
}

command -v "$docker_bin" >/dev/null 2>&1 || fail "Docker CLI is not installed."
"$docker_bin" info >/dev/null 2>&1 || fail "Docker daemon is not running."

server_os=$("$docker_bin" info --format '{{.OSType}}')
server_arch=$("$docker_bin" info --format '{{.Architecture}}')
cgroup_version=$("$docker_bin" info --format '{{.CgroupVersion}}')

[[ "$server_os" == "linux" ]] || fail "Judge0 requires a Linux Docker host (found $server_os)."
case "$server_arch" in
  x86_64 | amd64) ;;
  *) fail "The pinned Judge0 image supports linux/amd64 only (found $server_arch)." ;;
esac

if [[ "$cgroup_version" != "1" ]]; then
  cat >&2 <<'EOF'
Judge0 preflight failed: Judge0 1.13.1 requires cgroup v1, but Docker reports cgroup v2.

On an Ubuntu VPS, preserve the existing GRUB arguments and add:
  systemd.unified_cgroup_hierarchy=0

Then run `sudo update-grub`, reboot the VPS, and verify that
`docker info --format '{{.CgroupVersion}}'` prints `1` before starting Judge0.
Do not disable Judge0's per-process limits to work around this check.
EOF
  exit 1
fi

for container in mentormind-judge0-server mentormind-judge0-worker; do
  if "$docker_bin" inspect "$container" >/dev/null 2>&1; then
    privileged=$("$docker_bin" inspect --format '{{.HostConfig.Privileged}}' "$container")
    [[ "$privileged" == "true" ]] || fail "$container is running without privileged mode."
  fi
done

printf 'Judge0 host preflight passed (os=%s, arch=%s, cgroup=v%s).\n' \
  "$server_os" "$server_arch" "$cgroup_version"
