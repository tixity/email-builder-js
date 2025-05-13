import React from 'react';
import { Config } from '../main';

export const EventsContext = React.createContext<Config['events']>(undefined);

export const EventsProvider = ({ children, value }: { children: React.ReactNode; value: Config['events'] }) => {
  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};
