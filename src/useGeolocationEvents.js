import { useEffect, useRef } from 'react';
import useCallbackRef from './useCallbackRef';
import createCbSetterErrorProxy from './utils/createCbSetterErrorProxy';
import geolocationStandardOptions from './utils/geolocationStandardOptions';

/**
 * Returns a frozen object of callback setters to handle the geolocation events.<br/>
 * So far, the supported methods are: `onChange`, invoked when the position changes and `onError`, invoked when
 * an error occur while retrieving the position.<br/>
 * The returned object also contains the `isSupported` boolean flag reporting whether the geolocation API is supported.
 */
const useGeolocationEvents = (options = geolocationStandardOptions) => {
  const watchId = useRef();
  const [onChangeRef, setOnChangeRef] = useCallbackRef();
  const [onErrorRef, setOnErrorRef] = useCallbackRef();
  const isSupported = 'geolocation' in window.navigator; // fixme: shall this be moved outside the hook?

  useEffect(() => {
    const onSuccess = (...args) => {
      if (onChangeRef.current) {
        onChangeRef.current(...args);
      }
    };
    const onError = (...args) => {
      if (onErrorRef.current) {
        onErrorRef.current(...args);
      }
    };

    if (isSupported) {
      watchId.current = window.navigator.geolocation.watchPosition(onSuccess, onError, options);
    }

    return () => {
      if (isSupported) {
        window.navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return !isSupported ? createCbSetterErrorProxy('The Geolocation API is not supported') : Object.freeze({
    isSupported,
    onChange: setOnChangeRef,
    onError: setOnErrorRef,
  });
};

export default useGeolocationEvents;
