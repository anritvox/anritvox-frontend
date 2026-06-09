import React, { createContext, useState, useEffect, useContext } from 'react';
import { settings as settingsApi } from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {

        const res = await settingsApi.getPublic();
        const data = res.data;
        setSettings(data.settings || data);
      } catch (error) {

        setSettings({});
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
