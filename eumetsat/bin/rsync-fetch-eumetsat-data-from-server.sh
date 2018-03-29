#!/bin/bash
#
# F/2018-03-29

echo
echo "+- $0 $@"

if [ $# -lt 1 ]; then
  echo "| NOTE: additionnal arguments are for Rsync (none provided; ex. --dry-run/-n)"
  echo "+"
fi

here="$(cd `dirname "$0"`/.. && pwd)"

remote_host="vps.fabic.net"
remote_path="~/dev/nodejs_playground/eumetsat/public/EUMetSat/"

rsync_cmd=( rsync -avhP --stats
  "$remote_host:$remote_path"
  "$here/public/EUMetSat/"
    --delete-after
      "$@"
)

echo "| About to run :"
echo "|   ${rsync_cmd[@]}"
echo "|"
read -p "+~~> CONTINUE ? (Ctrl-C to abort)"
echo

start_date="`date`"

time \
  "${rsync_cmd[@]}"
retv=$?

end_date="`date`"

echo
echo "+"
echo "| Rsync completed, exit status: $retv"
echo "| Command was: ${rsync_cmd[@]}"
echo "|"
echo "| Start date : $start_date"
echo "|   End date : $end_date"
echo "|"
echo "+-- $0 $@ : DONE ($retv)"

exit $retv

