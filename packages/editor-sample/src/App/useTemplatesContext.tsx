import React from 'react';

import { Config } from '../main';

export const TemplatesContext = React.createContext<Config['templates']>(undefined);

export const TemplatesProvider = ({ children, value }: { children: React.ReactNode; value: Config['templates'] }) => {
  return <TemplatesContext.Provider value={value}>{children}</TemplatesContext.Provider>;
};
