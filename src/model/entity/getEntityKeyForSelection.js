/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEntityKeyForSelection
 * @format
 * @flow
 */

'use strict';

import type ContentState from 'ContentState';
import type {EntityMap} from 'EntityMap';
import type SelectionState from 'SelectionState';
import type {DraftEntitySet} from 'DraftEntitySet';
import type {DraftMutabilityType} from 'DraftMutabilityType';
import {NONE} from 'DraftEntitySet';

/**
 * Return the entity key that should be used when inserting text for the
 * specified target selection, only if the entity is `MUTABLE` or potentially `MUTABLE_INTERIOR`.
 * `IMMUTABLE` and `SEGMENTED` entities should not be used for insertion behavior.
 */
function getEntityKeyForSelection(
  contentState: ContentState,
  targetSelection: SelectionState,
): DraftEntitySet {
  var blockOffset = targetSelection.getStartOffset();

  var block = contentState.getBlockForKey(targetSelection.getStartKey());

  var keys = NONE;

  var getMutableKeys = true;

  if (targetSelection.isCollapsed()) {
    if (blockOffset === 0) {
      block = contentState.getBlockBefore(block.getKey());
      if (block == null) {
        return null;
      }
      blockOffset = block.getLength();
      getMutableKeys = false;
    }

    blockOffset = blockOffset - 1;
  } else {
    if (blockOffset === block.getLength()) {
      getMutableKeys = false;
    }
  }

  if (getMutableKeys) {
    const offsetKeys = filterKeys(
      contentState.getEntityMap(),
      block.getEntityAt(blockOffset),
      'MUTABLE',
    );

    const nextOffsetKeys = filterKeys(
      contentState.getEntityMap(),
      block.getEntityAt(blockOffset + 1),
      'MUTABLE',
    );

    keys = keys.union(offsetKeys.intersect(nextOffsetKeys));
  }

  // now find potential MUTABLE_INTERIOR keys.
  var mutableInteriorKeys = filterKeys(
    contentState.getEntityMap(),
    block.getEntityAt(blockOffset),
    'MUTABLE_INTERIOR',
  );

  if (mutableInteriorKeys.size > 0) {
    blockOffset = blockOffset + 1;
    if (blockOffset >= block.getLength()) {
      block = contentState.getBlockAfter(block.getKey());
      blockOffset = 0;
    }

    if (block != null) {
      var nextOffsetEntityKeys = block.getEntityAt(blockOffset);
      var nextOffsetMutableInteriorKeys = filterKeys(
        contentState.getEntityMap(),
        nextOffsetEntityKeys,
        'MUTABLE_INTERIOR',
      );

      mutableInteriorKeys = nextOffsetMutableInteriorKeys.intersect(
        mutableInteriorKeys,
      );

      keys = keys.union(mutableInteriorKeys);
    }
  }

  if (keys.size > 0) {
    return keys;
  }

  return null;
}

/**
 * Determine whether any entity keys correspond to a specific mutability type.
 */
function filterKeys(
  entityMap: EntityMap,
  entityKeys: DraftEntitySet,
  mutabilityType: DraftMutabilityType,
): DraftEntitySet {
  if (entityKeys && entityKeys.size > 0) {
    var filteredKeys = entityKeys
      .map(key => {
        var entity = entityMap.get(key);
        return entity.getMutability() === mutabilityType ? key : null;
      })
      .filter(x => x);

    if (filteredKeys.size > 0) {
      return filteredKeys;
    }
  }
  return NONE;
}

module.exports = getEntityKeyForSelection;
