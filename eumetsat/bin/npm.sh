#!/bin/bash
#
# F/2018-03-16 : For the purpose of being run from CRON/Systemd-timer

rewt="$(cd `dirname "$0"`/.. && pwd)"

>&2 echo "+-- $0 $@"

if ! shopt -q login_shell ; then
  >&2 echo "| Shell is not a login shell, sourcing ~/.bashrc"
  >&2 echo "| ( i) FABIC_BASHRC_SOURCED = $FABIC_BASHRC_SOURCED"
  source ~/.bashrc
  >&2 echo "| (ii) FABIC_BASHRC_SOURCED = $FABIC_BASHRC_SOURCED"
fi

>&2 echo "| Entering Node.js project directory '$rewt'"

cd "$rewt" || exit 127

npm_cmd=( "`type -p npm`" "$@" )

>&2 echo "| \$PATH = $PATH"

>&2 echo "| Running NPM command:"
>&2 echo "|   ${npm_cmd[@]}"
>&2 echo

exec "${npm_cmd[@]}"
