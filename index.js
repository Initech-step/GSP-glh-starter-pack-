import { registerRootComponent } from 'expo';
import { useAudioPro } from 'react-native-audio-pro';
import { setupAudio } from './src/services/audioSetup';

import App from './App';
// Initialize audio OUTSIDE of React lifecycle
setupAudio();
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
