import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../Screens/Authentication/LoginScreen';
import SignupScreen from '../Screens/Authentication/SignupScreen';
import ProfileSetupScreen from '../Screens/Authentication/ProfileSetupScreen';
import FeedScreen from '../Screens/Feed/FeedScreen';
import CreateRecipeScreen from '../Screens/Recipes/CreateRecipeScreen';
import SingleRecipeScreen from '../Screens/Recipes/SingleRecipeScreen';
import ProfileScreen from '../Screens/Profile/ProfileScreen';
import SelectedProfileScreen from '../Screens/Profile/SelectedProfileScreen';
import AddRecipeToList from '../Screens/Recipes/AddRecipeToList';
import FavoritesScreen from '../Screens/Feed/FavoritesScreen';
import NotificationScreen from '../Screens/Feed/NotificationScreen';
import ResetPasswordScreen from '../Screens/Authentication/ResetPasswordScreen';
import ShareScreen from '../Screens/Feed/ShareScreen';
import SingleShareScreen from '../Screens/Feed/SingleShareScreen';

export type FeedStackParamList = {
  FeedScreen: undefined;
  SingleRecipeScreen: {recipe: any};
  CreateRecipeScreen: undefined;
  LoginScreen: undefined;
  SignupScreen: undefined;
  ProfileSetupScreen: undefined;
  SelectedProfileScreen: {user_id: string};
  AddRecipeToList: {recipe_id: number};
  FavoritesScreen: undefined;
  NotificationScreen: undefined;
  ResetPasswordScreen: {email: string, token: string}
  ShareScreen: undefined
  SingleShareScreen: {username: string, item: any}
};

const StackNav = createStackNavigator<FeedStackParamList>();

const FeedStackNavigation = () => {
  return (
    <StackNav.Navigator
      initialRouteName="FeedScreen"
      screenOptions={{headerShown: false}}>
        <StackNav.Screen name="FeedScreen" component={FeedScreen} />
        <StackNav.Screen name="SingleRecipeScreen" component={SingleRecipeScreen} />
        <StackNav.Screen name="CreateRecipeScreen" component={CreateRecipeScreen} />
        <StackNav.Screen name="AddRecipeToList" component={AddRecipeToList} />
        <StackNav.Screen name="LoginScreen" component={LoginScreen} />
        <StackNav.Screen name="SignupScreen" component={SignupScreen} />
        <StackNav.Screen name="ProfileSetupScreen" component={ProfileSetupScreen} />
        <StackNav.Screen name="SelectedProfileScreen" component={SelectedProfileScreen} />
        <StackNav.Screen name="FavoritesScreen" component={FavoritesScreen} />
        <StackNav.Screen name="NotificationScreen" component={NotificationScreen} />
        <StackNav.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
        <StackNav.Screen name="ShareScreen" component={ShareScreen} />
        <StackNav.Screen name="SingleShareScreen" component={SingleShareScreen} />
    </StackNav.Navigator>
  );
};

export default FeedStackNavigation;
