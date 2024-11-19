import React from 'react'
import { FlatList, View } from 'react-native'
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
  const { username } = route.params;

  const navigation = useNavigation()

  const { shareRecipes, currentProfile } = useUser()

  return (
    <View>
      <StandardHeader header={username} back={true}/>
      <View style={tailwind`p-3`}>
        <FlatList
          data={shareRecipes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={(item) => {
            return(
              <View>
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
      </View>
    </View>
  )
}

export default SingleShareScreen
