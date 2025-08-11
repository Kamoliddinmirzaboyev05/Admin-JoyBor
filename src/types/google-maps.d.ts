declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        Geocoder: any;
        Animation: {
          DROP: any;
          BOUNCE: any;
        };
        Size: any;
        Point: any;
        MapMouseEvent: any;
      };
    };
    googleMapsLoaded: boolean;
    initGoogleMaps: () => void;
  }
}

export {};