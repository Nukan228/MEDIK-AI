import "@rork/polyfills";
import { BundleInspector } from '@rork/inspector';
import { RorkSafeInsets } from '@rork/safe-insets';
import { RorkErrorBoundary } from '@rork/rork-error-boundary';
// Import polyfills first
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import '@/lib/polyfills';

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MedicalProvider } from "@/hooks/medical-store";
import { AuthProvider } from "@/hooks/auth-store";
import { PharmacyProvider } from "@/hooks/pharmacy-store";
import { LanguageContext } from "@/hooks/language-store";
import { AppointmentContext } from "@/hooks/appointment-store";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Назад" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="history" options={{ title: "Health History" }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <LanguageContext>
      <AuthProvider>
        <AppointmentContext>
          <PharmacyProvider>
            <MedicalProvider>
              <GestureHandlerRootView style={styles.container}>
                <BundleInspector><RorkSafeInsets><RorkErrorBoundary><RootLayoutNav /></RorkErrorBoundary></RorkSafeInsets></BundleInspector>
              </GestureHandlerRootView>
            </MedicalProvider>
          </PharmacyProvider>
        </AppointmentContext>
      </AuthProvider>
    </LanguageContext>
  );
}