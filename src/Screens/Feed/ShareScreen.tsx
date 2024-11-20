import React, { useCallback, useState } from 'react'
import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native'
import StandardHeader from '../../Components/Headers/StandardHeader'
import tailwind from 'twrnc'
import { useUser } from '../../Context/UserContext'
import { ChevronRight } from 'react-native-feather'
import { useNavigation } from '@react-navigation/native'
import { Swipeable } from 'react-native-gesture-handler'
import supabase from '../../Utils/supabase'

const ShareScreen = () => {
  const navigation = useNavigation()

  const {userShared, currentProfile, getUserShared, getSharedRecipes, removeShareRequest} = useUser()

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getUserShared(currentProfile.user_id)
    setRefreshing(false)
  }, [userShared]);

  const goToShareScreen = (share_id: number, username: string, item: any) => {
    getSharedRecipes(share_id)
    navigation.navigate('SingleShareScreen', {username: username, item: item})
  }

  const handleDelete = async (share_id: number) => {
    Alert.alert('Delete Share', 'Are you sure you want to delete this share?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { data: createdData, error: createdError} = await supabase 
              .from('Share')
              .delete()
              .eq('id', share_id);

              if(createdError){
                console.log('Error creating the recipe share: ', createdError)
              } else {
                getUserShared(currentProfile.user_id)
              }
          } catch (error) {
            console.error('Error deleting share:', error);
          }
        },
      },
    ]);
  };

  const renderRightActions = (share_id: number) => (
    <TouchableOpacity
      onPress={() => handleDelete(share_id)}
      style={tailwind`bg-red-500 flex justify-center items-center w-24`}
    >
      <Text style={tailwind`text-white font-bold`}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <View style={tailwind`flex-1`}>
      <StandardHeader
        header="Shared"
        back={true}
      />
      <View style={tailwind`flex-1 p-2`}>
        <FlatList
          data={userShared}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={(item) => {
            return(
              <Swipeable renderRightActions={() => renderRightActions(item.item.id)}>
                <View style={tailwind`p-3 border-b-2 border-b-stone-200`}>
                  {
                    item.item.user_1_profile.user_id === currentProfile.user_id 
                      ? (
                        <TouchableOpacity onPress={() => {goToShareScreen(item.item.id, item.item.user_2_profile.username, item.item)}} style={tailwind`w-full flex flex-row`}>
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
                        <TouchableOpacity onPress={() => {goToShareScreen(item.item.id, item.item.user_1_profile.username, item.item)}} style={tailwind`w-full flex flex-row`}>
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
              </Swipeable>
            )
          }}
        />
      </View>
    </View>
  )
}

export default ShareScreen
