interface GTMEvent {
  event: string;
  [key: string]: any;
}

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const pushToDataLayer = (data: GTMEvent) => {
  if (window.dataLayer) {
    window.dataLayer.push(data);
  }
};