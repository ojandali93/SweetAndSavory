import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { Activity, Bookmark, BookOpen, Globe, Grid, Home, List, Menu, Plus, PlusSquare, Search, User } from 'react-native-feather';
import { View } from 'react-native';
import SearchScreen from '../Screens/Search/SearchScreen'
import LoginScreen from '../Screens/Authentication/LoginScreen';
import AuthStackNavigation from './AuthStackNavigation';
import ProfileStackNavigation from './ProfileStackNavigation';
import FeedStackNavigation from './FeedStackNavigation';
import ExploreScreen from '../Screens/Explore/ExploreScreen';
import ExploreStackNavigation from './ExploreStackNavigation';
import ListStackNavigation from './ListStackNavigation';
import SearchStackNavigation from './SearchStackNavigation';

const Tab = createBottomTabNavigator();

const BottomTabNavigation = () => {
  const linking: LinkingOptions = {
    enabled: true,
    prefixes: ['sweetandsavory://'],
    config: {
      screens: {
        Feed: {
          screens: {
            ResetPasswordScreen: {
              path: 'reset-password',
              parse: {
                token: (token: string) => `${token}`,
                email: (email: string) => `${email}`,
              },
            },
          },
        },
        Lists: 'lists',
        Explore: 'explore',
        Profile: 'profile',
      },
    },
  };
  
  

  return (
    <NavigationContainer linking={linking}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: 'black',
          tabBarInactiveTintColor: 'gray',
        }}
      >


        <Tab.Screen
          name="Feed"
          component={FeedStackNavigation}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 30, height: 3, backgroundColor: focused ? 'blue' : 'white', marginBottom: 5 }} />
                <Home stroke={focused ? 'black' : 'gray'} height={22} width={22} />
              </View>
            ),
          }}
        />   

        <Tab.Screen
          name="Lists"
          component={ListStackNavigation}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 30, height: 3, backgroundColor: focused ? 'blue' : 'white', marginBottom: 5 }} />
                <Grid stroke={focused ? 'black' : 'gray'} height={22} width={22} />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Recipes"
          component={SearchStackNavigation}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 30, height: 3, backgroundColor: focused ? 'blue' : 'white', marginBottom: 5 }} />
                <Search stroke={focused ? 'black' : 'gray'} height={22} width={22} />
              </View>
            ),
          }}
        />  

        <Tab.Screen
          name="Explore"
          component={ExploreStackNavigation}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 30, height: 3, backgroundColor: focused ? 'blue' : 'white', marginBottom: 5 }} />
                <Globe stroke={focused ? 'black' : 'gray'} height={22} width={22} />
              </View>
            ),
          }}
        />     

        <Tab.Screen
          name="Profile"
          component={ProfileStackNavigation}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 30, height: 3, backgroundColor: focused ? 'blue' : 'white', marginBottom: 5 }} />
                <User stroke={focused ? 'black' : 'gray'} height={22} width={22} />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default BottomTabNavigation;
