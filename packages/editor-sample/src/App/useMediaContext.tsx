import React from 'react';

import { Config } from '../main';

export const MediaContext = React.createContext<Config['media']>(undefined);

export const MediaProvider = ({ children, value }: { children: React.ReactNode; value: Config['media'] }) => {
  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
