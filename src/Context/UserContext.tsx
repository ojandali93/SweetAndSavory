import React, { createContext, useContext, ReactNode, useState, useEffect, useRef, useLayoutEffect } from 'react';
import supabase from '../Utils/supabase';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { Alert, Platform } from 'react-native';
import { useRecipe } from './RecipeContext';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './AppContext';
import { create } from 'twrnc';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

interface UserContextType {
  currentUser: any; 
  currentProfile: any;
  createUserAccount: (
    username: string, 
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    profilePic: string, 
    bio: string, 
    experience: string,
    navigation: any
  ) => void,
  creatingProfile: boolean,
  loggingIn: boolean,
  loginUser: (username: string, password: string, navigation: any, screen: string) => void
  getUserLists: (user_id: string) => void,
  userLists: any[],
  getListRecipes: (list_id: number) => void
  listRecipes: any[]
  selectedUserLists: any[], 
  getSelectedUserLists: (user_id: string) => void
  userFollowing: any[],
  getUserFollowing: (user_id: string) => void
  userFollowers: any[],
  getUserFollowers: (user_id: string) => void
  selectedUserFollowing: any[],
  getSelectedUserFollowing: (user_id: string) => void,
  selectedUserFollowers: any[],
  getSelectedUserFollowers: (user_id: string) => void
  userFavorites: any[],
  grabUserFavorites: (user_id: string) => void,
  addToFavorite: (user_id: string, recipe_id: number) => void,
  removeFromFavorite: (favorite: string, user_id: string) => void
  logoutCurrentUser: (navigation: any) => void
  userBlocked: any[]
  deleteAccount: (profileId: number, navigation: any) => void
  getUserFollowingNoRecipe: (user_id: string) => void,
  userFollowingNoReipce: any[]
  userActivity: any[],
  getUserActivity: (user_id: string) => void
  userFriendRequests: any[],
  getUserFriendsPending: (user_id: string) => void
  userListRequests: any[]
  getUserListPending: (user_id: string) => void
  generateNotification: (fcmToken: any, title: string, body: string, imageUrl?: string) => void
  loadingFromAsync: boolean
  fetchingFollowing: boolean
  getUserProfileById: (user_id: string) => void
  shareResults: any[],
  getRandomUsers: () => void,
  shareWithPeople: (selectedShare: string[], recipe_id: number, recipe_title: string, recipe_description: string, user: any) => void
  userShared: any[],
  getUserShared: (user_id: string) => void
  shareRecipes: any,
  getSharedRecipes: (share_id: number) => void
  acceptShareRequest: (share_id: number, navigation: any) => void,
  removeShareRequest: (share_id: number, navigation: any) => void
}

interface SingleImageProp {
  uri: string | undefined;
  fileType: string | undefined;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {

  const {grabUserRecipes} = useRecipe()
  const {createNotification} = useApp()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentProfile, setCurrentProfile] = useState<any>(null)

  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [loadingSelectedProfile, setLoadingSelectedProfile] = useState<boolean>(false)

  const [creatingProfile, setCreatingProfile] = useState<boolean>(false)
  const [loggingIn, setLoggingIn] = useState<boolean>(false)

  const [userLists, setUserLists] = useState<any[]>([])
  const [listRecipes, setListRecipes] = useState<any[]>([])

  const [selectedUserLists, setSelectedUserLists] = useState<any[]>([])

  const [userFollowing, setUserFollowing] = useState<any[]>([])
  const [userFollowers, setUserFollowers] = useState<any[]>([])

  const [selectedUserFollowing, setSelectedUserFollowing] = useState<any[]>([])
  const [selectedUserFollowers, setSelectedUserFollowers] = useState<any[]>([])
  
  const [userFollowingNoReipce, setUserFollowingNoRecipe] = useState<any[]>([])

  const [userFavorites, setUserFavorites] = useState<any[]>([])
  const [userBlocked, setUserBlocked] = useState<any[]>([])

