import React from 'react'
import { Image, Text, View } from 'react-native'
import tailwind from 'twrnc'
import Verified from '../../Assets/POS-verified-blue.png'

interface NameAndImageProps {
  username: string,
  accountName: string,
  profilePicture: string,
  verified: boolean
}

const NameAndImageProfile: React.FC<NameAndImageProps> = ({username, accountName, profilePicture, verified}) => {
  return (
    <View style={tailwind`flex flex-row items-center`}>
      <View style={tailwind`h-16 w-16`}>
        <Image alt='Profile Picture' style={tailwind`h-16 w-16 bg-stone-300 rounded-full`} source={{uri: profilePicture}} />
      </View>
      <View style={tailwind`ml-4`}>
        <View style={tailwind`flex flex-row items-center`}>
          <Text style={tailwind`text-xl font-semibold`}>{username}</Text>
          {
            verified 
              ? <Image style={tailwind`ml-2 h-4 w-4`} source={Verified}/>
              : null
          }
        </View>
        <Text style={tailwind`text-base`}>{accountName}</Text>
      </View>
    </View>
  )
}

export default NameAndImageProfile
