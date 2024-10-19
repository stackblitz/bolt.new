import type { FileSystemTree } from '@webcontainer/api';

export const templates = {
  basic: {
    name: "Basic",
    template: {
      'index.js': {
        file: {
          contents: `console.log('Hello, WebContainer!');`,
        },
      },
      'package.json': {
        file: {
          contents: `{
  "name": "webcontainer-project",
  "version": "1.0.0",
  "description": "A basic WebContainer project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}`,
        },
      },
    },
  },
  react: {
    name: "React",
    template: {
      // 定义 React 项目模板
    },
  },
  // 添加更多模板...
};

export type TemplateName = keyof typeof templates;

export async function getInitialTemplate(templateName: TemplateName = 'basic'): Promise<FileSystemTree> {
  return templates[templateName].template;
}