  const [userActivity, setUserActivity] = useState<any[]>([])
  const [userFriendRequests, setUserFriendRequests] = useState<any[]>([])
  const [userListRequests, setUserListRequests] = useState<any[]>([])

  const [loadingFromAsync, setLoadingFromAsync] = useState<boolean>(true)
  const [fetchingFollowing, setFetchingFollowing] = useState<boolean>(true)

  const [shareResults, setShareResults] = useState<any[]>([])

  const [userShared, setUserShared] = useState<any[]>([])
  const [shareRecipes, setShareRecipes] = useState<any[]>([])

  useLayoutEffect(() => {
    
    AsyncStorage.getItem('currentUser').then((user) => {
      if (user) setCurrentUser(JSON.parse(user));
    });
    AsyncStorage.getItem('currentProfile').then((profile) => {
      if (profile){
        let parsedData = JSON.parse(profile)
        setCurrentProfile(parsedData);
        grabUserRecipes(parsedData.user_id)
        getUserLists(parsedData.user_id)
        getUserFollowing(parsedData.user_id)
        getUserFollowers(parsedData.user_id)
        grabUserFavorites(parsedData.user_id)
        getUserBlocked(parsedData.user_id)
        getUserFollowingNoRecipe(parsedData.user_id)
        getUserActivity(parsedData.user_id)
        getUserFriendsPending(parsedData.user_id)
        getUserListPending(parsedData.user_id)
        getUserShared(parsedData.user_id)
        setLoadingFromAsync(false)
      } else {
        setLoadingFromAsync(false)
      }
    });
  }, []);

