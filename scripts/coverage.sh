#!/bin/bash

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the testrpc instance that we started (if we started one).
  if [ -n "$testrpc_pid" ]; then
    kill -9 $testrpc_pid
  fi
}

testrpc_running() {
  nc -z localhost 8555
}

[ -d ./coverage ] || mkdir ./coverage
rm -rf ./coverage/.mytestrpc-coverage
mkdir ./coverage/.mytestrpc-coverage

SOLIDITY_COVERAGE=true ./node_modules/.bin/solidity-coverage
