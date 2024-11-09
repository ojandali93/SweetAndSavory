import React from 'react'
import { Text, View } from 'react-native'
import tailwind from 'twrnc'

interface RecipeDetailsProps {
  prepTime: string,
  coolTime: string,
  servings: string,
  calories: string,
  cuisine: string,
  course: string,
}

const RecipeSummary: React.FC<RecipeDetailsProps> = ({prepTime, coolTime, servings, calories, cuisine, course}) => {

  function parseCategories(inputString: string) {
    // Remove brackets and quotes, then split by commas
    return inputString
      .replace(/[\[\]"]+/g, '') // Remove brackets and quotes
      .split(',') // Split by commas and spaces
      .join(', '); // Join back with a comma and space
  }

  return (
    <View style={tailwind`mt-5`}>
      <View style={tailwind`w-full flex flex-row justify-between items-center`}>
        <Text style={tailwind`text-base font-semibold`}>Prep Time:</Text>
        <Text style={tailwind`text-base font-semibold`}>{prepTime}</Text>
      </View>
      <View style={tailwind`w-full flex flex-row justify-between items-center`}>
        <Text style={tailwind`text-base font-semibold`}>Cook Time:</Text>
        <Text style={tailwind`text-base font-semibold`}>{coolTime}</Text>
      </View>
      <View style={tailwind`w-full flex flex-row justify-between items-center`}>
        <Text style={tailwind`text-base font-semibold`}>Servings:</Text>
        <Text style={tailwind`text-base font-semibold`}>{servings}</Text>
      </View>
      {
        calories
          ? <View style={tailwind`w-full flex flex-row justify-between items-center`}>
              <Text style={tailwind`text-base font-semibold`}>Calories:</Text>
              <Text style={tailwind`text-base font-semibold`}>{calories}</Text>
            </View>
          : null
      }
      {
        cuisine 
          ? <View style={tailwind`w-full flex flex-row justify-between items-center`}>
              <Text style={tailwind`text-base font-semibold`}>Cuisine:</Text>
              <View style={tailwind`max-w-1/2`}>
                <Text style={tailwind`text-base font-semibold`}>{parseCategories(cuisine)}</Text>
              </View>
            </View>
          : null
      }
      {
        course 
          ? <View style={tailwind`w-full flex flex-row justify-between items-center`}>
              <Text style={tailwind`text-base font-semibold`}>Course:</Text>
              <Text style={tailwind`text-base font-semibold`}>{course}</Text>
            </View>
          : null
      }
    </View>
  )
}

export default RecipeSummary
