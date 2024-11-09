import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import tailwind from 'twrnc';
import StandardHeader from '../../Components/Headers/StandardHeader';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../Context/UserContext';
import TemplateRecipe from '../../Components/Tiles/TemplateRecipe';
import { BlurView } from '@react-native-community/blur';
import AuthInput from '../../Components/Inputs/Authentication/AuthInput';
import RedButton from '../../Components/Buttons/Authentication/RedButton';
import Logo from '../../Assets/icon-red.png';
import { useRecipe } from '../../Context/RecipeContext';
import RecipeTileFollowing from '../../Components/Tiles/RecipeTileFollowing';

const FeedScreen = () => {
  const navigation = useNavigation();
  const { currentProfile, loginUser, userFollowing, loadingFromAsync, fetchingFollowing } = useUser();
  const { userRecipes, grabUserRecipes } = useRecipe();

  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submitUserLoginFeed = useCallback(() => {
    loginUser(username, password, navigation, 'FeedScreen');
  }, [loginUser, navigation]);

  const goToAddRecipes = useCallback(() => {
    if (!currentProfile) {
      Alert.alert(
        'Login Required',
        'You need to be logged in to create a recipe. Please login to continue.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => navigation.navigate('LoginScreenFeed'),
          },
        ]
      );
    } else {
      navigation.navigate('CreateRecipeScreen');
    }
  }, [currentProfile, navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    grabUserRecipes(currentProfile?.user_id).finally(() => setRefreshing(false));
  }, [currentProfile, grabUserRecipes]);

  const LoginOverlay = useMemo(() => (
    <KeyboardAvoidingView
      style={tailwind`flex-1 absolute w-full h-full top-0 left-0 right-0 bottom-0 z-15`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={tailwind`flex-1`}>
        <View>
          <StandardHeader
            header="Dine With Me"
            add={true}
            addClick={goToAddRecipes}
            notifications={true}
            notificationsClick={() => {}}
            favorites={true}
            favoritesClick={() => {}}
          />
          <View style={tailwind`p-2`}>
            <TemplateRecipe />
            <TemplateRecipe />
          </View>
        </View>
        <BlurView
          style={tailwind`absolute w-full h-full top-0 left-0 right-0 bottom-0 z-10`}
          blurType="dark"
          blurAmount={5}
        />
        <View style={tailwind`absolute top-0 left-0 right-0 bottom-0 z-20 flex justify-end`}>
          <View style={tailwind`w-full py-6 px-4`}>
            <View style={tailwind`w-full flex flex-col items-center`}>
              <Image style={tailwind`h-32 w-32`} source={Logo} />
              <Text style={tailwind`text-3xl font-bold text-white mt-4`}>Pinch of Salt</Text>
              <Text style={tailwind`text-xl font-semibold text-white mt-1 mb-6`}>
                Discovering Amazing Recipes
              </Text>
            </View>
            <AuthInput
              icon="User"
              valid={false}
              validation={false}
              placeholder="Username..."
              placeholderColor="grey"
              multi={false}
              secure={false}
              value={username}
              onChange={setUsername}
              loading={false}
              capitalization={false}
            />
            <View style={tailwind`mt-4`}>
              <AuthInput
                icon="Lock"
                valid={false}
                validation={false}
                placeholder="Password..."
                placeholderColor="grey"
                multi={false}
                secure={true}
                value={password}
                onChange={setPassword}
                loading={false}
                capitalization={false}
              />
            </View>
            <View style={tailwind`w-full flex flex-row justify-end mt-1`}>
              <Text style={tailwind`text-white font-bold`}>Forgot Password?</Text>
            </View>
            <View style={tailwind`mt-4`}>
              <RedButton submit={submitUserLoginFeed} loading={false} />
            </View>
            <View style={tailwind`w-full flex flex-row justify-center items-center mt-3`}>
              <Text style={tailwind`text-white font-bold`}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignupScreenFeed')}>
                <Text style={tailwind`ml-1 font-semibold text-red-500`}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  ), [submitUserLoginFeed, navigation, username, password]);

  const displayContent = () => (
    <View style={tailwind`flex-1`}>
      <StandardHeader
        header="Pinch of Salt"
        add={true}
        addClick={goToAddRecipes}
        notifications={true}
        notificationsClick={() => {}}
        favorites={true}
        favoritesClick={() => navigation.navigate('FavoritesScreen')}
      />
      <View style={tailwind`flex-1`}>
        {fetchingFollowing ? (
          <View style={tailwind`flex-1 flex justify-center items-center`}>
            <ActivityIndicator size="large" color="black" />
          </View>
        ) : userFollowing && userFollowing.length > 0 ? (
          <FlatList
            data={userFollowing}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View key={item.id} style={tailwind`p-2`}>
                <RecipeTileFollowing recipe={item} />
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View style={tailwind`flex-1 flex justify-center items-center`}>
            <Text style={tailwind`font-semibold text-xl`}>No posts found in feed.</Text>
          </View>
        )}
      </View>
    </View>
  );

  const displayLoading = () => (
    <View style={tailwind`flex-1`}>
      <View style={tailwind`h-12 w-full bg-slate-950`} />
      <StandardHeader header="Pinch of Salt" />
      <View style={tailwind`flex-1 bg-white flex justify-center items-center`}>
        <ActivityIndicator size="large" color="black" />
      </View>
    </View>
  );

  return (
    <View style={tailwind`flex-1 bg-white`}>
      <KeyboardAvoidingView
        style={tailwind`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={tailwind`flex-1 bg-white`}>
          {loadingFromAsync ? displayLoading() : currentProfile ? displayContent() : LoginOverlay}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default FeedScreen;
