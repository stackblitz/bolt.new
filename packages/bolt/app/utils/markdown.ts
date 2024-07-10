import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import type { PluggableList } from 'unified';

export const remarkPlugins = [remarkGfm] satisfies PluggableList;
export const rehypePlugins = [rehypeRaw] satisfies PluggableList;
