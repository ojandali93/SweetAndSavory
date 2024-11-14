import React, { useState } from 'react'
import { Dimensions, Image, TouchableOpacity, View } from 'react-native'
import { Maximize, Minimize, Pause, Play } from 'react-native-feather'
import Video from 'react-native-video'
import tailwind from 'twrnc'

const screenHeight = Dimensions.get('screen').height

interface DispayImageProps {
  video: string,
  maximize: () => void,
}

const DisplayVideoRecipe: React.FC<DispayImageProps> = ({video, maximize}) => {

  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [loadingVideo, setLoadingVideo] = useState<boolean>(false)

  return (
    <View style={[tailwind`w-full rounded-3 my-4`, {height: screenHeight * .7}]}>
      <Video
        source={{ uri: video }}
        paused={!isPlaying}
        style={[tailwind`w-full rounded-3 my-4`, {height: screenHeight * .7}]}
        resizeMode="cover"
        onLoadStart={() => setLoadingVideo(true)}
        onLoad={() => setLoadingVideo(false)}
        onError={(e) => console.log('Video error:', e)}
      />
      <View style={[tailwind`absolute z-10 w-full flex justify-between`, {height: screenHeight * .7}]}>
        <View style={tailwind`w-full h-full flex flex-row justify-center opacity-50 mb-16 mt-90`}>
          {isPlaying 
            ? (
              <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={tailwind`h-16 w-16 bg-slate-600 rounded-full flex justify-center items-center`}>
                <Pause height={30} width={30} color={'white'} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={tailwind`h-16 w-16 bg-slate-600 rounded-full flex justify-center items-center`}>
                <Play height={30} width={30} color={'white'} />
              </TouchableOpacity>
            )
          }
        </View>
        <View></View>
      </View>
    </View>
  )
}

export default DisplayVideoRecipe
