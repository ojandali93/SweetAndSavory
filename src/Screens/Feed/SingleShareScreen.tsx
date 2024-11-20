import React from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import StandardHeader from '../../Components/Headers/StandardHeader'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FeedStackParamList } from '../../Navigation/FeedStackNavigation';
import { useUser } from '../../Context/UserContext';
import tailwind from 'twrnc';
import RecipeTile from '../../Components/Tiles/RecipeTile';
import RecipeTileNoProfile from '../../Components/Tiles/RecipeTileNoProfile';
import RecipeTileShare from '../../Components/Tiles/RecipeTileShare';
import supabase from '../../Utils/supabase';

type SingleRecipeRouteProp = RouteProp<FeedStackParamList, 'SingleShareScreen'>;

const SingleShareScreen = () => {
  const route = useRoute<SingleRecipeRouteProp>();
  const { username, item } = route.params;

  const navigation = useNavigation()

  const { shareRecipes, currentProfile, acceptShareRequest, removeShareRequest } = useUser()

  return (
    <View style={tailwind`flex-1`}>
      <StandardHeader header={username} back={true}/>
      <View style={tailwind`p-3 flex-1`}>
        <FlatList
          data={shareRecipes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={(item) => {
            return(
              <View style={tailwind`flex-1`}>
                {
                  item.item.sender_id === currentProfile.user_id
                    ? (
                      <View style={tailwind`w-full flex flex-row justify-start`}>
                        <View style={tailwind`w-11/12`}>
                          <RecipeTileShare recipe={item.item.Recipes}/>
                        </View>
                      </View>
                    ) : (
                      <View style={tailwind`w-full flex flex-row justify-end`}>
                        <View style={tailwind`w-11/12`}>
                          <RecipeTileShare recipe={item.item.Recipes}/>
                        </View>
                      </View>
                    )
                }
              </View>
            )
          }}
        />
        {
          item.status === 'requested'
            ? item.requested_from != currentProfile.user_id ? (
                <View>
                  <View style={tailwind`w-full py-2 flex flex-row items-center justify-center`}>
                    <Text style={tailwind`font-semibold text-lg`}>{username} wants to share recipes with you</Text>
                  </View>
                  <View style={tailwind`w-full flex flex-row items-center justify-center px-2`}>
                    <TouchableOpacity onPress={() => {acceptShareRequest(item.id, navigation)}} style={tailwind`w-1/3 rounded-4 border-2 border-stone-300 bg-sky-600 flex flex-row justify-center mx-3`}>
                      <Text style={tailwind`text-white text-base font-bold py-3`}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {removeShareRequest(item.id, navigation)}} style={tailwind`w-1/3 rounded-4 border-2 border-stone-300 bg-stone-400 flex flex-row justify-center  mx-3`}>
                      <Text style={tailwind`text-white text-base font-bold py-3`}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
              : <View style={tailwind`w-full py-2 flex flex-row items-center justify-center`}>
                  <Text style={tailwind`font-semibold text-lg`}>A pending request has been sent to {username}</Text>
                </View>
            : null
        }
      </View>
    </View>
  )
}

export default SingleShareScreen
