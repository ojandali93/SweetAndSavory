import React from 'react'
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native'
import { MoreHorizontal } from 'react-native-feather'
import tailwind from 'twrnc'
import Portrait from '../../Assets/portrait.jpg'
import { useNavigation } from '@react-navigation/native'

const imageWidth = Dimensions.get('screen').width
const imageHeight = imageWidth - 86

interface RecipeProps {
  image: string 
  title: string
  description: string
}

const TemplateCollection: React.FC<RecipeProps> = ({image, title, description}) => {

  return (
    <TouchableOpacity style={tailwind`w-full rounded-3 bg-stone-200 mb-2`}>
      <View style={[tailwind`w-full rounded-3`, {height: imageHeight}]}>
        <Image style={tailwind`w-full h-full rounded-3`} source={{uri: image}}/>
      </View>
      <View style={[tailwind`absolute z-10 opacity-50 w-full h-86 bg-slate-900 rounded-3`, {height: imageHeight}]}></View>
      <View style={[tailwind`absolute z-15 w-full h-86 flex flex-col justify-between p-3`, {height: imageHeight}]}>
        <View></View>
        <View>
          <Text style={tailwind`text-2xl font-bold text-white`}>{title}</Text>
          <Text style={tailwind`text-base text-white font-semibold mb-3`}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default TemplateCollection
