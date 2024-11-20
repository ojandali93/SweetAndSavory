import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ScrollView, Text, TextInput, View, KeyboardAvoidingView, TouchableOpacity, Alert, Image, Modal, Dimensions } from 'react-native';
import { FeedStackParamList } from '../../Navigation/FeedStackNavigation';
import tailwind, { create } from 'twrnc';
import StandardHeader from '../../Components/Headers/StandardHeader';
import DisplayImageRecipe from '../../Components/ImagesAndVideo/DisplayImageRecipe';
import RecipeDetails from '../../Components/Info/RecipeDetails';
import RecipeSummary from '../../Components/Info/RecipeSummary';
import DisplayVideoRecipe from '../../Components/ImagesAndVideo/DisplayVideoRecipe';
import InstructionsDetails from '../../Components/Info/InstructionsDetails';
import IngredientsDetails from '../../Components/Info/IngredientsDetails';
import CategoriesDetails from '../../Components/Info/CategoriesDetails';
import NutritionDetails from '../../Components/Info/NutritionDetails';
import AuthorDetails from '../../Components/Info/AuthorDetails';
import { Bookmark, Check, ChevronsUp, Heart, Minimize, Send, User, X } from 'react-native-feather';
import supabase from '../../Utils/supabase';
import { useUser } from '../../Context/UserContext';
import Video from 'react-native-video';
import { useApp } from '../../Context/AppContext';
import { ProfileStackNavigator } from '../../Navigation/ProfileStackNavigation';
import Verified from '../../Assets/POS-verified-blue.png'
import MainButton from '../../Components/Buttons/Content/MainButton';
import ResetPassword from '../Profile/ResetPassword';

type SingleRecipeRouteProp = RouteProp<ProfileStackNavigator, 'SingleRecipeScreen'>;

