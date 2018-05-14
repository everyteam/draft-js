/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow
 */

'use strict';

import type ContentBlock from 'ContentBlock';
import type {DraftEntitySet} from 'DraftEntitySet';
import type {BlockNodeRecord} from 'BlockNodeRecord';
import type {EntityRange} from 'EntityRange';
import type {List} from 'immutable';

const UnicodeUtils = require('UnicodeUtils');

const findRangesImmutable = require('findRangesImmutable');

const areEqual = (a, b) => a === b;
const isTruthy = a => !!a;

/**
 * Helper function for getting encoded entities for each entity. Convert
 * to UTF-8 character counts for storage.
 */
function getEncodedEntitiesForKey(
  block: ContentBlock,
  entities: List<DraftEntitySet>,
  entityKey: string,
): Array<EntityRange> {
  const ranges = [];

  // Obtain an array with ranges for only the specified key.
  const filteredInlines = entities.map(e => e.has(entityKey)).toList();

  findRangesImmutable(
    filteredInlines,
    areEqual,
    // We only want to keep ranges with nonzero entity values.
    isTruthy,
    (start, end) => {
      const text = block.getText();
      ranges.push({
        offset: UnicodeUtils.strlen(text.slice(0, start)),
        length: UnicodeUtils.strlen(text.slice(start, end)),
        key: entityKey,
      });
    },
  );

  return ranges;
}

/*
 * Retrieve the encoded arrays of entities, with each entity
 * treated separately.
 */
function encodeEntityRanges(block: ContentBlock): Array<EntityRange> {
  var entities = block
    .getCharacterList()
    .map(c => c.getEntity())
    .toList();

  var ranges = entities
    .flatten()
    .toSet()
    .map(key => getEncodedEntitiesForKey(block, entities, key));

  return Array.prototype.concat.apply([], ranges.toJS());
}

module.exports = encodeEntityRanges;