  const createUserAccount = async (
    username: string, 
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    profilePic: string, 
    bio: string, 
    experience: string,
    navigation: any
  ) => {
    setCreatingProfile(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,        
        password: password, 
      });
      if (signUpError) {
        console.error('Error signing up:', signUpError.message);
        Alert.alert('Signup Error', 'There was an error creating your account. Please try again later or contact support')
      }
      console.log('respone data: ', data)
      createUsersProfile(username, email, firstName, lastName, profilePic, bio, experience, navigation, data.user)
    } catch (error) {
      console.error('there was an error creating the users account: ', error)
    }
  }

  const createUsersProfile = async (
    username: string, 
    email: string, 
    firstName: string, 
    lastName: string, 
    profilePic: string, 
    bio: string, 
    experience: string,
    navigation: any,
    user: any
  ) => {
    try{
      const { error: profileError } = await supabase
        .from('Profiles')
        .insert([
          {
            user_id: user.id,  // Make sure this maps to user_id in the DB
            username: username.toLowerCase(),
            email: email,
            bio: bio,
            location: null,
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            account_name: `${firstName} ${lastName}`,
            profile_picture: profilePic,
            public: true,
            notifications: false,
            verified: false,
            launch: false,
            followers: 0,
            following: 0,
            recipes: 0,
            lists: 0,
            experience: experience
          },
        ]);

      // Handle profile insertion errors
      if (profileError) {
        console.error('Error creating profile:', profileError.message);
        return;
      }
      createUserFavoriteCollection(navigation, username, user)
    } catch (err) {
      console.error('An error occurred while creating an account:', err);
    }
  }

  const createUserFavoriteCollection = async (navigation: any, username: any, user: any) => {
    try {
      const { data: collectionData, error: profileError } = await supabase
        .from('Collections')
        .insert([
          {
            user_id: user.id,  // Make sure this maps to user_id in the DB
            title: "Favorites",
            description: `All of your favorite recipes`,
            main_image: 'https://firebasestorage.googleapis.com/v0/b/pinchofsalt-ffc9d.appspot.com/o/CollectionImages%2FDWM-icon-bg-blue-white.png?alt=media&token=5e8f0e51-6948-42cb-b561-0bc919cdf9bf',
            is_public: false,
          },
        ]).select();
        if (profileError) {
          console.error('Error creating profile:', profileError.message);
          return;
        }
        addFavoriteCollectionMember(navigation, username, user, collectionData)
    } catch(error) {
      console.error('Error creating a default list: ', error)
    }
  }

  const addFavoriteCollectionMember = async (navigation: any, username: any, user: any, collectionData: any) => {
    try {
      const { error: profileError } = await supabase
        .from('Members')
        .insert([
          {
            member_id: user.id,  // Make sure this maps to user_id in the DB
            collection_id: collectionData[0].id,
            status: `owner`,
            is_default: true
          },
        ]);
        if (profileError) {
          console.error('Error creating profile:', profileError.message);
          return;
        }
        getUserProfile(navigation, username, user)
    } catch(error) {
      console.error('Error creating a default list: ', error)
    }
  }

  const getUserProfile = async (navigation: any, username: string, user: any) => {
    try {
      const { data, error } = await supabase
        .from('Profiles')
        .select('*')
        .ilike('username', username.toLowerCase());
      if (error) {
        console.error('Error fetching data:', error);
      }
      setCreatingProfile(false)
      Alert.alert(
        'Account Setup',
        'A verification email has been sent. Please check your email to verify your account. Check your spam folder.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('FeedScreen'), // Navigate to the next screen
          },
        ]
      );
    } catch (err) {
      console.error('An error occurred while checking the username:', err);
    }
  }

  // USER LOGIN FUNCTIONS
  // - takes in username, password, and navigatio

  const loginUser = async (username: string, password: string, navigation: any, screen: string) => {
    setLoggingIn(true)
    try {
      const { data, error } = await supabase
        .from('Profiles')
        .select('*')
        .eq('username', username); // Filter where username matches loginUsername
      if (error) {
        Alert.alert('Invaid Username', 'Userame does not match any records')
      } else {
        if(data.length === 0){
          Alert.alert('Invaid Username', 'Userame does not match any records')
        } else {
          getFCMToken(data[0].user_id, data[0]['email'], username, password, navigation, screen)
        }
      }
    } catch (err) {
      console.log('An error occurred while fetching recipes:', err);
    }
  }

  const getFCMToken = async (user_id: string, email: string, username: string, 
    password: string, navigation: string, screen: string) => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        // Here, you should send the token to your server to associate it with the user
        console.log('fcm token: ', fcmToken)
        loginToAccount(email, username, password, navigation, screen, fcmToken)
      } else {
        console.log('Failed to get FCM token');
      }
    }
  }

  const loginToAccount = async (email: string, username: string, password: string, navigation: any, screen: string, fcmToken: any) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
  
      if (error) {
        console.log('Login error:', error.message);
        if(error.message === 'Email not confirmed'){
          Alert.alert('Account Confirmation', 'Please check your email and confirm your account before logging in.');
        } else if (error.message != 'Email not confirmed') {
          Alert.alert('Login Failed', 'Username or password does not match our records.');
        }
      } else {
        console.log('data from the login: ', JSON.stringify(data))
        updateUserProfileWithFCMToken(fcmToken, data.user.id, navigation, screen)
      }
    } catch (err) {
      console.log('Error logging in:', err.message);
      setLoggingIn(false)
      Alert.alert('An error occurred', 'Please try again later.');
    }
  };

  const updateUserProfileWithFCMToken = async (fcmToken: string, user_id: string, navigation: any, screen: string) => {
    try {
      const { data, error } = await supabase
        .from('Profiles')
        .update({
          fcm_token: fcmToken,
        })
        .eq('user_id', user_id)
        .select();
  
      if (error) {
        console.error('Error updating single record with FCM token:', error);
        return;
      }
  
      console.log('Most up-to-date profile:', JSON.stringify(data));
  
      if (data && data.length > 0) {
        // Pass username and user data to the next function
        getUserProfileLogin(data[0].username, navigation, data[0], screen);
      } else {
        console.error('No data returned after update.');
      }
    } catch (error) {
      console.error('Error updating profile with token:', error);
    }
  };

  const getUserProfileLogin = async (username: string, navigation: any, user: any, screen: string) => {
    try {
      const { data, error } = await supabase
        .from('Profiles')
        .select('*')
        .eq('username', username);
      if (error) {
        console.error('Error fetching data:', error);
      }
      console.log('current profile: ', data[0])
      setCurrentUser(user)
      setCurrentProfile(data[0])
      grabUserRecipes(data[0].user_id)
      getUserLists(data[0].user_id)
      getUserFollowing(data[0].user_id)
      getUserFollowers(data[0].user_id)
      grabUserFavorites(data[0].user_id)
      getUserBlocked(data[0].user_id)
      getUserFollowingNoRecipe(data[0].user_id)
      getUserActivity(data[0].user_id)
      getUserFriendsPending(data[0].user_id)
      getUserListPending(data[0].user_id)
      getUserShared(data[0].user_id)
      setLoggingIn(false)
      AsyncStorage.setItem('currentUser', JSON.stringify(user));
      AsyncStorage.setItem('currentProfile', JSON.stringify(data[0]));~
      navigation.navigate(screen)
    } catch (err) {
      console.error('An error occurred while checking the username:', err);
    }
  }

  const logoutCurrentUser = async (navigation: any) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error.message);
        return false;
      }
      removeFcmTokenFromProfile(currentProfile.user_id, navigation)
      return true;
    } catch (err) {
      console.error('Unexpected error logging out:', err);
      return false;
    }
  };

  const removeFcmTokenFromProfile = async (user_id: string, navigation: any) => {
    try {
      const { data, error } = await supabase
        .from('Profiles')
        .update({fcm_token: null})
        .eq('user_id', user_id)
        .select()
      if (error) {
        console.error('Error removing fcm token out:', error.message);
        return false;
      }
      setCurrentProfile(null)
      AsyncStorage.removeItem('currentUser');
      AsyncStorage.removeItem('currentProfile');
      navigation.navigate('FeedScreen')
    } catch (err) {
      console.error('Unexpected error logging out:', err);
      return false;
    }
  }

  const generateNotification = async (fcmToken: any, title: string, body: string, imageUrl?: string) => {
    try {
      const message = {
        fcmToken,
        title,
        body,
        imageUrl,
      };
      const response = await fetch('https://pinchofsaltserver.onrender.com/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      getUserActivity(currentProfile.user_id)
      getUserFriendsPending(currentProfile.user_id)
      getUserListPending(currentProfile.user_id)
      console.log('Notification sent successfully:', response);
    } catch (error) {
      console.error('There was an error generating a notification:', error);
    }
  };
  

  const getUserFriendsPending = async (user_id: string) => {
    try {
      // Fetch all records where 'following' matches the user_id
      const { data: relationsData, error } = await supabase
        .from('Relations')
        .select('*')
        .eq('status', 'pending')
        .eq('following', user_id);
  
      if (error) {
        console.error("Error fetching pending user friends:", error);
        return;
      }
  
      if (relationsData) {
        // For each relation record, fetch the follower profile
        const enhancedData = await Promise.all(
          relationsData.map(async (relation) => {
            const { data: profileData, error: profileError } = await supabase
              .from('Profiles')
              .select('*')
              .eq('user_id', relation.follower) // Fetch the profile where user_id matches the follower ID
              .single(); // Use .single() to get a single profile record
  
            if (profileError) {
              console.error(`Error fetching profile for follower ${relation.follower}:`, profileError);
            }
  
            // Add the profile data to the relation record
            return {
              ...relation,
              followerProfile: profileData || null, // Add profile data or null if not found
            };
          })
        );

        setUserFriendRequests(enhancedData);
      }
    } catch (error) {
      console.log('Error getting all friend requests:', error);
    }
  };
  
  const getUserListPending = async (user_id: string) => {
    try {
      // Step 1: Fetch all 'pending' members by user_id
      const { data: memberData, error } = await supabase
        .from('Members')
        .select('*')
        .eq('status', 'pending')
        .eq('member_id', user_id);
  
      if (error) {
        console.error("Error fetching pending user friends:", error);
        return;
      }
  
      if (memberData) {
        // Step 2: For each member, fetch the corresponding collection and profile
        const enhancedData = await Promise.all(
          memberData.map(async (member) => {
            // Fetch collection data based on collection_id
            const { data: collectionData, error: collectionError } = await supabase
              .from('Collections')
              .select('*')
              .eq('id', member.collection_id)
              .single();
  
            if (collectionError) {
              console.error(`Error fetching collection for collection_id ${member.collection_id}:`, collectionError);
              return { ...member, collection: null, profile: null };
            }
  
            // Fetch profile data based on collection's user_id
            const { data: profileData, error: profileError } = await supabase
              .from('Profiles')
              .select('*')
              .eq('user_id', collectionData.user_id)
              .single();
  
            if (profileError) {
              console.error(`Error fetching profile for user_id ${collectionData.user_id}:`, profileError);
            }
  
            // Step 3: Add the collection and profile data to the member object
            return {
              ...member,
              collection: collectionData || null,
              profile: profileData || null, // Attach profile data or null if not found
            };
          })
        );
        setUserListRequests(enhancedData);
      }
    } catch (error) {
      console.log('Error getting all friend requests:', error);
    }
  };
  

  const getUserLists = async (user_id: string) => {
    try {
      // Step 1: Fetch all Member records where member_id is the current user's user_id
      const { data: membersData, error: membersError } = await supabase
        .from('Members')
        .select('*')
        .eq('member_id', user_id)
        .in('status', ['member', 'owner']);  
  
      if (membersError) {
        console.error('Error fetching members:', membersError);
        return;
      }
  
      // Step 2: For each member, fetch the corresponding collection based on collection_id
      const enhancedData = await Promise.all(
        membersData.map(async (member) => {
          const { data: collectionData, error: collectionError } = await supabase
            .from('Collections')
            .select('*')
            .eq('id', member.collection_id)
            .single(); // Use .single() to fetch a single collection record
  
          if (collectionError) {
            console.error(`Error fetching collection for collection_id ${member.collection_id}:`, collectionError);
          }
  
          // Step 3: Return member data with associated collection data
          return {
            ...member,
            collection: collectionData || null, // Attach collection data or null if not found
          };
        })
      );
      setUserLists(enhancedData);
    } catch (err) {
      console.error('An error occurred while fetching user lists and collections:', err);
    }
  };
  

  const getUserActivity = async (user_id: string) => {
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('Activity')
        .select('*')
        .eq('user_id', user_id); 
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        return;
      }
      setUserActivity(collectionsData);
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  };

  const getUserBlocked = async (user_id: string) => {
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('Relations')
        .select(`
          *, 
          Profiles(*)
        `)
        .eq('follower', user_id)
        .eq('status', 'blocked'); 
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        return;
      }
      setUserBlocked(collectionsData);
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  };

  const getUserFollowing = async (user_id: string) => {
    try {
      const { data: followingData, error: followingError } = await supabase
        .from('Relations')
        .select(`
          *
        `)
        .eq('follower', user_id)
        .eq('status', 'follow');
  
      if (followingError) {
        console.error('Error fetching followed profiles:', followingError);
        return;
      }
      let following_ids: any[] = []
      followingData.map((item) => {
        following_ids.push(item.following)
      })
      try {
        const { data: recipesData, error } = await supabase
          .from('Recipes')
          .select(`
            *,
            user_profile:Profiles(*),
            Categories(*),
            Cuisine(*),
            Ingredients(*),
            Instructions(*),
            Nutrition(*)
          `)
          .in('user_id', following_ids); 

        if (error) {
          console.error('Error fetching recipes of following:', error);
          return;
        }
        setUserFollowing(recipesData);
        setFetchingFollowing(false)
      } catch(errors) {
        console.error('An error occured when checking recipes for user_ids:', err);
      }
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  };

  const getUserFollowingNoRecipe = async (user_id: string) => {
    try {
      // Step 1: Get all following relationships where follower matches user_id
      const { data: followingData, error: followingError } = await supabase
        .from('Relations')
        .select('*')
        .eq('follower', user_id);
  
      if (followingError) {
        console.error('Error fetching members:', followingError);
        return;
      }
  
      // Step 2: For each member, fetch the corresponding collection based on collection_id
      const enhancedData = await Promise.all(
        followingData.map(async (member) => {
          const { data: collectionData, error: collectionError } = await supabase
            .from('Profiles')
            .select('*')
            .eq('user_id', member.following)
            .single(); // Use .single() to fetch a single collection record
  
          if (collectionError) {
            console.error(`Error fetching profile for user_id ${member.user_id}:`, collectionError);
          }
  
          // Step 3: Return member data with associated collection data
          return {
            ...member,
            Profiles: collectionData || null, // Attach collection data or null if not found
          };
        })
      );
  
      setUserFollowingNoRecipe(enhancedData);
    } catch (err) {
      console.error('An error occurred while fetching user profiles:', err);
    }
  };
  
  
  const getUserFollowers = async (user_id: string) => {
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('Relations')
        .select(`
          *, 
          Profiles(*)
        `)
        .eq('following', user_id); 
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        return;
      }
      setUserFollowers(collectionsData);
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  };

  const getSelectedUserFollowing = async (user_id: string) => {
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('Relations')
        .select(`
          *, 
          Profiles(*)
        `)
        .eq('follower', user_id); 
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        return;
      }
      setSelectedUserFollowing(collectionsData);
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  };

  const getSelectedUserFollowers = async (user_id: string) => {
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('Relations')
        .select(`
          *, 
          Profiles(*)
        `)
        .eq('following', user_id); 
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        return;
      }
      setSelectedUserFollowers(collectionsData);
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  };
  
  const getListRecipes = async (list_id: number) => {
    try {
      // Step 1: Fetch all records from CollectionPlaces where collection_id matches
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('CollectionPlaces')
        .select('recipe_id')
        .eq('collection_id', list_id);
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        return;
      }
      if (collectionsData.length === 0) {
        return;
      }
      const recipePromises = collectionsData.map(async (collectionPlace) => {
        const { recipe_id } = collectionPlace;
        const { data: recipeData, error: recipeError } = await supabase
          .from('Recipes')
          .select(`
            *,
            user_profile:Profiles(*),
            Categories(*),
            Cuisine(*),
            Ingredients(*),
            Instructions(*),
            Nutrition(*)
          `)
          .eq('id', recipe_id)
          .single();  
        if (recipeError) {
          console.error(`Error fetching recipe with id: ${recipe_id}`, recipeError);
          return null;
        }
        return recipeData;  // Return the recipe data
      });
      const recipes = await Promise.all(recipePromises);
      const filteredRecipes = recipes.filter((recipe) => recipe !== null);
      setListRecipes(filteredRecipes);
    } catch (err) {
      console.error('An error occurred while fetching list recipes:', err);
    }
  };

  const getSelectedUserLists = async (user_id: string) => {
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('Collections')
        .select('*')
        .eq('user_id', user_id); 
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        return;
      }
      setSelectedUserLists(collectionsData);
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  };

  const grabUserFavorites = async (user_id: string) => {
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('Favorites')
        .select('*, Recipes(*)')
        .eq('user_id', user_id)
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        return;
      }
      setUserFavorites(collectionsData)
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  };

  const addToFavorite = async (user_id: string, recipe_id: number) => {
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('Favorites')
        .insert([
          {
            user_id: user_id,
            recipe_id: recipe_id
          }
        ])
        .select()
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        return;
      }
      grabUserFavorites(user_id)
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  };

  const removeFromFavorite = async (favorite: string, user_id: string) => {
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('Favorites')
        .delete()
        .eq('id', favorite);
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        return;
      }
      grabUserFavorites(user_id)
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  };

  const deleteAccount = async (profileId: number, navigation: any) => {
    setCurrentProfile(null)
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('Profiles')
        .delete()
        .eq('id', profileId);
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        navigation.goBack()
      }
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  };

  const getUserProfileById = async (user_id: string) => {
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('Profiles')
        .select('*')
        .eq('user_id', user_id);
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        return;
      }
      setCurrentProfile(collectionsData[0])
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  };

  const getRandomUsers = async () => {
    try {
      const { data: randomUsers, error } = await supabase
        .from('Profiles')
        .select('*')
        .limit(25); // Limit the number of rows to 25
  
      if (error) {
        console.error('Error fetching random users:', error);
        return;
      }
  
      console.log('Random users:', randomUsers);
      setShareResults(randomUsers); // Assuming you want to set the first random profile
    } catch (err) {
      console.error('An error occurred while fetching random users:', err);
    }
  };

  const shareWithPeople = async (selectedShare: string[], recipe_id: number, recipe_title: string, recipe_description: string, user: any) => {
    if(selectedShare.length > 1){
      selectedShare.map((item) => {
        checkShareRecord(item, recipe_id, recipe_title, recipe_description, user)
      })
    } else {
      checkShareRecord(selectedShare[0], recipe_id, recipe_title, recipe_description, user)
    }
  }

  const checkShareRecord = async (user_id: string, recipe_id: number, recipe_title: string, recipe_description: string, user: any) => {
    try {
      const { data: shareData, error: shareError } = await supabase
        .from('Share')
        .select('*')
        .or(
          `and(user_1.eq.${user_id},user_2.eq.${currentProfile.user_id}),and(user_1.eq.${currentProfile.user_id},user_2.eq.${user_id})`
        );

      if (shareError) {
        console.error('Error checking share record: ', shareError);
        return;
      }
      console.log('this is an existing share record: ', JSON.stringify(shareData))
      // If shareData contains records, log the found share records
      if (shareData && shareData.length > 0) {
        updateShare(shareData[0].id, recipe_id, user_id, recipe_title, recipe_description, user, shareData[0])
      } else {
        // console.log('need to create a new record')
        createShare(user_id, recipe_id, recipe_title, recipe_description, user)
      }
    } catch(error) {
      console.error('Error checking if relationship exists: ', error)
    }
  }

  const createShare = async (user_id: string, recipe_id: number, recipe_title: string, recipe_description: string, user: any) => {
    try {
      const { data: createdData, error: createdError} = await supabase 
        .from('Share')
        .insert([{
          user_1: currentProfile.user_id,
          user_2: user_id,
          recipe_title: recipe_title,
          recipe_description: recipe_description,
          last_updated: new Date(),
          status: 'requested'
        }])
        .select()

        if(createdError){
          console.log('Error creating share with: ', createdError)
        }

        if(createdData){
          console.log('share record created: ', createdData[0].id)
          createNotification(user_id, null, null, null, null, null, createdData[0].id, `${currentProfile.username} wants to shared a recipe with you`, currentProfile.username )          
          shareRecipeWithUser(createdData[0].id, recipe_id, user_id, createdData[0], user)
        } else {
          console.log('share record not found')
        }

    } catch(error) {
      console.error('Error creating single share: ', error)
    }
  }

  const updateShare = async (share_id: number, recipe_id: number, user_id: string, recipe_title: string, recipe_description: string, user: any, share: any) => {
    if(share.status === 'pending'){
      Alert.alert('Pending Request', 'You can not share recipes because the request is still pending.')
    } else {
      try {
        const { data: createdData, error: createdError} = await supabase 
          .from('Share')
          .update([{
            recipe_title: recipe_title,
            recipe_description: `${currentProfile.username} shared ${recipe_title} with you.`,
            last_updated: new Date()
          }])
          .eq('id', share_id)
          .select()
  
          if(createdError){
            console.log('Error creating share with: ', createdError)
          }
  
          if(createdData){
            shareRecipeWithUser(createdData[0].id, recipe_id, user_id, createdData[0], user)
          } else {
            console.log('share record not found')
          }
  
      } catch(error) {
        console.error('Error creating single share: ', error)
      }
    }
  }

  const shareRecipeWithUser = async (share_id: number, recipe_id: number, user_id: string, share: any, user: any) => {
    if(share.status === 'accepted'){
      try {
        const { data: createdData, error: createdError} = await supabase 
          .from('ShareRecipes')
          .insert([{
            share_id: share_id,
            sender_id: currentProfile.user_id,
            receiver_id: user_id,
            recipe_id: recipe_id
          }])
          .select()
  
          if(createdError){
            console.log('Error creating the recipe share: ', createdError)
          } else {
            if(share.status === 'accepted'){
              console.log('final share user: ', JSON.stringify(user))
              createNotification(user_id, null, null, null, null, null, share_id, `${currentProfile.username} shared a recipe with you`, currentProfile.username )
              console.log('shared recipe: ', JSON.stringify(createdData))
            } else {
              console.log('shared recipe: ', JSON.stringify(createdData))
            }
          }
      } catch(error) {
        console.error('Error sharing a recipe: ', error)
      }
    } else {
      console.log('share is rejected')
    }
  }

  const getUserShared = async (user_id: string) => {
    try {
      const { data: createdData, error: createdError} = await supabase 
        .from('Share')
        .select(`
          *,
          user_1_profile:Profiles!user_1(*),
          user_2_profile:Profiles!user_2(*)
        `)
        .or(`user_1.eq.${user_id},user_2.eq.${user_id}`);

        if(createdError){
          console.log('Error creating the recipe share: ', createdError)
        } else {
          setUserShared(createdData)
        }
    } catch(error) {
      console.error('Error sharing a recipe: ', error)
    }
  }

  const getSharedRecipes = async (share_id: number) => {
    try {
      const { data: createdData, error: createdError} = await supabase 
        .from('ShareRecipes')
        .select(`*, Recipes(*)`)
        .eq('share_id', share_id);

        if(createdError){
          console.log('Error creating the recipe share: ', createdError)
        } else {
          setShareRecipes(createdData)
        }
    } catch(error) {
      console.error('Error sharing a recipe: ', error)
    }
  }

  const acceptShareRequest = async (share_id: number, navigation: any) => {
    try {
      const { data: createdData, error: createdError} = await supabase 
        .from('Share')
        .update({
          status: 'accepted'
        })
        .eq('id', share_id);

        if(createdError){
          console.log('Error creating the recipe share: ', createdError)
        } else {
          getUserShared(currentProfile.user_id)
          navigation.goBack()
        }
    } catch(error) {
      console.error('Error sharing a recipe: ', error)
    }
  }

  const removeShareRequest = async (share_id: number, navigation: any) => {
    try {
      const { data: createdData, error: createdError} = await supabase 
        .from('Share')
        .delete()
        .eq('id', share_id);

        if(createdError){
          console.log('Error creating the recipe share: ', createdError)
        } else {
          getUserShared(currentProfile.user_id)
          navigation.goBack()
        }
    } catch(error) {
      console.error('Error sharing a recipe: ', error)
    }
  }
  
  return (
    <UserContext.Provider
      value={{
        currentUser,
        currentProfile,
        createUserAccount,
        creatingProfile,
        loggingIn,
        loginUser,
        getUserLists,
        userLists,
        getListRecipes,
        listRecipes,
        selectedUserLists, 
        getSelectedUserLists,
        userFollowing,
        getUserFollowing,
        userFollowers,
        getUserFollowers,
        selectedUserFollowing,
        getSelectedUserFollowing,
        selectedUserFollowers,
        getSelectedUserFollowers,
        userFavorites,
        grabUserFavorites,
        addToFavorite,
        removeFromFavorite,
        logoutCurrentUser,
        userBlocked,
        deleteAccount,
        getUserFollowingNoRecipe,
        userFollowingNoReipce,
        userActivity,
        getUserActivity,
        userFriendRequests,
        getUserFriendsPending,
        getUserListPending,
        userListRequests,
        generateNotification, 
        loadingFromAsync, 
        fetchingFollowing,
        getUserProfileById,
        shareResults,
        getRandomUsers,
        shareWithPeople,
        userShared,
        getUserShared,
        shareRecipes,
        getSharedRecipes,
        acceptShareRequest,
        removeShareRequest
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
