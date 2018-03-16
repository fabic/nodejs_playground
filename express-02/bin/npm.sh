#!/bin/bash
#
# F/2018-03-16 : For the purpose of being run from CRON/Systemd-timer

rewt="$(cd `dirname "$0"`/.. && pwd)"

>&2 echo "+-- $0 $@"

source ~/.bashrc
# ^ FIXME: fix that .bashrc of yours.

PATH=~/.local/node-v9.8.0-linux-x64/bin:$PATH

>&2 echo "| Entering Node.js project directory '$rewt'"

cd "$rewt" || exit 127

npm_cmd=( "`type -p npm`" "$@" )

>&2 echo "| \$PATH = $PATH"

>&2 echo "| Running NPM command:"
>&2 echo "|   ${npm_cmd[@]}"

exec "${npm_cmd[@]}"
