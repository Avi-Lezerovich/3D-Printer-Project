#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    [ "${HUSKY_DEBUG}" = "1" ] && echo "$1"
  }
  readonly hook_name="$(basename -- "$0")"
  debug "husky:debug hook_name: $hook_name"
  if [ "$HUSKY" = "0" ]; then
    debug "husky:debug Husky disabled"
    exit 0
  fi
  if [ -f ~/.huskyrc ]; then
    debug "husky:debug ~/.huskyrc found"
    . ~/.huskyrc
  fi
fi
