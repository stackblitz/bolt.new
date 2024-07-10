import { WebContainer } from '@webcontainer/api';

interface WebContainerContext {
  loaded: boolean;
}

export const webcontainerContext: WebContainerContext = import.meta.hot?.data.webcontainerContext ?? {
  loaded: false,
};

if (import.meta.hot) {
  import.meta.hot.data.webcontainerContext = webcontainerContext;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for ssr
});

if (!import.meta.env.SSR) {
  webcontainer =
    import.meta.hot?.data.webcontainer ??
    Promise.resolve()
      .then(() => WebContainer.boot({ workdirName: 'project' }))
      .then(() => {
        webcontainerContext.loaded = true;
      });

  if (import.meta.hot) {
    import.meta.hot.data.webcontainer = webcontainer;
  }
}
