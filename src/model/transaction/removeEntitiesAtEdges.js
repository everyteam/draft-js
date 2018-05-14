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

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type ContentState from 'ContentState';
import type {EntityMap} from 'EntityMap';
import type SelectionState from 'SelectionState';
import type {List} from 'immutable';

const CharacterMetadata = require('CharacterMetadata');

const findRangesImmutable = require('findRangesImmutable');
const invariant = require('invariant');

function removeEntitiesAtEdges(
  contentState: ContentState,
  selectionState: SelectionState,
): ContentState {
  const blockMap = contentState.getBlockMap();
  const entityMap = contentState.getEntityMap();

  const updatedBlocks = {};

  const startKey = selectionState.getStartKey();
  const startOffset = selectionState.getStartOffset();
  const startBlock = blockMap.get(startKey);
  const updatedStart = removeForBlock(entityMap, startBlock, startOffset);

  if (updatedStart !== startBlock) {
    updatedBlocks[startKey] = updatedStart;
  }

  const endKey = selectionState.getEndKey();
  const endOffset = selectionState.getEndOffset();
  let endBlock = blockMap.get(endKey);
  if (startKey === endKey) {
    endBlock = updatedStart;
  }

  const updatedEnd = removeForBlock(entityMap, endBlock, endOffset);

  if (updatedEnd !== endBlock) {
    updatedBlocks[endKey] = updatedEnd;
  }

  if (!Object.keys(updatedBlocks).length) {
    return contentState.set('selectionAfter', selectionState);
  }

  return contentState.merge({
    blockMap: blockMap.merge(updatedBlocks),
    selectionAfter: selectionState,
  });
}

/**
 * Given a list of characters and an offset that is in the middle of an entity,
 * returns the start and end of the entity that is overlapping the offset.
 * Note: This method requires that the offset be in an entity range.
 */
function getRemovalRange(
  characters: List<CharacterMetadata>,
  entityKey: ?string,
  offset: number,
): {
  start: number,
  end: number,
} {
  let removalRange;

  // Iterates through a list looking for ranges of matching items
  // based on the 'isEqual' callback.
  // Then instead of returning the result, call the 'found' callback
  // with each range.
  // Then filters those ranges based on the 'filter' callback
  //
  // Here we use it to find ranges of characters with the same entity key.
  findRangesImmutable(
    characters,
    (a, b) => a.getEntity().intersect(b.getEntity()).size > 0,
    element => element.getEntity().has(entityKey),
    (start, end) => {
      if (start <= offset && end >= offset) {
        // this entity overlaps the offset index
        removalRange = {start, end};
      }
    },
  );
  invariant(
    typeof removalRange === 'object',
    'Removal range must exist within character list.',
  );
  return removalRange;
}

function removeForBlock(
  entityMap: EntityMap,
  block: BlockNodeRecord,
  offset: number,
): BlockNodeRecord {
  let chars = block.getCharacterList();
  const charBefore = offset > 0 ? chars.get(offset - 1) : undefined;
  const charAfter = offset < chars.count() ? chars.get(offset) : undefined;
  const entityBeforeCursor = charBefore ? charBefore.getEntity() : undefined;
  const entityAfterCursor = charAfter ? charAfter.getEntity() : undefined;

  if (entityAfterCursor) {
    entityAfterCursor.forEach(entityKey => {
      if (entityBeforeCursor && entityBeforeCursor.has(entityKey)) {
        const entity = entityMap.get(entityKey);
        if (
          !(
            entity.getMutability() === 'MUTABLE' ||
            entity.getMutability() === 'MUTABLE_INTERIOR'
          )
        ) {
          let {start, end} = getRemovalRange(chars, entityKey, offset);
          let current;
          while (start < end) {
            current = chars.get(start);
            chars = chars.set(
              start,
              CharacterMetadata.removeEntity(current, entityKey),
            );
            start++;
          }
          block = block.set('characterList', chars);
        }
      }
    });
  }

  return block;
}

module.exports = removeEntitiesAtEdges;
