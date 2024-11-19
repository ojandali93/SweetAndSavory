import React from 'react'
import { Alert, Dimensions, Image, Text, TouchableOpacity, View } from 'react-native'
import { Bookmark, Check, MoreHorizontal, Trash, Trash2 } from 'react-native-feather'
import tailwind from 'twrnc'
import Portrait from '../../Assets/portrait.jpg'
import { useNavigation } from '@react-navigation/native'
import { useUser } from '../../Context/UserContext'
import supabase from '../../Utils/supabase'

const imageWidth = Dimensions.get('screen').width
const imageHeight = imageWidth - 86

interface RecipeProps {
  recipe: any,
}

const RecipeTileShare: React.FC<RecipeProps> = ({recipe}) => {
  const navigation = useNavigation()

  console.log('Passed in share recipe: ', JSON.stringify(recipe))

  const limitStringLength = (text: string) => {
    if (text.length > 96) {
      return text.substring(0, 96) + '...';
    }
    return text;
  };

  const goToShareScreen = async (recipe_id: number) => {
    try {
      const { data: recipesData, error: recipesError } = await supabase
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
        .eq('id', recipe_id);

      if (recipesError) {
        console.error('Error fetching recipes for user:', recipesError);
        return;
      }

      if(recipesData){
        console.log('this is a single recipe that is being passed: ', recipesData[0])
        navigation.navigate('SingleRecipeScreen', {recipe: recipesData[0]})
      }

    } catch (err) {
      console.error('An error occurred while fetching recipes and profiles:', err);
    }
  };

  return (
    <TouchableOpacity onPress={() => goToShareScreen(recipe.id)} style={tailwind`w-full rounded-3 bg-stone-200 mb-2`}>
      <View style={[tailwind`w-full rounded-3`, {height: imageHeight}]}>
        <Image style={tailwind`w-full h-full rounded-3`} source={{uri: recipe.main_image}}/>
      </View>
      <View style={[tailwind`absolute z-10 opacity-50 w-full h-86 bg-slate-900 rounded-3`, {height: imageHeight}]}></View>
      <View style={[tailwind`absolute z-15 w-full h-86 flex flex-col justify-between p-3`, {height: imageHeight}]}>
        <View></View>
        <View>
          <Text style={tailwind`text-2xl font-bold text-white`}>{recipe.title}</Text>
          <Text style={tailwind`text-base text-white font-semibold mb-3`}>{limitStringLength(recipe.description)}</Text>
          <View style={tailwind`flex flex-row justify-between items-center`}>
            <Text style={tailwind`text-base font-bold text-white`}>Prep Time: {recipe.prep_time}</Text>
            <Text style={tailwind`text-base font-bold text-white`}>Cook Time: {recipe.cook_time}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default RecipeTileShare
