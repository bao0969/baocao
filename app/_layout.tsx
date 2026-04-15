import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '../context/AuthContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { MusicProvider } from '../context/MusicContext';
import { StatsProvider } from '../context/StatsContext';
import { ThemeProvider as AppThemeProvider } from '../context/ThemeContext';
import { JournalProvider } from '../context/JournalContext';
import LoginModal from '../components/LoginModal';

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <AppThemeProvider>
        <StatsProvider>
          <AuthProvider>
            <MusicProvider>
              <FavoritesProvider>
                <JournalProvider>
                  <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="player"
                      options={{
                        headerShown: false,
                        presentation: 'containedModal',
                        animation: 'slide_from_bottom',
                      }}
                    />
                    <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                  </Stack>
                  <StatusBar style="light" />
                  <LoginModal />
                </JournalProvider>
              </FavoritesProvider>
            </MusicProvider>
          </AuthProvider>
        </StatsProvider>
      </AppThemeProvider>
    </ThemeProvider>
  );
}
