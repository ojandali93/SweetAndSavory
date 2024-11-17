import React, { useCallback, useEffect, useState } from 'react';
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
import { useRecipe } from '../../Context/RecipeContext';
import { useUser } from '../../Context/UserContext';
import { useNavigation } from '@react-navigation/native';
import CollectionTile from '../../Components/Tiles/CollectionTile';
import { BlurView } from '@react-native-community/blur';
import RedButton from '../../Components/Buttons/Authentication/RedButton';
import Logo from '../../Assets/icon-white.png';
import AuthInput from '../../Components/Inputs/Authentication/AuthInput';
import AuthInputSecure from '../../Components/Inputs/Authentication/AuthInputSecure';
import TemplateCollection from '../../Components/Tiles/TemplateCollection';
import supabase from '../../Utils/supabase';

const ListsScreen = () => {
  const navigation = useNavigation();

  const { currentProfile, userLists, getUserLists, loginUser } = useUser();

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

  const goToAddList = () => {
    currentProfile
      ? navigation.navigate('CreateListScreen')
      : Alert.alert(
          'Login Required',
          'You need to be logged in to create a recipe. Please login to continue.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Login',
              onPress: () => navigation.navigate('LoginScreenList'),
            },
          ]
        );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getUserLists(currentProfile?.user_id).finally(() => {
      setRefreshing(false);
    });
  }, [currentProfile]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Function to handle password reset
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
    if (error) {
      Alert.alert('Error', 'Failed to send password reset email.');
    } else {
      Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
      setResetModalVisible(false);
      setResetEmail(''); // Clear the email input
    }
  };

  const displayContent = () => {
    return (
      <View style={tailwind`flex-1 bg-white`}>
        <StandardHeader
          header="Collections"
          add={true}
          addClick={goToAddList}
        />
        <View style={tailwind`flex-1`}>
          {userLists && userLists.length > 0 ? (
            <FlatList
              data={userLists}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View key={item.id} style={tailwind`p-2`}>
                  <CollectionTile list={item} />
                </View>
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          ) : (
            <View style={tailwind`flex-1 flex justify-center items-center`}>
              <Text style={tailwind`font-semibold text-xl`}>No collections found.</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const displayLogin = () => (
    <KeyboardAvoidingView
      style={tailwind`flex-1 absolute w-full h-full top-0 left-0 right-0 bottom-0 z-15`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={tailwind`flex-1 bg-white`}>
        <View>
          <StandardHeader
            header="Collections"
            add={true}
            addClick={goToAddList}
          />
          <View style={tailwind`p-2`}>
            <TemplateCollection image="https://firebasestorage.googleapis.com/v0/b/pinchofsalt-ffc9d.appspot.com/o/Recipe_Pictures%2F1C16BF62-D309-486D-9B11-56D110DAC3E9.jpg?alt=media&token=f6a7e043-874a-4864-b6ce-f8cbde3f8154" title="Sushi Sushi & Sushi" description="The beste sushi recipes that are delicious and packed with flavor" />
            <TemplateCollection image="https://firebasestorage.googleapis.com/v0/b/pinchofsalt-ffc9d.appspot.com/o/Recipe_Pictures%2FB5BC4A7F-D2DB-4041-9DFD-C0D711E33937.jpg?alt=media&token=eb70f09a-c3ba-4914-a799-14db9a5dc715" title="South of the border" description="A collection of my favorite mexican dish recipes that you can cook under 30 minutes." />
          </View>
        </View>

        <View style={tailwind`absolute w-full h-full top-0 left-0 right-0 bottom-0 z-10 bg-slate-950 opacity-85`} />

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
              onChange={setUsername}
              loading={false}
              capitalization={false}
            />

            <View style={tailwind`mt-4`}>
              <AuthInputSecure
                header="Password"
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
              <RedButton header="Login" submit={submitUserLoginFeed} loading={false} />
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
  );

  return (
    <View style={tailwind`flex-1 bg-white`}>
      {currentProfile && currentProfile.user_id ? displayContent() : displayLogin()}

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
            <RedButton header="Submit" submit={handlePasswordReset} loading={false} />
            <TouchableOpacity onPress={() => setResetModalVisible(false)} style={tailwind`mt-4`}>
              <Text style={tailwind`text-red-500 text-center font-bold`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ListsScreen;
