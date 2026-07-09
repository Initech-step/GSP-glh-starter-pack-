import { View, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import Pdf from 'react-native-pdf';

import { loadPDFById } from '../utils/storage';
import { useTheme } from '../theme';

export default function ReadBook({ route }) {
  const { width, height } = useWindowDimensions();
  const { book } = route.params;
  const [pdfUri, setPdfUri] = useState(null);
  const { colors } = useTheme();

  useEffect(() => {
    let mounted = true;

    const loadPath = async () => {
      const path = await loadPDFById(book.id);
      if (mounted) setPdfUri(path);
    };
    loadPath();

    return () => {
      mounted = false;
    };
  }, [book.id]);

  // Mounting <Pdf> with a null uri makes react-native-pdf throw, so hold a
  // themed spinner until the path resolves.
  if (!pdfUri) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Pdf source={{ uri: pdfUri, cache: true }} style={{ flex: 1, width, height }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
