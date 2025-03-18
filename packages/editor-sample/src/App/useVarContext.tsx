import React from 'react';
import { Config } from '../main';

export const VarContext = React.createContext<Config['vars']>(undefined);

export const VarProvider = ({ children, value }: { children: React.ReactNode; value: Config['vars'] }) => {
  return <VarContext.Provider value={value}>{children}</VarContext.Provider>;
};
