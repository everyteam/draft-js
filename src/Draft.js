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

const AtomicBlockUtils = require('AtomicBlockUtils');
const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const CompositeDraftDecorator = require('CompositeDraftDecorator');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');
const DefaultDraftInlineStyle = require('DefaultDraftInlineStyle');
const DraftEditor = require('DraftEditor.react');
const DraftEditorBlock = require('DraftEditorBlock.react');
const DraftModifier = require('DraftModifier');
const DraftEntityInstance = require('DraftEntityInstance');
const EditorState = require('EditorState');
const KeyBindingUtil = require('KeyBindingUtil');
const RichTextEditorUtil = require('RichTextEditorUtil');
const SelectionState = require('SelectionState');

const convertFromDraftStateToRaw = require('convertFromDraftStateToRaw');
const convertFromRawToDraftState = require('convertFromRawToDraftState');
const generateRandomKey = require('generateRandomKey');
const getDefaultKeyBinding = require('getDefaultKeyBinding');
const getVisibleSelectionRect = require('getVisibleSelectionRect');
const gkx = require('gkx');

const convertFromHTML = gkx('draft_refactored_html_importer')
  ? require('convertFromHTMLToContentBlocks2')
  : require('convertFromHTMLToContentBlocks');

const DraftPublic = {
  Editor: DraftEditor,
  EditorBlock: DraftEditorBlock,
  EditorState,

  CompositeDecorator: CompositeDraftDecorator,
  EntityInstance: DraftEntityInstance,

  BlockMapBuilder,
  CharacterMetadata,
  ContentBlock,
  ContentState,
  SelectionState,

  AtomicBlockUtils,
  KeyBindingUtil,
  Modifier: DraftModifier,
  RichUtils: RichTextEditorUtil,

  DefaultDraftBlockRenderMap,
  DefaultDraftInlineStyle,

  convertFromHTML,
  convertFromRaw: convertFromRawToDraftState,
  convertToRaw: convertFromDraftStateToRaw,
  genKey: generateRandomKey,
  getDefaultKeyBinding,
  getVisibleSelectionRect,
};

module.exports = DraftPublic;
