import { describe, expect, it } from 'vitest';
import { StreamingMessageParser } from './message-parser';

describe('StreamingMessageParser', () => {
  it('should pass through normal text', () => {
    const parser = new StreamingMessageParser();
    expect(parser.parse('test_id', 'Hello, world!')).toBe('Hello, world!');
  });

  it('should allow normal HTML tags', () => {
    const parser = new StreamingMessageParser();
    expect(parser.parse('test_id', 'Hello <strong>world</strong>!')).toBe('Hello <strong>world</strong>!');
  });

  it.each([
    ['Foo bar', 'Foo bar'],
    ['Foo bar <', 'Foo bar '],
    ['Foo bar <p', 'Foo bar <p'],
    ['Foo bar <b', 'Foo bar '],
    ['Foo bar <ba', 'Foo bar <ba'],
    ['Foo bar <bol', 'Foo bar '],
    ['Foo bar <bolt', 'Foo bar '],
    ['Foo bar <bolta', 'Foo bar <bolta'],
    ['Foo bar <boltA', 'Foo bar '],
    ['Some text before <boltArtifact>foo</boltArtifact> Some more text', 'Some text before  Some more text'],
    [['Some text before <boltArti', 'fact>foo</boltArtifact> Some more text'], 'Some text before  Some more text'],
    [['Some text before <boltArti', 'fac', 't>foo</boltArtifact> Some more text'], 'Some text before  Some more text'],
    [['Some text before <boltArti', 'fact>fo', 'o</boltArtifact> Some more text'], 'Some text before  Some more text'],
    [
      ['Some text before <boltArti', 'fact>fo', 'o', '<', '/boltArtifact> Some more text'],
      'Some text before  Some more text',
    ],
    [
      ['Some text before <boltArti', 'fact>fo', 'o<', '/boltArtifact> Some more text'],
      'Some text before  Some more text',
    ],
    ['Before <oltArtfiact>foo</boltArtifact> After', 'Before <oltArtfiact>foo</boltArtifact> After'],
    ['Before <boltArtifactt>foo</boltArtifact> After', 'Before <boltArtifactt>foo</boltArtifact> After'],
    ['Before <boltArtifact title="Some title">foo</boltArtifact> After', 'Before  After'],
    [
      'Before <boltArtifact title="Some title"><boltAction type="shell">npm install</boltAction></boltArtifact> After',
      'Before  After',
      [{ type: 'shell', content: 'npm install' }],
    ],
    [
      'Before <boltArtifact title="Some title"><boltAction type="shell">npm install</boltAction><boltAction type="file" path="index.js">some content</boltAction></boltArtifact> After',
      'Before  After',
      [
        { type: 'shell', content: 'npm install' },
        { type: 'file', path: 'index.js', content: 'some content\n' },
      ],
    ],
  ])('should correctly parse chunks and strip out bolt artifacts', (input, expected, expectedActions = []) => {
    let actionCounter = 0;

    const testId = 'test_id';

    const parser = new StreamingMessageParser({
      artifactElement: '',
      callbacks: {
        onAction: (id, action) => {
          expect(testId).toBe(id);
          expect(action).toEqual(expectedActions[actionCounter]);
          actionCounter++;
        },
      },
    });

    let message = '';

    let result = '';

    const chunks = Array.isArray(input) ? input : input.split('');

    for (const chunk of chunks) {
      message += chunk;

      result += parser.parse(testId, message);
    }

    expect(actionCounter).toBe(expectedActions.length);
    expect(result).toEqual(expected);
  });
});
