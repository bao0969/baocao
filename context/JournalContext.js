import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const JournalContext = createContext();

export const useJournal = () => useContext(JournalContext);

export const JournalProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem('ai_journal_entries');
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch (e) {
      console.log('Lỗi lấy nhật ký:', e);
    }
  };

  const addEntry = useCallback(async (entry) => {
    try {
      setEntries((prev) => {
        const updated = [entry, ...prev];
        AsyncStorage.setItem('ai_journal_entries', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.log('Lỗi thêm nhật ký:', e);
    }
  }, []);

  const deleteEntry = useCallback(async (id) => {
    try {
      setEntries((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        AsyncStorage.setItem('ai_journal_entries', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.log('Lỗi xóa nhật ký:', e);
    }
  }, []);

  const value = {
    entries,
    addEntry,
    deleteEntry,
  };

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
};
