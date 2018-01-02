/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 * @format
 */

jest.disableAutomock();

const getEntityKeyForSelection = require('getEntityKeyForSelection');
const getSampleStateForTesting = require('getSampleStateForTesting');
const applyEntityToContentState = require('applyEntityToContentState');
const applyEntityToContentBlock = require('applyEntityToContentBlock');

const {contentState, selectionState} = getSampleStateForTesting();

const initialSelectionState = selectionState.merge({
  anchorKey: 'b',
  focusKey: 'b',
});

const COLLAPSED_SELECTION = initialSelectionState.merge({
  anchorOffset: 2,
  focusOffset: 2,
});

const COLLAPSED_SELECTION_ENTITY_END = initialSelectionState.merge({
  anchorOffset: 5,
  focusOffset: 5,
});

const NON_COLLAPSED_SELECTION = initialSelectionState.merge({
  anchorOffset: 2,
  focusKey: 'c',
  focusOffset: 2,
});

const setEntityMutability = mutability => {
  contentState.getEntityMap().get = () => ({
    getMutability: () => mutability,
  });
};

test('must return null at start of block with collapsed selection', () => {
  const key = getEntityKeyForSelection(contentState, initialSelectionState);
  expect(key).toMatchSnapshot();
});

test('must return key if mutable with collapsed selection', () => {
  setEntityMutability('MUTABLE');
  const key = getEntityKeyForSelection(contentState, COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});

test('must not return key if mutable with collapsed selection at end of an entity', () => {
  setEntityMutability('MUTABLE');
  const key = getEntityKeyForSelection(
    contentState,
    COLLAPSED_SELECTION_ENTITY_END,
  );
  expect(key).toMatchSnapshot();
});

test('must not return key if immutable with collapsed selection', () => {
  setEntityMutability('IMMUTABLE');
  const key = getEntityKeyForSelection(contentState, COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});

test('must not return key if segmented with collapsed selection', () => {
  setEntityMutability('SEGMENTED');
  const key = getEntityKeyForSelection(contentState, COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});

test('must return null if start is at end of block', () => {
  const startsAtEnd = NON_COLLAPSED_SELECTION.merge({
    anchorOffset: contentState.getBlockForKey('b').getLength(),
  });
  const key = getEntityKeyForSelection(contentState, startsAtEnd);
  expect(key).toMatchSnapshot();
});

test('must return key if mutable', () => {
  setEntityMutability('MUTABLE');
  const key = getEntityKeyForSelection(contentState, NON_COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});

test('must not return key if immutable', () => {
  setEntityMutability('IMMUTABLE');
  const key = getEntityKeyForSelection(contentState, NON_COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});

test('must not return key if segmented', () => {
  setEntityMutability('SEGMENTED');
  const key = getEntityKeyForSelection(contentState, NON_COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});

test('must return key if mutable_interior', () => {
  setEntityMutability('MUTABLE_INTERIOR');
  var key = getEntityKeyForSelection(contentState, COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});

test('must not return key if mutable_interior and on edge', () => {
  setEntityMutability('MUTABLE_INTERIOR');

  var front = selectionState.merge({
    anchorOffset: 0,
    focusOffset: 0,
    anchorKey: 'b',
    focusKey: 'b',
  });
  var key = getEntityKeyForSelection(contentState, front);
  expect(key).toMatchSnapshot();

  var end = selectionState.merge({
    anchorOffset: 5,
    focusOffset: 5,
    anchorKey: 'b',
    focusKey: 'b',
  });
  var key = getEntityKeyForSelection(contentState, end);
  expect(key).toMatchSnapshot();

  const newContentState = contentState.merge({
    blockMap: contentState.blockMap.set(
      'b',
      applyEntityToContentBlock(
        applyEntityToContentBlock(
          contentState.getBlockForKey('b'),
          0,
          1,
          '123',
          false,
        ),
        4,
        5,
        '123',
        false,
      ),
    ),
  });

  var front = selectionState.merge({
    anchorOffset: 1,
    focusOffset: 1,
    anchorKey: 'b',
    focusKey: 'b',
  });
  var key = getEntityKeyForSelection(newContentState, front);
  expect(key).toMatchSnapshot();

  var end = selectionState.merge({
    anchorOffset: 4,
    focusOffset: 4,
    anchorKey: 'b',
    focusKey: 'b',
  });
  var key = getEntityKeyForSelection(newContentState, end);
  expect(key).toMatchSnapshot();
});

test('must return mutable_interior key across previous and next blocks', () => {
  setEntityMutability('MUTABLE_INTERIOR');

  var entityRange = selectionState.merge({
    anchorOffset: 4,
    focusOffset: 1,
    anchorKey: 'a',
    focusKey: 'b',
  });

  var newContentState = applyEntityToContentState(
    contentState,
    entityRange,
    '123',
    true,
  );

  var cursor = selectionState.merge({
    anchorOffset: 0,
    focusOffset: 0,
    anchorKey: 'b',
    focusKey: 'b',
  });
  var key = getEntityKeyForSelection(newContentState, cursor);
  expect(key).toMatchSnapshot();

  cursor = selectionState.merge({
    anchorOffset: 5,
    focusOffset: 5,
    anchorKey: 'a',
    focusKey: 'a',
  });
  var key = getEntityKeyForSelection(newContentState, cursor);
  expect(key).toMatchSnapshot();
});

test('must return key if mutable_interior', () => {
  setEntityMutability('MUTABLE_INTERIOR');
  var key = getEntityKeyForSelection(contentState, NON_COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});

test('must return key if the start is at the end of a block and the entity is mutable_interior', () => {
  setEntityMutability('MUTABLE_INTERIOR');

  var entityRange = selectionState.merge({
    anchorOffset: 4,
    focusOffset: 1,
    anchorKey: 'b',
    focusKey: 'c',
  });

  var newContentState = applyEntityToContentState(
    contentState,
    entityRange,
    '123',
    true,
  );

  var cursor = NON_COLLAPSED_SELECTION.merge({
    anchorOffset: 4,
    focusOffset: 2,
    anchorKey: 'b',
    focusKey: 'c',
  });
  var key = getEntityKeyForSelection(newContentState, cursor);
  expect(key).toMatchSnapshot();
});
