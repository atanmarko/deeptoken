#!/bin/bash

# Run test coverage test
./scripts/coverage.sh

# Run truffle test
./scripts/start_testrpc.sh > /dev/null &
sleep 1
truffle test
killall node -2
