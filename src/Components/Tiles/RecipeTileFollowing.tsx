import React, { useEffect, useRef, useState } from 'react'
import { Alert, Dimensions, Image, Modal, Text, TouchableOpacity, View } from 'react-native'
import { Bookmark, BookmarkFill, MoreHorizontal, Heart, File, User, ChevronsRight, MessageSquare } from 'react-native-feather';// Assuming you have a filled bookmark icon
import tailwind from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { useUser } from '../../Context/UserContext'
import supabase from '../../Utils/supabase';
import { useApp } from '../../Context/AppContext';
import Verified from '../../Assets/POS-verified.png'

const imageWidth = Dimensions.get('screen').width
const imageHeight = imageWidth - 86

interface RecipeProps {
  recipe: any
}

const RecipeTileFollowing: React.FC<RecipeProps> = ({ recipe }) => {
  const navigation = useNavigation()

  const { userFavorites, addToFavorite, removeFromFavorite, 
    currentProfile, generateNotification } = useUser()
  const { createNotification } = useApp()

  const [showOptions, setShowOptions] = useState<boolean>(false)
  const [showReason, setShowReason] = useState<boolean>(false)
  const [reportType, setReportType] = useState<string>('')
  const [userLikes, setUserLikes] = useState<any[]>([])
  const [userComments, setRecipeComments] = useState<any[]>([])

  useEffect(() => {
    grabRecipeLikes()
    grabRecipeComments()
  }, [])

  // Store the actual favorite record, if it exists
  const isFavorite = userFavorites.find((favorite) => favorite.recipe_id === recipe.id)
  const isLikedByUser = userLikes.some((like) => like.user_id === currentProfile.user_id)


  const handleFavoriteToggle = () => {
    if (isFavorite) {
      // If the record exists, remove the recipe from favorites
      removeFromFavorite(isFavorite.id, currentProfile.user_id) // Pass the favorite's ID for removal
    } else {
      // If the record doesn't exist, add the recipe to favorites
      addToFavorite(currentProfile.user_id, recipe.id)
    }
  }

  const grabRecipeLikes = async () => {
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('Likes')
        .select(`*`)
        .eq('recipe_id', recipe.id); 
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        return;
      }
      setUserLikes(collectionsData)
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  }

  const grabRecipeComments = async () => {
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('Comments')
        .select(`*`)
        .eq('recipe_id', recipe.id); 
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        return;
      }
      setRecipeComments(collectionsData)
    } catch (err) {
      console.error('An error occurred while fetching user lists and recipes:', err);
    }
  }

  const limitStringLength = (text: string) => {
    if (text.length > 96) {
      return text.substring(0, 96) + '...';
    }
    return text;
  }

  const selectPostOption = () => {
    setReportType('post')
    setShowOptions(false)
    setShowReason(true)
  }

  const selectUserOption = () => {
    setReportType('user')
    setShowOptions(false)
    setShowReason(true)
  }

  const closeOptions = () => {
    setShowOptions(false)
    setShowReason(false)
    setReportType('')
  }

  const reportPost = async (recipe_id: number, category: string) => {
    try {
      const { error: profileError } = await supabase
        .from('Reports')
        .insert([
          {
            user_id: null,  // Make sure this maps to user_id in the DB
            recipe_id: recipe_id,
            comment_id: null,
            category: category,
            reporting_user: currentProfile.user_id,
          },
        ]);
      if (profileError) {
        console.error('Error reporting user:', profileError.message);
        return;
      }

      setShowOptions(false)
      setShowReason(false)
      Alert.alert('Report Confirmed', 'We have received your report and we will investigate the claim.')
    } catch(err) {
      console.error('An error occurred while creating an account:', err);
    }
  }

  const reportUser = async (recipe_id: number, user_id: string, category: string) => {
    try {
      const { error: profileError } = await supabase
        .from('Reports')
        .insert([
          {
            user_id: user_id,  // Make sure this maps to user_id in the DB
            recipe_id: recipe_id,
            comment_id: null,
            category: category,
            reporting_user: currentProfile.user_id,
          },
        ]);
      if (profileError) {
        console.error('Error reporting user:', profileError.message);
        return;
      }

      setShowOptions(false)
      setShowReason(false)
      Alert.alert('Report Confirmed', 'We have received your report and we will investigate the claim.')
    } catch(err) {
      console.error('An error occurred while creating an account:', err);
    }
  }

  const lastTapRef = useRef<number>(0);

  const handleDoubleTap = () => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300 

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (isLikedByUser) {
        removeLikes()
      } else {
        addLikes()
      }
    }
    lastTapRef.current = now
  }

  const addLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('Likes')
        .insert([
          { user_id: currentProfile.user_id, recipe_id: recipe.id }
        ])
        .select()
      if (error) {
        console.error('Error adding like:', error)
        return
      }
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
      generateNotification(recipe.user_profile.fcm_token, 'New Like', `${currentProfile.username} liked your recipe - ${recipe.title}`)
      grabRecipeLikes()
    } catch (error) {
      console.error('Error creating like:', error)
    }
  }

  const removeLikes = async () => {
    const likeToDelete = userLikes.find((like) => like.user_id === currentProfile.user_id)
    if (!likeToDelete) return

    try {
      const { error } = await supabase
        .from('Likes')
        .delete()
        .eq('id', likeToDelete.id)
      if (error) {
        console.error('Error deleting like:', error)
        return
      }
      grabRecipeLikes()
    } catch (error) {
      console.error('Error deleting like:', error)
    }
  }

  return ( 
    <View style={tailwind`w-full rounded-3 bg-stone-200 mb-2`}>      
      <TouchableOpacity onPress={() => showOptions || showReason ? closeOptions() : navigation.navigate('SelectedProfileScreen', { user_id: recipe.user_profile.user_id })} style={tailwind`w-full h-14 flex flex-row justify-between items-center px-2`}>
        <View style={tailwind`flex-1 h-full flex flex-row items-center`}>
          <Image style={tailwind`h-10 w-10 rounded-full border-2 border-stone-400`} source={{ uri: recipe.user_profile.profile_picture }} />
          <View style={tailwind`ml-2 flex flex-row items-center`}>
            <Text style={tailwind`font-bold text-base`}>{recipe.user_profile.username}</Text>
            {
              recipe.user_profile.verified 
                ? <Image style={tailwind`ml-2 h-4 w-4`} source={Verified}/>
                : null
            }
          </View>
        </View>
        <TouchableOpacity onPress={() => {setShowOptions(!showOptions)}}>
          <MoreHorizontal height={24} width={24} color={'black'} />
        </TouchableOpacity>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDoubleTap}>
        <View style={[tailwind`w-full rounded-3`, { height: imageHeight }]}>
          <Image style={tailwind`w-full h-full rounded-3`} source={{ uri: recipe.main_image }} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDoubleTap} style={[tailwind`absolute z-15 w-full h-86 mt-14 flex flex-col justify-between py-4 px-3`, { height: imageHeight }]}>
        <View style={tailwind`flex flex-row justify-between`}>
          <Text style={tailwind`text-base font-bold text-white`}>Yield: {recipe.yield}</Text>
          <TouchableOpacity onPress={handleFavoriteToggle}>
            {isFavorite ? (
              <Bookmark height={24} width={24} color={'white'} fill={'white'}/> // Filled bookmark for favorite
            ) : (
              <Bookmark height={24} width={24} color={'white'} /> // Empty bookmark for non-favorite
            )}
          </TouchableOpacity>
        </View>
        <View>
          <Text style={tailwind`text-2xl font-bold text-white`}>{recipe.title}</Text>
          <Text style={tailwind`text-base text-white font-semibold mb-3`}>{limitStringLength(recipe.description)}</Text>
          <View style={tailwind`flex flex-row justify-between items-center`}>
            <Text style={tailwind`text-base font-bold text-white`}>Prep Time: {recipe.prep_time}</Text>
            <Text style={tailwind`text-base font-bold text-white`}>Cook Time: {recipe.cook_time}</Text>
          </View>
        </View>
        {
          showOptions
            ? <View style={tailwind`absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center`}>
                <View style={tailwind`flex-1 w-full flex items-center justify-center`}>
                  <View style={tailwind` w-48 bg-slate-950 p-3 rounded-4`}>
                    <View style={tailwind`p-2`}>
                      <Text style={tailwind`text-white text-xl font-bold`}>Options</Text>
                    </View>
                    <View style={tailwind`bg-slate-700 rounded-2 mt-1 mb-3`}>
                      <TouchableOpacity onPress={() => {selectPostOption()}} style={tailwind`flex flex-row items-center p-2 border-b-2 border-b-slate-950`}>
                        <File height={18} width={18} color={'white'}/>
                        <Text style={tailwind`text-white text-base font-white ml-2`}>Report Recipe</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {selectUserOption()}} style={tailwind`flex flex-row items-center p-2`}>
                        <User height={18} width={18} color={'white'}/>
                        <Text style={tailwind`text-white text-base font-white ml-2`}>Report User</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            : null
        }
        {
          showReason
            ? <View style={tailwind`absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center`}>
                <View style={tailwind`flex-1 w-full flex items-center justify-center`}>
                  <View style={tailwind` w-64 bg-slate-950 p-3 rounded-4`}>
                    <View style={tailwind`p-2`}>
                      <Text style={tailwind`text-white text-xl font-bold`}>Reason For Report</Text>
                    </View>
                    <View style={tailwind`bg-slate-700 rounded-2 mt-1 mb-3`}>
                      <TouchableOpacity onPress={() => {reportType === 'post' ? reportPost(recipe.id, 'harassment') : reportUser(recipe.id, recipe.Profiles.user_id, 'harassment')}} style={tailwind`flex flex-row items-center p-2 border-b-2 border-b-slate-950`}>
                        <Text style={tailwind`text-white text-base font-white ml-2`}>Harassment</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {reportType === 'post' ? reportPost(recipe.id, 'violence') : reportUser(recipe.id, recipe.Profiles.user_id, 'violence')}} style={tailwind`flex flex-row items-center p-2 border-b-2 border-b-slate-950`}>
                        <Text style={tailwind`text-white text-base font-white ml-2`}>Violence</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {reportType === 'post' ? reportPost(recipe.id, 'inappropriate') : reportUser(recipe.id, recipe.Profiles.user_id, 'inappropriate')}} style={tailwind`flex flex-row items-center p-2 border-b-2 border-b-slate-950`}>
                        <Text style={tailwind`text-white text-base font-white ml-2`}>Inappropriate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {reportType === 'post' ? reportPost(recipe.id, 'false info') : reportUser(recipe.id, recipe.Profiles.user_id, 'false info')}} style={tailwind`flex flex-row items-center p-2 border-b-2 border-b-slate-950`}>
                        <Text style={tailwind`text-white text-base font-white ml-2`}>False Information</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {reportType === 'post' ? reportPost(recipe.id, 'spam') : reportUser(recipe.id, recipe.Profiles.user_id, 'spam')}} style={tailwind`flex flex-row items-center p-2`}>
                        <Text style={tailwind`text-white text-base font-white ml-2`}>Spam</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            : null
        }
      </TouchableOpacity>
      <View style={[tailwind`absolute z-10 opacity-50 w-full h-86 bg-slate-900 rounded-3 mt-14`, { height: imageHeight }]}></View>
      <View style={tailwind`w-full flex`}>
        <View style={tailwind`w-full h-12 flex flex-row items-center justify-between px-3`}>
          <View style={tailwind`flex flex-row items-center`}>
            <View style={tailwind`flex flex-row items-center`}>
              <Heart height={24} width={24} color={'black'}/>
              <Text style={tailwind`ml-1 text-base font-bold`}>{userLikes.length}</Text>
            </View>
            <View style={tailwind`flex flex-row items-center ml-4`}>
              <MessageSquare height={24} width={24} color={'black'}/>
              <Text style={tailwind`ml-1 text-base font-bold`}>{userComments.length}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => {navigation.navigate('SingleRecipeScreen', {recipe: recipe})}} style={tailwind`flex flex-row items-center bg-red-500 px-3 py-1 rounded-2`}>
            <Text style={tailwind`text-sm text-white font-bold`}>View Recipe</Text>
            <ChevronsRight height={24} width={24} color={'white'}/>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default RecipeTileFollowing
