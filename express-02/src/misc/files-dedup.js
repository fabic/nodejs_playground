/**
 * @flow
 */

'use strict'

let assert = require('assert')

import { Finder } from './finder'

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * @constructor
 */
export function Dedup() {
}

/**
 * (Class method)
 *
 * @param rootdir {string}
 * @param regx    {RegExp}
 *
 * @returns {{files: File[], subsets: Array}}
 */
Dedup.find = function _dedup_find(rootdir :string, regx :RegExp) {
  let files = Finder.find(rootdir, regx)

  //cli.info("Got " + files.length + " files. Sorting by size now.")

  // Sort files by size (and file path).
  files.sort((item1, item2) => {
    let sz = item1.stats.size - item2.stats.size
    return sz != 0 ? sz : (
      item1.path.localeCompare(item2.path)
      )
  })

  // Partition the set of files into subsets of files that have the same size.

  // todo: if files not empty...
  assert(files.length > 0, "TODO: dude -_- wtf ?")

  let currentSet = [ files[0] ]
  let currentSize = files[0].stats.size
  let subsets = []; // output val.

  for (let i=1; i<files.length; i++) {
    const file = files[i]

    // Collect consecutive files with same size.
    if (file.stats.size == currentSize) {
      currentSet.push( file )
      continue
    }

    //
    // (else {...}) => we've got one file(s) set => process it.
    //

    // MAINT.: Code guard for futur maintenance on this non-trivial loop.
    //         (i.e. current file(s) set may not be empty).
    if (currentSet.length == 0) {
      assert.fail(currentSet.length, 0, "Can't be!", '>'); // would throw ex.!
      break
    }
    // Silently skip lone files (unique size).
    else if (currentSet.length == 1) {
      /* noop */
    }
    // Actual files set processing.
    else {
      subsets.push( currentSet )
    }

    // ^ done processing current files set.

    // Start over with a fresh file set.
    currentSize = file.stats.size
    currentSet = [ file ]
  } // files set iter. //

  return {
    files,
    subsets
  }
} // _dedup_find() //
