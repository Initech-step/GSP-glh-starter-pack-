import { View, useWindowDimensions } from "react-native";
import React, { useEffect, useState } from 'react';
import Pdf from "react-native-pdf";
import { loadPDFById } from '../utils/storage'


export default function ReadBook({ route, navigation }) {
    const { width, height } = useWindowDimensions();
    const { book, title } = route.params;
    const [pdfUri, setPdfUri] = useState(null);

    useEffect(() => {
        let mounted = true;
    
        const loadPath = async () => {
          const path = await loadPDFById(book.id);
          if (mounted) setPdfUri(path);
        };
        loadPath();

        return () => { mounted = false };

      }, [book.id]);

    return (
        <View style={{ flex: 1 }}>
        <Pdf
            source={
                {
                    uri: pdfUri,
                    cache: true,
                }
            }
            style={{ flex: 1, width, height }}
        />
        </View>
    );
}