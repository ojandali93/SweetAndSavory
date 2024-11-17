import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, FlatList, RefreshControl, Linking, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../Context/UserContext';
import { BlurView } from '@react-native-community/blur';
import tailwind from 'twrnc';
import StandardHeader from '../../Components/Headers/StandardHeader';
import NameAndImageProfile from '../../Components/Profile/NameAndImageProfile';
import Bio from '../../Components/Profile/Bio';
import Summary from '../../Components/Profile/Summary';
import { useRecipe } from '../../Context/RecipeContext';
import AuthInput from '../../Components/Inputs/Authentication/AuthInput';
import RedButton from '../../Components/Buttons/Authentication/RedButton';
import Logo from '../../Assets/icon-white.png';
import { Link } from 'react-native-feather';
import AuthInputSecure from '../../Components/Inputs/Authentication/AuthInputSecure';
import supabase from '../../Utils/supabase';


const ProfileScreen = () => {
  const { currentProfile, userLists, userFollowingNoReipce, userFollowers, loginUser, 
    getUserLists, getUserFollowers, getUserFollowingNoRecipe } = useUser();
  const { userRecipes, grabUserRecipes } = useRecipe();
  const navigation = useNavigation();

  const [centerView, setCenterView] = useState<string>('Recipes')
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [refreshingRecipes, setRefreshingRecipes] = useState<boolean>(false)
  const [refreshingLists, setRefreshingLists] = useState<boolean>(false)
  const [refreshingFollowers, setRefreshingFollowers] = useState<boolean>(false)
  const [refreshingFollowing, setRefreshingFollowing] = useState<boolean>(false)

  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const submitUserLoginFeed = () => {
    loginUser(username.toLowerCase(), password, navigation, 'ListScreen');
    setUsername('')
    setPassword('')
  };

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

  const limitStringLength = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const onRefreshRecipes = useCallback(() => {
    setRefreshingRecipes(true);
    grabUserRecipes(currentProfile.user_id).finally(() => {
      setRefreshingRecipes(false);
    });
  }, [userRecipes]);

  const onRefreshLists = useCallback(() => {
    setRefreshingLists(true);
    getUserLists(currentProfile.user_id).finally(() => {
      setRefreshingLists(false);
    });
  }, [userLists]);

  const onRefreshFollowers = useCallback(() => {
    setRefreshingFollowers(true);
    getUserFollowers(currentProfile.user_id).finally(() => {
      setRefreshingFollowers(false);
    });
  }, [userFollowers]);

  const onRefreshFollowing = useCallback(() => {
    setRefreshingFollowing(true);
    getUserFollowingNoRecipe(currentProfile.user_id).finally(() => {
      setRefreshingFollowing(false);
    });
  }, [userFollowingNoReipce]);

  if (!currentProfile) {
    // Show the alert screen when the user is not logged in
    return (
      <View style={tailwind`flex-1`}>

        <KeyboardAvoidingView
          style={tailwind`flex-1 absolute w-full h-full top-0 left-0 right-0 bottom-0 z-15`}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={tailwind`flex-1 w-full`}>
            {/* Background Image */}
            <StandardHeader header={'Profile'} more={true} moreClick={() => {navigation.navigate('SettingScreen')}}/>
            <View style={tailwind`flex-1 bg-white p-4`}>
              <NameAndImageProfile verified={true} username={'omar_j'} accountName={'Omar J. | Aspiring Chef!'} profilePicture='https://firebasestorage.googleapis.com/v0/b/dwm-reactnative.appspot.com/o/ProfilePictures%2F62A803C5-41E4-4290-B2FC-2AD0927B86C4.jpg?alt=media&token=44cc3c46-b573-4d71-9c9c-81f5ba57c419'/>
              <Bio bio='I am a new and energized chef that wants to show the world what good food looks like and how easy it is create delicious food that is healthy.' />
              <Summary followers={382} following={124} recipes={12} lists={5} onSelect={setCenterView} />
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
                  onChange={setUsername}
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
  }

  const limitStringLengthLink = (text: string) => {
    if (text.length > 35) {
      return text.substring(0, 35) + '...';
    }
    return text;
  };

  async function openLink(url: string) {
    const canOpen = await Linking.canOpenURL(url);
  
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      console.error("Don't know how to open URI: " + url);
    }
  }

  // Render the profile details and recipe grid if the user is logged in
  return (
    <View style={tailwind`flex-1`}>
      <StandardHeader header={'Profile'} more={true} moreClick={() => navigation.navigate('SettingsScreen')} />
      <View style={tailwind`flex-1 bg-white p-4`}>
        <NameAndImageProfile 
          username={currentProfile.username} 
          accountName={currentProfile.account_name} 
          profilePicture={currentProfile.profile_picture}
          verified={currentProfile.verified}
        />
        <Bio bio={currentProfile.bio} />
        {
          currentProfile && currentProfile.link 
            ? <View style={tailwind`w-full flex flex-row my-3`}>
                <TouchableOpacity style={tailwind`w-full flex flex-row items-center`} onPress={() => {openLink(currentProfile.link)}}>
                  <Link height={18} width={18} style={tailwind`mr-2 text-sky-600`}/>
                  <Text style={tailwind`text-base text-sky-600 font-bold`}>{limitStringLengthLink(currentProfile.link)}</Text>
                </TouchableOpacity>
              </View>
            : null
        }
        <Summary 
          followers={userFollowers.length}
          following={userFollowingNoReipce.length} 
          recipes={userRecipes.length} 
          lists={userLists.length}
          onSelect={setCenterView} 
        />
        <View style={tailwind`h-1 w-full bg-stone-200 my-4`}></View>

        <View style={tailwind`flex-1`}>
        {
          centerView === 'Recipes'
            ? <View style={tailwind`flex flex-wrap flex-row h-full`}>
                <FlatList
                  style={tailwind`h-full`}
                  data={userRecipes}
                  key={`recipes-${centerView}`} // Use unique key for recipes view
                  numColumns={3} 
                  refreshControl={
                    <RefreshControl refreshing={refreshingRecipes} onRefresh={onRefreshRecipes} />
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={tailwind`w-1/3 p-1`} 
                      onPress={() => navigation.navigate('SingleRecipeScreen', { recipe: item })}
                    >
                      <Image
                        source={{ uri: item.main_image }}
                        style={tailwind`w-full h-32 rounded-lg`}
                      />
                    </TouchableOpacity>
                  )}
                />
              </View>
            : centerView === 'Lists'
                ? <View style={tailwind`flex flex-wrap flex-row h-full`}>
                    <FlatList
                      data={userLists}
                      style={tailwind`h-full`}
                      key={`lists-${centerView}`} // Unique key for lists view
                      refreshControl={
                        <RefreshControl refreshing={refreshingLists} onRefresh={onRefreshLists} />
                      }
                      renderItem={(item) => (
                        <TouchableOpacity
                          style={tailwind`w-full flex flex-row mb-3`} 
                          onPress={() => navigation.navigate('SingleListScreen', { list: item.item })}
                        >
                          <Image
                            source={{ uri: item.item.collection.main_image }}
                            style={tailwind`w-28 h-28 rounded-lg`}
                          />
                          <View style={tailwind`flex-1 ml-3`}>
                            <Text style={tailwind`text-xl font-bold my-2`}>{item.item.collection.title}</Text>
                            <Text style={tailwind`text-base`}>{limitStringLength(item.item.collection.description, 90)}</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
            : centerView === 'Followers'
                ? <View style={tailwind`flex flex-wrap flex-row h-full`}>
                    <FlatList
                      data={userFollowers}
                      style={tailwind`h-full`}
                      key={`followers-${centerView}`} // Unique key for followers view
                      refreshControl={
                        <RefreshControl refreshing={refreshingFollowers} onRefresh={onRefreshFollowers} />
                      }
                      renderItem={(item) => (
                        <TouchableOpacity
                          style={tailwind`w-full flex flex-row items-center mb-3`} 
                          onPress={() => navigation.navigate('SelectedProfileScreen', {user_id: item.item.Profiles.user_id})}
                        >
                          <Image
                            source={{ uri: item.item.Profiles.profile_picture }}
                            style={tailwind`w-14 h-14 rounded-full`}
                          />
                          <View style={tailwind`flex-1 ml-3`}>
                            <Text style={tailwind`text-base font-bold`}>{item.item.Profiles.username}</Text>
                            <Text style={tailwind`text-base`}>{item.item.Profiles.account_name}</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
            : centerView === 'Following'
                ? <View style={tailwind`flex flex-wrap flex-row h-full`}>
                    <FlatList
                      data={userFollowingNoReipce}
                      style={tailwind`h-full`}
                      key={`following-${centerView}`} // Unique key for following view
                      refreshControl={
                        <RefreshControl refreshing={refreshingFollowing} onRefresh={onRefreshFollowing} />
                      }
                      renderItem={(item) => (
                        <TouchableOpacity
                          style={tailwind`w-full flex flex-row items-center mb-3`} 
                          onPress={() => navigation.navigate('SelectedProfileScreen', {user_id: item.item.Profiles.user_id})}
                        >
                          <Image
                            source={{ uri: item.item.Profiles.profile_picture }}
                            style={tailwind`w-14 h-14 rounded-full`}
                          />
                          <View style={tailwind`flex-1 ml-3`}>
                            <Text style={tailwind`text-base font-bold`}>{item.item.Profiles.username}</Text>
                            <Text style={tailwind`text-base`}>{item.item.Profiles.account_name}</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
            : null
          }
        </View>
      </View>
    </View>
  );
};

export default ProfileScreen;
