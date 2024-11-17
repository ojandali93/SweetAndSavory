import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  Modal,
  TextInput,
} from 'react-native';
import tailwind from 'twrnc';
import StandardHeader from '../../Components/Headers/StandardHeader';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../Context/UserContext';
import TemplateRecipe from '../../Components/Tiles/TemplateRecipe';
import { BlurView } from '@react-native-community/blur';
import RedButton from '../../Components/Buttons/Authentication/RedButton';
import Logo from '../../Assets/icon-white.png';
import { useRecipe } from '../../Context/RecipeContext';
import RecipeTileFollowing from '../../Components/Tiles/RecipeTileFollowing';
import AuthInput from '../../Components/Inputs/Authentication/AuthInput';
import AuthInputSecure from '../../Components/Inputs/Authentication/AuthInputSecure';
import supabase from '../../Utils/supabase';

const FeedScreen = () => {
  const navigation = useNavigation();
  const { currentProfile, loginUser, userFollowing, loadingFromAsync, fetchingFollowing } = useUser();
  const { userRecipes, grabUserRecipes } = useRecipe();

  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Password reset modal state
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const submitUserLoginFeed = () => {
    loginUser(username.toLowerCase(), password, navigation, 'ListScreen');
    setUsername('')
    setPassword('')
  };

  const handleUsername = (data: string) => {
    setUsername(data.toLocaleLowerCase())
  }

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

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Function to handle password reset
  const sendResetPasswordEmail = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: 'sweetandsavory://reset-password',
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password reset link sent. Check your email.');
      setResetModalVisible(false);
      setResetEmail('');
    }
  };

  const LoginOverlay = useMemo(() => (
    <KeyboardAvoidingView
      style={tailwind`flex-1 absolute w-full h-full top-0 left-0 right-0 bottom-0 z-15`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={tailwind`flex-1`}>
        <View>
          <StandardHeader
            header="Sweet & Savory"
            add={true}
            addClick={goToAddRecipes}
            notifications={true}
            notificationsClick={() => {}}
            favorites={true}
            favoritesClick={() => {}}
            share={true}
          />
          <View style={tailwind`p-2`}>
            <TemplateRecipe />
            <TemplateRecipe />
          </View>
        </View>

        <View style={tailwind`absolute w-full h-full top-0 left-0 right-0 bottom-0 z-10 bg-slate-950 opacity-85`}></View>

        <View style={tailwind`absolute top-0 left-0 right-0 bottom-0 z-20 flex justify-center`}>
          <View style={tailwind`w-full py-6 px-4`}>
            <View style={tailwind`w-full flex flex-col items-center`}>
              <Image style={tailwind`h-20 w-20 mb-12`} source={Logo} />
            </View>
            <AuthInput
              header="Username"
              valid={false}
              validation={false}
              placeholder="Username..."
              placeholderColor="grey"
              multi={false}
              value={username}
              onChange={handleUsername}
              loading={false}
              capitalization={false}
            />

            <View style={tailwind`mt-4`}>
              <AuthInputSecure
                header={'Password'}
                valid={false}
                validation={false}
                placeholder="*******"
                placeholderColor="grey"
                value={password}
                onChange={setPassword}
                loading={false}
              />
            </View>

            <View style={tailwind`mt-4`}>
              <RedButton header='Login' submit={submitUserLoginFeed} loading={false} />
            </View>

            <View style={tailwind`w-full flex flex-row justify-between items-center mt-4`}>
              <View style={tailwind`flex flex-row`}>
                <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
                  <Text style={tailwind`ml-1 font-bold text-white underline`}>Create Account</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity onPress={() => setResetModalVisible(true)}>
                  <Text style={tailwind`text-white font-bold underline`}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  ), [submitUserLoginFeed, navigation, username, password, goToAddRecipes]);

  const displayContent = () => (
    <View style={tailwind`flex-1`}>
      <StandardHeader
        header="Sweet and Savory"
        add={true}
        addClick={goToAddRecipes}
        notifications={true}
        notificationsClick={() => {}}
        // share={true}
        // shareClick={() => {navigation.navigate('ShareScreen')}}
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
      <StandardHeader header="Sweet and Savory" />
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

      {/* Password Reset Modal */}
      <Modal
        visible={resetModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={tailwind`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tailwind`w-4/5 bg-white p-6 rounded-lg`}>
            <Text style={tailwind`text-lg font-bold mb-4`}>Reset Password</Text>
            <View style={tailwind`mb-4`}>
              <AuthInput
                header='Account Email'
                valid={false}
                validation={false}
                placeholder='account email...'
                placeholderColor='grey'
                multi={false}
                value={resetEmail}
                onChange={setResetEmail}
                loading={false}
                capitalization={false}
              />
            </View>
            <RedButton header="Submit" submit={sendResetPasswordEmail} loading={false} />
            <TouchableOpacity onPress={() => setResetModalVisible(false)} style={tailwind`mt-4`}>
              <Text style={tailwind`text-red-500 text-center font-bold`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FeedScreen;
