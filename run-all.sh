#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/orcun/projects/restflow-ai-claude"
SKIP_TESTS=${SKIP_TESTS:-true}
MVN_BUILD_CACHE_ENABLED=${MVN_BUILD_CACHE_ENABLED:-true}

declare -a PIDS=()
declare -a PGIDS=()
SHUTDOWN_IN_PROGRESS=false

if command -v setsid >/dev/null 2>&1; then
  USE_SETSID=true
else
  USE_SETSID=false
fi

echo "[run-all] ROOT=$ROOT"
if [ "$SKIP_TESTS" = "true" ]; then
  MVN_SKIP_ARGS=(-DskipTests)
else
  MVN_SKIP_ARGS=()
fi

MVN_COMMON_ARGS=("-Dmaven.build.cache.enabled=$MVN_BUILD_CACHE_ENABLED")

add_pid() {
  local pid="$1"
  local pgid
  PIDS+=("$pid")
  pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d '[:space:]' || true)
  if [ -n "$pgid" ]; then
    PGIDS+=("$pgid")
  fi
}

stop_pid_tree() {
  local pid="$1"
  if ! kill -0 "$pid" 2>/dev/null; then
    return
  fi
  local children
  children=$(pgrep -P "$pid" || true)
  if [ -n "$children" ]; then
    while IFS= read -r child; do
      [ -n "$child" ] && stop_pid_tree "$child"
    done <<< "$children"
  fi
  kill -TERM "$pid" 2>/dev/null || true
}

stop_process_group() {
  local signal="$1"
  local pgid="$2"
  if [ -z "$pgid" ]; then
    return
  fi
  kill "-$signal" -- "-$pgid" 2>/dev/null || true
}

cleanup() {
  if [ "$SHUTDOWN_IN_PROGRESS" = true ]; then
    return
  fi
  SHUTDOWN_IN_PROGRESS=true
  echo
  echo "[run-all] Stopping processes..."
  for pgid in "${PGIDS[@]:-}"; do
    stop_process_group TERM "$pgid"
  done
  for pid in "${PIDS[@]:-}"; do
    [ -n "$pid" ] && stop_pid_tree "$pid"
  done
  sleep 1
  for pgid in "${PGIDS[@]:-}"; do
    if [ -n "$pgid" ] && kill -0 -- "-$pgid" 2>/dev/null; then
      stop_process_group KILL "$pgid"
    fi
  done
  for pid in "${PIDS[@]:-}"; do
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      kill -KILL "$pid" 2>/dev/null || true
    fi
  done
  echo "[run-all] All processes stopped."
}

launch_in_dir() {
  local service_name="$1"
  local service_dir="$2"
  shift 2
  if [ "$USE_SETSID" = "true" ]; then
    (cd "$service_dir" && exec setsid "$@") &
  else
    (cd "$service_dir" && "$@") &
  fi
  local pid=$!
  add_pid "$pid"
  echo "[run-all] $service_name PID=$pid"
}

trap cleanup INT TERM HUP QUIT EXIT

echo "[run-all] 1) Building restflow core (clean install)"
mvn -f "$ROOT/restflow/pom.xml" "${MVN_COMMON_ARGS[@]}" "${MVN_SKIP_ARGS[@]}" clean install

echo "[run-all] 2) Starting Spring Boot services (background)"
echo "[run-all] -> restflow-api (port 8080)"
launch_in_dir "restflow-api" "$ROOT/restflow-api" \
  mvn "${MVN_COMMON_ARGS[@]}" "${MVN_SKIP_ARGS[@]}" spring-boot:run

echo "[run-all] -> restflow-mcp-server (port 8090)"
launch_in_dir "restflow-mcp-server" "$ROOT/restflow-mcp-server" \
  mvn "${MVN_COMMON_ARGS[@]}" "${MVN_SKIP_ARGS[@]}" spring-boot:run

echo "[run-all] Backend services started. Press 'q' to stop (or Ctrl+C)."

while true; do
  if ! IFS= read -r -s -n 1 -t 1 input; then
    continue
  fi
  if [ "$input" = "q" ] || [ "$input" = "Q" ]; then
    cleanup
    exit 0
  fi
done
