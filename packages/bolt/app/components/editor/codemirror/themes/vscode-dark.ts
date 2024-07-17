import { HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

export const vscodeDarkTheme = HighlightStyle.define([
  {
    tag: [
      tags.keyword,
      tags.operatorKeyword,
      tags.modifier,
      tags.color,
      tags.constant(tags.name),
      tags.standard(tags.name),
      tags.standard(tags.tagName),
      tags.special(tags.brace),
      tags.atom,
      tags.bool,
      tags.special(tags.variableName),
    ],
    color: '#569cd6',
  },
  {
    tag: [tags.controlKeyword, tags.moduleKeyword],
    color: '#c586c0',
  },
  {
    tag: [
      tags.name,
      tags.deleted,
      tags.character,
      tags.macroName,
      tags.propertyName,
      tags.variableName,
      tags.labelName,
      tags.definition(tags.name),
    ],
    color: '#9cdcfe',
  },
  { tag: tags.heading, fontWeight: 'bold', color: '#9cdcfe' },
  {
    tag: [
      tags.typeName,
      tags.className,
      tags.tagName,
      tags.number,
      tags.changed,
      tags.annotation,
      tags.self,
      tags.namespace,
    ],
    color: '#4ec9b0',
  },
  {
    tag: [tags.function(tags.variableName), tags.function(tags.propertyName)],
    color: '#dcdcaa',
  },
  { tag: [tags.number], color: '#b5cea8' },
  {
    tag: [tags.operator, tags.punctuation, tags.separator, tags.url, tags.escape, tags.regexp],
    color: '#d4d4d4',
  },
  {
    tag: [tags.regexp],
    color: '#d16969',
  },
  {
    tag: [tags.special(tags.string), tags.processingInstruction, tags.string, tags.inserted],
    color: '#ce9178',
  },
  { tag: [tags.angleBracket], color: '#808080' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: [tags.meta, tags.comment], color: '#6a9955' },
  { tag: tags.link, color: '#6a9955', textDecoration: 'underline' },
  { tag: tags.invalid, color: '#ff0000' },
]);
