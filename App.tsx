import 'react-native-url-polyfill/auto';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, View, NativeEventEmitter, NativeModules, Text } from 'react-native';
import BottomTabNavigation from './src/Navigation/BottomTabNavigation';
import tailwind from 'twrnc';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import { useUser } from './src/Context/UserContext';
import StandardHeader from './src/Components/Headers/StandardHeader';

const { RNPushNotificationIOS } = NativeModules;
const iOSNotificationEmitter = RNPushNotificationIOS ? new NativeEventEmitter(RNPushNotificationIOS) : null;

function App(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); 
  const [isLoading, setIsLoading] = useState(true); 

  const { currentProfile, getUserActivity, getUserListPending, getUserFriendsPending } = useUser();
  
  useEffect(() => {
    setupNotifications();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      PushNotification.localNotification({
        channelId: 'default-channel-id',
        title: remoteMessage.notification?.title,
        message: remoteMessage.notification?.body,
        userInfo: remoteMessage.data,
      });
    });

    // Handle background and quit notifications
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
    });

    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification
      );
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification
          );
        }
      });

    return () => {
      unsubscribe();
    };
  }, []);

  const setupNotifications = async () => {
    if (Platform.OS === 'ios') {
      try {
        const permission = await PushNotificationIOS.requestPermissions();
        console.log('iOS Push Notification Permissions:', permission);
      } catch (err) {
        console.error('Error requesting iOS permissions:', err);
      }
    }

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'default-channel-id',
          channelName: 'Default Channel',
          channelDescription: 'A default channel',
          playSound: false,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`createChannel returned '${created}'`)
      );
    }
  };

  return(
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={tailwind`h-full w-full`}>
        <SafeAreaView style={tailwind`flex-1 bg-slate-950`}>
          <BottomTabNavigation />
        </SafeAreaView>
        <View style={tailwind`h-9 bg-white`} />
      </View>
    </GestureHandlerRootView>
  )
}

export default App;
