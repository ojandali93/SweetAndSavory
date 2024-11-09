import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
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
import { ChevronsUp, Minimize } from 'react-native-feather';
import supabase from '../../Utils/supabase';
import { useUser } from '../../Context/UserContext';
import Video from 'react-native-video';
import { useApp } from '../../Context/AppContext';
import { ProfileStackNavigator } from '../../Navigation/ProfileStackNavigation';

type SingleRecipeRouteProp = RouteProp<ProfileStackNavigator, 'SingleRecipeScreen'>;

const SingleRecipeScreen = () => {
  const route = useRoute<SingleRecipeRouteProp>();
  const { recipe } = route.params;

  const navigation = useNavigation();
  const { currentProfile, generateNotification } = useUser();
  const { createNotification } = useApp()

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState<string>('');
  const [allComments, setAllComments] = useState<any[]>([]);
  const [favoritesStatus, setFavoritesStatus] = useState<boolean>(false); 
  const [allFavorites, setAllFavorites] = useState<any[]>([])
  const [allLikes, setAllLikes] = useState<any[]>([]);
  const [likeStatus, setLikeStatus] = useState<boolean>(false);
  
  const [maximizeVideo, setMaximizeVideo] = useState<boolean>(false)

  const scrollViewRef = useRef(null);

  const screenHeight = Dimensions.get('window').height; // Get screen height

  useEffect(() => {
    getComments();
    getFavorites();
    getLikes();
  }, []);

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

  const addFavorite = async () => {
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
        .from('Favorites')
        .insert([
          {
            recipe_id: recipe.id,
            user_id: currentProfile.user_id,
          },
        ]);
      if (error) {
        console.error('Error adding like:', error);
      } else {
        createNotification(
          recipe.user_profile.user_id, 
          null,
          null,
          recipe.id,
          null,
          null,
          `${recipe.title} was added to favorites`,
          currentProfile.user_id
        )
        generateNotification(recipe.user_profile.fcm_token, 'New Favorite', `${recipe.title} was added to favorites`)
        getFavorites(); // Refresh likes after adding
      }
    } catch (error) {
      console.error('Unexpected error while adding like:', error);
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

  const removeFavorite = async () => {
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
        .from('Favorites')
        .delete()
        .eq('recipe_id', recipe.id)
        .eq('user_id', currentProfile.user_id);

      if (error) {
        console.error('Error removing like:', error);
      } else {
        getFavorites(); // Refresh likes after removing
      }
    } catch (error) {
      console.error('Unexpected error while removing like:', error);
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

  return (
    <KeyboardAvoidingView style={tailwind`flex-1 bg-white`} behavior="padding" keyboardVerticalOffset={90}>
      <StandardHeader
        header={limitStringSize(recipe.title)}
        back={true}
        activeFavorites={true}
        activeFavoritesStatus={favoritesStatus}
        addFavorite={addFavorite}
        removeFavofite={removeFavorite}
        like={true}
        likeStatus={likeStatus}
        addLike={addLike}
        removeLike={removeLikes}
      />
      <ScrollView ref={scrollViewRef} style={tailwind`p-3`} onScroll={handleScroll} scrollEventThrottle={16}>
        <DisplayImageRecipe image={recipe.main_image} />
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
            <TouchableOpacity onPress={() => CreateComment()} style={tailwind`ml-2 bg-red-500 p-3 rounded-lg`}>
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
    </KeyboardAvoidingView>
  );
};

export default SingleRecipeScreen;
