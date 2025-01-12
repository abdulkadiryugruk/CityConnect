import { createRef } from 'react';

export const navigationRef = createRef();

export const NavigationService = {
  navigate(name, params) {
    navigationRef.current?.navigate(name, params);
  }
};