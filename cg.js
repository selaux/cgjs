#!/usr/bin/env bash
Function=Function//; for a in "$@"; do if [ "$a" = "-d" ] || [ "$a" = "--debug" ]; then export GTK_DEBUG=interactive; fi; done; if [ "$GTK_DEBUG" != "interactive" ]; then export GJS_DISABLE_EXTRA_WARNINGS=1; fi; if [ "$(which gjs 2> /dev/null)" != "" ]; then exec gjs "$0" "$@"; elif [ "$(which cjs 2> /dev/null)" != "" ]; then exec cjs "$0" "$@"; fi; exit

;(gi => {

  /*! ISC License
   * 
   * Copyright (c) 2017, Andrea Giammarchi, @WebReflection
   * 
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   * 
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
   * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
   * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
   * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
   * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
   * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
   * PERFORMANCE OF THIS SOFTWARE.
   */

  gi.versions.Gtk = '3.0';

  const GLib = gi.GLib;
  const File = gi.Gio.File;
  const PROGRAM_EXE = File.new_for_path(GLib.get_current_dir())
                          .resolve_relative_path(imports.system.programInvocationName);
  const PROGRAM_DIR = getProgramDir(PROGRAM_EXE.get_parent());

  // append project folder (needed to imports.cgjs)
  imports.searchPath.push(PROGRAM_DIR);

  // define shared constants
  Object.defineProperties(
    imports.cgjs.constants,
    {
      // modules that are provided by cgjs (fs, path, ...)
      CORE_MODULES: {value: Object.create(null)},
      // enable some debugging flag
      DEBUG: {value: ARGV.some(arg => arg === '--debug')},
      // the directory separator
      DIR_SEPARATOR: {value: /^\//.test(PROGRAM_EXE) ? '/' : '\\'},
      // frequency to check for running timers (interval, immediate, timeouts)
      IDLE: {value: ARGV.some(arg => /^--idle=(\d+)/.test(arg)) ? (+RegExp.$1 || 1) : 33},
      // list of all available Gtk namespaces
      GTK_MODULES: {value: gi.GIRepository.Repository
                                          .get_default()
                                          .get_loaded_namespaces()},
      // the folder that contains cgjs related files
      PROGRAM_DIR: {value: PROGRAM_DIR},
      // the current executing program
      PROGRAM_EXE: {value: PROGRAM_EXE.get_path()}
    }
  );

  // bootstrap the environment
  imports.cgjs.globals;
  imports.cgjs.require;

  // execute the program
  imports.cgjs.program;

  // basic utility for this scope
  function getProgramDir(dir) {
    switch (dir.get_basename()) {
      case 'bin':
        return dir.get_parent().resolve_relative_path('./lib/node_modules/cgjs').get_path();
      case '.bin':
        return dir.get_parent().resolve_relative_path('cgjs').get_path();
      default:
        return dir.get_path();
    }
  }

})(imports.gi);