import React, { useCallback, useState } from 'react'
import { FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native'
import StandardHeader from '../../Components/Headers/StandardHeader'
import tailwind from 'twrnc'
import { useUser } from '../../Context/UserContext'
import { ChevronRight } from 'react-native-feather'
import { useNavigation } from '@react-navigation/native'

const ShareScreen = () => {
  const navigation = useNavigation()

  const {userShared, currentProfile, getUserShared, getSharedRecipes} = useUser()

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getUserShared(currentProfile.user_id)
    setRefreshing(false)
  }, [userShared]);

  const goToShareScreen = (share_id: number, username: string) => {
    getSharedRecipes(share_id)
    navigation.navigate('SingleShareScreen', {username: username})
  }

  return (
    <View style={tailwind`flex-1`}>
      <StandardHeader
        header="Shared"
        back={true}
      />
      <View style={tailwind`flex-1`}>
        <FlatList
          data={userShared}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={(item) => {
            return(
              <View style={tailwind`p-3 border-b-2 border-b-stone-200`}>
                {
  item.item.user_1_profile.user_id === currentProfile.user_id 
    ? (
      <TouchableOpacity onPress={() => {goToShareScreen(item.item.id, item.item.user_2_profile.username)}} style={tailwind`w-full flex flex-row`}>
        {
          item.item.user_2_profile.profile_picture 
            ? <Image alt='profile picture' style={tailwind`h-14 w-14 rounded-full border-2 border-stone-400`} source={{uri: item.item.user_2_profile.profile_picture}}/>
            : <View style={tailwind`h-14 w-14 rounded-full bg-stone-300 border-2 border-stone-400`}></View>
        }
        <View style={tailwind`ml-3 flex-1 flex flex-col justify-center`}>
          <Text style={tailwind`text-lg text-black font-bold`}>{item.item.user_2_profile.username}</Text>
          <Text style={tailwind`text-base text-black`} numberOfLines={1}>{item.item.recipe_description}</Text>
        </View>
        <View style={tailwind`ml-3 flex flex-col justify-center`}>
          <ChevronRight height={28} width={28} style={tailwind`text-sky-600`}/>
        </View>
      </TouchableOpacity>
    )
    : (
      <TouchableOpacity onPress={() => {goToShareScreen(item.item.id, item.item.user_1_profile.username)}} style={tailwind`w-full flex flex-row`}>
        {
          item.item.user_1_profile.profile_picture 
            ? <Image alt='profile picture' style={tailwind`h-14 w-14 rounded-full bg-stone-300 border-2 border-stone-400`} source={{uri: item.item.user_1_profile.profile_picture}}/>
            : <View style={tailwind`h-14 w-14 rounded-full bg-stone-300 border-2 border-stone-400`}></View>
        }
        <View style={tailwind`ml-3 flex-1 flex flex-col justify-center`}>
          <Text style={tailwind`text-lg text-black font-bold`}>{item.item.user_1_profile.username}</Text>
          <Text style={tailwind`text-base text-black`} numberOfLines={1}>{item.item.recipe_description}</Text>
        </View>
        <View style={tailwind`ml-3 flex flex-col justify-center`}>
          <ChevronRight height={28} width={28} style={tailwind`text-sky-600`}/>
        </View>
      </TouchableOpacity>
    )
}
              </View>
            )
          }}
        />
      </View>
    </View>
  )
}

export default ShareScreen