const SingleRecipeScreen = () => {
  const route = useRoute<SingleRecipeRouteProp>();
  const { recipe } = route.params;

  const navigation = useNavigation();
  const { shareWithPeople, shareResults, currentProfile, generateNotification, userFavorites, addToFavorite, removeFromFavorite, userFollowingNoReipce } = useUser();
  const { createNotification } = useApp()

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState<string>('');
  const [allComments, setAllComments] = useState<any[]>([]);
  const [favoritesStatus, setFavoritesStatus] = useState<boolean>(false); 
  const [allFavorites, setAllFavorites] = useState<any[]>([])
  const [allLikes, setAllLikes] = useState<any[]>([]);
  const [likeStatus, setLikeStatus] = useState<boolean>(false);
  
  const [showShare, setShowShare] = useState<boolean>(false)
  
  const [maximizeVideo, setMaximizeVideo] = useState<boolean>(false)

  const [search, setSearch] = useState<string>('')
  const [results, setResults] = useState<any[]>([])

  const [selectedShare, setSelectedShare] = useState<string[]>([])

  const scrollViewRef = useRef(null);

  const screenHeight = Dimensions.get('window').height; 

  useEffect(() => {
    getComments();
    getFavorites();
    getLikes();
    getRandomUsers();
    checkForFollowing()
  }, []);

  const checkForFollowing = () => {
    if (userFollowingNoReipce.length > 10) {
      setResults(userFollowingNoReipce);
    } else {
      getRandomUsers();
    }
  }

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
      setResults(randomUsers); // Assuming you want to set the first random profile
    } catch (err) {
      console.error('An error occurred while fetching random users:', err);
    }
  };

  const toggleSelectedShare = (user_id: string) => {
    if(selectedShare.includes(user_id)){
      const updatedUsers = selectedShare.filter((item) => item !== user_id);
      setSelectedShare(updatedUsers)
    } else {
      setSelectedShare(prev => [...prev, user_id])
    }
  }

  const handleUpdateSearch = async (data: string) => {
    if(data === ''){
      setSearch(data)
      checkForFollowing()
    } else {
      setSearch(data)
      try {
        // Perform a query to search for profiles by both username and account_name
        const { data, error } = await supabase
          .from('Profiles')
          .select('*')
          .or(`username.ilike.%${search}%,account_name.ilike.%${search}%`); // Search in both username and account_name
        if (error) {
          console.error('Error fetching profiles:', error);
          return;
        }
        setResults(data); // Update the state with the fetched profiles
      } catch (err) {
        console.error('Unexpected error during profile search:', err);
      }
    }
  }

  const getFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('Favorites')
        .select('*')
        .eq('recipe_id', recipe.id);

      if (error) {
        console.error('Error getting likes:', error);
        return;
      }

      setAllFavorites(data);

      // Check if the user has liked the recipe
      const userLike = data.find((like: any) => like.user_id === currentProfile?.user_id);
      if (userLike) {
        setFavoritesStatus(true);
      } else {
        setFavoritesStatus(false);
      }
    } catch (error) {
      console.error('Unexpected error while getting likes:', error);
    }
  };

  const getLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('Likes')
        .select('*')
        .eq('recipe_id', recipe.id);

      if (error) {
        console.error('Error getting likes:', error);
        return;
      }

      setAllLikes(data);

      // Check if the user has liked the recipe
      const userLike = data.find((like: any) => like.user_id === currentProfile?.user_id);
      if (userLike) {
        setLikeStatus(true);
      } else {
        setLikeStatus(false);
      }
    } catch (error) {
      console.error('Unexpected error while getting likes:', error);
    }
  };

  const addLike = async () => {
    if (!currentProfile) {
      Alert.alert('Login Required', 'You need to be logged in to like a recipe.', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Login',
          onPress: () => navigation.navigate('LoginScreenFeed'),
        },
      ]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('Likes')
        .insert([
          {
            recipe_id: recipe.id,
            user_id: currentProfile.user_id,
          },
        ])
        .select();
      if (error) {
        console.error('Error adding like:', error);
      } else {
        createNotification(
          recipe.user_profile.user_id, 
          data[0].id,
          null,
          recipe.id,
          null,
          null,
          `${currentProfile.username} liked your recipe - ${recipe.title}`,
          currentProfile.user_id
        )
        getLikes(); // Refresh likes after adding
      }
    } catch (error) {
      console.error('Unexpected error while adding like:', error);
    }
  };


  const removeLikes = async () => {
    if (!currentProfile) {
      Alert.alert('Login Required', 'You need to be logged in to unlike a recipe.', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Login',
          onPress: () => navigation.navigate('LoginScreenFeed'),
        },
      ]);
      return;
    }

    try {
      const { error } = await supabase
        .from('Likes')
        .delete()
        .eq('recipe_id', recipe.id)
        .eq('user_id', currentProfile.user_id);

      if (error) {
        console.error('Error removing like:', error);
      } else {
        getLikes(); // Refresh likes after removing
      }
    } catch (error) {
      console.error('Unexpected error while removing like:', error);
    }
  };

  const getComments = async () => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('Comments')
        .select('*')
        .eq('recipe_id', recipe.id);

      if (commentsError) {
        console.error('Error getting comments:', commentsError);
        return;
      }

      const commentsWithProfiles = [];
      for (const comment of commentsData) {
        const { user_id } = comment;
        const { data: userProfile, error: userError } = await supabase
          .from('Profiles')
          .select('*')
          .eq('user_id', user_id)
          .single();
        if (userError) {
          console.error(`Error getting user profile for user_id ${user_id}:`, userError);
          continue;
        }
        commentsWithProfiles.push({
          ...comment,
          user_profile: userProfile,
        });
      }

      setAllComments(commentsWithProfiles);
    } catch (error) {
      console.error('Unexpected error while getting comments:', error);
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    if (contentOffsetY > 1000) {
      setShowCommentInput(true);
    } else {
      setShowCommentInput(false);
    }
  };

  const CreateComment = async () => {
    if (!currentProfile) {
      Alert.alert('Login Required', 'You need to be logged in to comment on a recipe.', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Login',
          onPress: () => navigation.navigate('LoginScreenFeed'),
        },
      ]);
      return;
    } else {
      try {
        const { data, error } = await supabase
          .from('Comments')
          .insert([
            {
              comment: comment,
              recipe_id: recipe.id,
              user_id: currentProfile.user_id,
            },
          ])
          .select();
        if (error) {
          console.error('Error inserting recipe:', error);
        } else {
          createNotification(
            recipe.user_profile.user_id,
            null,
            data[0].id,
            recipe.id,
            null,
            null,
            `${currentProfile.username} added a comment on ${recipe.title} - ${comment}`,
            currentProfile.user_id
          ) 
          generateNotification(recipe.user_profile.fcm_token, 'New Comment', `${currentProfile.username} added a comment on ${recipe.title}`)
          setComment('')
          getComments();
        }
      } catch (error) {
        console.error('Unexpected error while inserting recipe:', error);
      }
    }
  };

  function limitStringSize(str: string) {
    const maxLength = 25;
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  }

  const isLikedByUser = currentProfile && currentProfile.user_id ? allLikes.some((like) => like.user_id === currentProfile.user_id) : false
  const isFavorite = userFavorites.find((favorite) => favorite.recipe_id === recipe.id)

  const handleFavoriteToggle = () => {
    if(currentProfile && currentProfile.user_id){
      if (isFavorite) {
        // If the record exists, remove the recipe from favorites
        removeFromFavorite(isFavorite.id, currentProfile.user_id) // Pass the favorite's ID for removal
      } else {
        // If the record doesn't exist, add the recipe to favorites
        addToFavorite(currentProfile.user_id, recipe.id)
      }
    } else {
      Alert.alert('Login Required', 'You must be logged in to favorite this recipe')
    }
  }

  const handleLiked = () => {
    if(currentProfile && currentProfile.user_id){
      if (isLikedByUser) {
        removeLikes()
      } else {
        addLike()
      }
    } else {
      Alert.alert('Login Required', 'You must be logged in to like a recipe.')
    }
  }

  const toggleShowShare = () => {
    if(currentProfile && currentProfile.user_id){
      setShowShare(true)
    } else {
      Alert.alert('Login Required', 'You must be logged in to like a recipe.')
    }
  }

  const toggleShareWithPeople = () => {
    console.log('recipe to share: ', JSON.stringify(recipe.user_profile))
    setSelectedShare([])
    setShowShare(false)
    shareWithPeople(selectedShare, recipe.id, recipe.title, recipe.description, recipe.user_profile)
  }

  return (
    <KeyboardAvoidingView style={tailwind`flex-1 bg-white`} behavior="padding" keyboardVerticalOffset={90}>
      <StandardHeader
        header={limitStringSize(recipe.title)}
        back={true}
      />
      <ScrollView ref={scrollViewRef} style={tailwind`p-3`} onScroll={handleScroll} scrollEventThrottle={16}>
        <DisplayImageRecipe image={recipe.main_image} />
        <View style={tailwind`w-full flex flex-row items-center justify-between mt-4 px-3`}>
          <View style={tailwind`flex flex-row items-center`}>
            <TouchableOpacity 
              onPress={handleLiked} 
              style={tailwind`flex flex-row items-center`}
            >
              <Heart 
                height={24} 
                width={24} 
                color={'black'} 
                fill={isLikedByUser ? 'white' : 'none'} 
              />
              <Text style={tailwind`ml-1 text-base font-bold`}>{allLikes.length}</Text>
            </TouchableOpacity>
            <View style={tailwind`ml-4`}>
              <TouchableOpacity 
                onPress={handleFavoriteToggle} 
                style={tailwind``}
              >
                <Bookmark 
                  height={24} 
                  width={24} 
                  color={'black'} 
                  fill={isFavorite ? 'black' : 'none'} 
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={tailwind``}>
            <TouchableOpacity 
              onPress={toggleShowShare} 
              style={tailwind``}
            >
              <Send 
                height={24} 
                width={24} 
                color={'black'}
                
              />
            </TouchableOpacity>
          </View>
        </View>
        <RecipeDetails title={recipe.title} description={recipe.description} />
        <RecipeSummary
          prepTime={recipe.prep_time}
          coolTime={recipe.cook_time}
          servings={recipe.Nutrition[0].serving_size ? recipe.Nutrition[0].serving_size : 'N/A'}
          calories={recipe.Nutrition[0].calories ? recipe.Nutrition[0].calories :  'N/A'}
          course={recipe.Categories[0].category ? recipe.Categories[0].category :  'N/A'}
          cuisine={recipe.Cuisine[0].cuisine ? recipe.Cuisine[0].cuisine :  'N/A'}
        />
        {recipe.main_video != null  ? <DisplayVideoRecipe video={recipe.main_video}  maximize={() => {setMaximizeVideo(true)}}/> : null}
        <IngredientsDetails instructions={recipe.Ingredients} />
        <InstructionsDetails instructions={recipe.Instructions} />
        <View style={tailwind`my-3`}>
          <Text style={tailwind`text-2xl font-bold mb-3`}>Tip / Advice</Text>
          <Text style={tailwind`text-base`}>{recipe.tip}</Text>
        </View>
        <CategoriesDetails
          categories={recipe.Categories}
          cuisine={recipe.Cuisine[0].cuisine}
        />
        <NutritionDetails
          serving_size={recipe.Nutrition[0].serving_size ? recipe.Nutrition[0].serving_size :  null}
          calories={recipe.Nutrition[0].calories ? recipe.Nutrition[0].calories : null}
          total_fats={recipe.Nutrition[0].total_fats ? recipe.Nutrition[0].total_fats : null}
          saturated_fats={recipe.Nutrition[0].saturated_fats ? recipe.Nutrition[0].saturated_fats : null}
          trans_fats={recipe.Nutrition[0].trans_fats ? recipe.Nutrition[0].trans_fats : null}
          sodium={recipe.Nutrition[0].sodium ? recipe.Nutrition[0].sodium : null}
          total_carbs={recipe.Nutrition[0].total_carbs ? recipe.Nutrition[0].total_carbs : null}
          total_sugar={recipe.Nutrition[0].total_sugar ? recipe.Nutrition[0].total_sugar : null}
          protein={recipe.Nutrition[0].protein ? recipe.Nutrition[0].protein : null}
        />
        <AuthorDetails profile={recipe.user_profile} />
        <View style={tailwind`w-full h-.5 rounded-full bg-black mt-4`}></View>

        {allComments.length > 0 ? (
          <View style={tailwind`p-2 mt-3`}>
            {allComments.map((item, index) => {
              return (
                <View key={index.toString()} style={tailwind`flex`}>
                  <View style={tailwind`flex flex-row`}>
                    <Image style={tailwind`h-10 w-10 rounded-full`} alt="Profile Picture" source={{ uri: item.user_profile.profile_picture }} />
                    <Text style={tailwind`ml-3 text-base mt-2 font-bold`}>{item.user_profile.username}</Text>
                  </View>
                  <View style={tailwind`flex flex-row`}>
                    <View style={tailwind`h-10 w-10`}></View>
                    <Text style={tailwind`ml-3 text-base`}>{item.comment}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={tailwind`mt-4`}>
            <Text style={tailwind`text-2xl font-bold mb-3`}>Comments</Text>
            <Text>No Comments Found...</Text>
          </View>
        )}

        <View style={tailwind`h-20 w-full`}></View>
      </ScrollView>

      {showCommentInput && (
        <KeyboardAvoidingView behavior="padding" style={tailwind`absolute bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-300`}>
          <View style={tailwind`flex flex-row items-center`}>
            <TextInput
              style={tailwind`flex-1 p-3 border border-gray-300 rounded-lg`}
              placeholder="Add a comment..."
              multiline
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity onPress={() => CreateComment()} style={tailwind`ml-2 bg-sky-600 p-3 rounded-lg`}>
              <ChevronsUp height={20} width={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={maximizeVideo}
        onRequestClose={() => setMaximizeVideo(false)} // Close the modal
      >
        <View style={tailwind`flex-1 justify-center items-center bg-black`}>
          {
            recipe.main_video && (
              <Video
                source={{ uri: recipe.main_video }}
                style={[tailwind`w-full`, {height: screenHeight }]}
                resizeMode="contain"
                controls={true}
                paused={false}
                repeat={true}
              />
            )
          }
          {/* Minimize button */}
          <TouchableOpacity
            onPress={() => setMaximizeVideo(false)}
            style={tailwind`absolute top-19 left-4 h-10 w-10 bg-gray-700 rounded-full flex justify-center items-center`}
          >
            <Minimize height={20} width={20} color={'white'}/>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showShare}
        onRequestClose={() => setShowShare(false)}
      >
        <View style={tailwind`flex-1 justify-end bg-black bg-opacity-0`}>
          <View style={[tailwind`bg-slate-950 w-full rounded-t-lg p-4`, {height: Dimensions.get('screen').height * .7}]}>

            <View style={tailwind`w-full flex flex-row justify-between px-2 py-3`}>
              <Text style={tailwind`text-2xl font-bold mb-2 text-white`}>Share Recipe</Text>
              <TouchableOpacity onPress={() => {setShowShare(false)}}>
                <X height={28} width={28} color={'white'}/>
              </TouchableOpacity>
            </View>

            <View style={tailwind`w-full my-1 bg-slate-700 flex flex-row items-center p-2 rounded-3 mb-3`}>
              <User height={24} width={24} color={'white'}/>
              <View style={tailwind`flex-1 mx-3`}>
                <View style={tailwind`w-full px-2`}>
                  <TextInput 
                    value={search}
                    onChangeText={handleUpdateSearch}
                    placeholder={'search users...'}
                    placeholderTextColor={'grey'}
                    autoCapitalize={'none'}
                    multiline={false}
                    style={tailwind`w-full border-b-2 border-b-stone-700 text-base text-white pb-1 px-1`}
                    secureTextEntry={false}
                  />
                </View>
              </View>
              {
                search.length > 0
                  ? <TouchableOpacity onPress={() => {handleUpdateSearch('')}}>
                      <X height={24} width={24} color={'white'}/>
                    </TouchableOpacity>
                  : null
              }
            </View>

            {/* List of Followers */}
            <ScrollView style={tailwind`flex-1`}>
              {
                results.map((user, index) => (
                  <TouchableOpacity 
                    onPress={() => {toggleSelectedShare(user.user_id)}}
                    key={index} 
                    style={tailwind`flex flex-row items-center mb-3 border-b border-gray-200 pb-2`}
                  >
                    <View style={tailwind`flex-1 h-full flex flex-row items-center p-2`}>
                      {
                        user.profile_picture
                          ? <Image style={tailwind`h-10 w-10 rounded-full border-2 border-stone-400`} source={{ uri: user.profile_picture }} />
                          : <View style={tailwind`h-10 w-10 rounded-full border-2 border-stone-400 bg-stone-200`}></View>
                      }
                      <View style={tailwind`ml-2 flex-1 flex flex-row items-center`}>
                        <Text style={tailwind`font-bold text-base text-white`}>{user.username}</Text>
                        {
                          user.verified 
                            ? <Image style={tailwind`ml-2 h-4 w-4`} source={Verified}/>
                            : null
                        }
                      </View>
                      {
                        selectedShare.includes(user.user_id)
                          ? <Check height={24} width={24} style={tailwind`text-sky-600 font-bold`}/>
                          : null
                      }
                    </View>
                  </TouchableOpacity>
                ))
              }
            </ScrollView>
            {
              selectedShare.length > 0
                ? <View style={tailwind`mb-4`}><MainButton header='Share' clickButton={toggleShareWithPeople} loading={false}/></View>
                : null
            }
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default SingleRecipeScreen;
