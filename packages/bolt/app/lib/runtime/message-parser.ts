const ARTIFACT_TAG_OPEN = '<boltArtifact';
const ARTIFACT_TAG_CLOSE = '</boltArtifact>';
const ARTIFACT_ACTION_TAG_OPEN = '<boltAction';
const ARTIFACT_ACTION_TAG_CLOSE = '</boltAction>';

interface BoltArtifact {
  title: string;
}

type ArtifactOpenCallback = (messageId: string, artifact: BoltArtifact) => void;
type ArtifactCloseCallback = (messageId: string) => void;
type ActionCallback = (messageId: string, action: BoltActionData) => void;

type ActionType = 'file' | 'shell';

export interface BoltActionData {
  type?: ActionType;
  path?: string;
  content: string;
}

interface Callbacks {
  onArtifactOpen?: ArtifactOpenCallback;
  onArtifactClose?: ArtifactCloseCallback;
  onAction?: ActionCallback;
}

type ElementFactory = () => string;

interface StreamingMessageParserOptions {
  callbacks?: Callbacks;
  artifactElement?: string | ElementFactory;
}

export class StreamingMessageParser {
  #lastPositions = new Map<string, number>();
  #insideArtifact = false;
  #insideAction = false;
  #currentAction: BoltActionData = { content: '' };

  constructor(private _options: StreamingMessageParserOptions = {}) {}

  parse(id: string, input: string) {
    let output = '';
    let i = this.#lastPositions.get(id) ?? 0;
    let earlyBreak = false;

    while (i < input.length) {
      if (this.#insideArtifact) {
        if (this.#insideAction) {
          const closeIndex = input.indexOf(ARTIFACT_ACTION_TAG_CLOSE, i);

          if (closeIndex !== -1) {
            this.#currentAction.content += input.slice(i, closeIndex);

            let content = this.#currentAction.content.trim();

            if (this.#currentAction.type === 'file') {
              content += '\n';
            }

            this.#currentAction.content = content;

            this._options.callbacks?.onAction?.(id, this.#currentAction);

            this.#insideAction = false;
            this.#currentAction = { content: '' };

            i = closeIndex + ARTIFACT_ACTION_TAG_CLOSE.length;
          } else {
            break;
          }
        } else {
          const actionOpenIndex = input.indexOf(ARTIFACT_ACTION_TAG_OPEN, i);
          const artifactCloseIndex = input.indexOf(ARTIFACT_TAG_CLOSE, i);

          if (actionOpenIndex !== -1 && (artifactCloseIndex === -1 || actionOpenIndex < artifactCloseIndex)) {
            const actionEndIndex = input.indexOf('>', actionOpenIndex);

            if (actionEndIndex !== -1) {
              const actionTag = input.slice(actionOpenIndex, actionEndIndex + 1);
              this.#currentAction.type = this.#extractAttribute(actionTag, 'type') as ActionType;
              this.#currentAction.path = this.#extractAttribute(actionTag, 'path');
              this.#insideAction = true;
              i = actionEndIndex + 1;
            } else {
              break;
            }
          } else if (artifactCloseIndex !== -1) {
            this.#insideArtifact = false;

            this._options.callbacks?.onArtifactClose?.(id);

            i = artifactCloseIndex + ARTIFACT_TAG_CLOSE.length;
          } else {
            break;
          }
        }
      } else if (input[i] === '<' && input[i + 1] !== '/') {
        let j = i;
        let potentialTag = '';

        while (j < input.length && potentialTag.length < ARTIFACT_TAG_OPEN.length) {
          potentialTag += input[j];

          if (potentialTag === ARTIFACT_TAG_OPEN) {
            const nextChar = input[j + 1];

            if (nextChar && nextChar !== '>' && nextChar !== ' ') {
              output += input.slice(i, j + 1);
              i = j + 1;
              break;
            }

            const openTagEnd = input.indexOf('>', j);

            if (openTagEnd !== -1) {
              const artifactTag = input.slice(i, openTagEnd + 1);

              const artifactTitle = this.#extractAttribute(artifactTag, 'title') as string;

              this.#insideArtifact = true;

              this._options.callbacks?.onArtifactOpen?.(id, { title: artifactTitle });

              output += this._options.artifactElement ?? `<div class="__boltArtifact__" data-message-id="${id}"></div>`;

              i = openTagEnd + 1;
            } else {
              earlyBreak = true;
            }

            break;
          } else if (!ARTIFACT_TAG_OPEN.startsWith(potentialTag)) {
            output += input.slice(i, j + 1);
            i = j + 1;
            break;
          }

          j++;
        }

        if (j === input.length && ARTIFACT_TAG_OPEN.startsWith(potentialTag)) {
          break;
        }
      } else {
        output += input[i];
        i++;
      }

      if (earlyBreak) {
        break;
      }
    }

    this.#lastPositions.set(id, i);

    return output;
  }

  reset() {
    this.#lastPositions.clear();
    this.#insideArtifact = false;
    this.#insideAction = false;
    this.#currentAction = { content: '' };
  }

  #extractAttribute(tag: string, attributeName: string): string | undefined {
    const match = tag.match(new RegExp(`${attributeName}="([^"]*)"`, 'i'));
    return match ? match[1] : undefined;
  }
}
