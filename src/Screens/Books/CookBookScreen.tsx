import React from 'react'
import { View } from 'react-native'
import tailwind from 'twrnc'
import StandardHeader from '../../Components/Headers/StandardHeader'
import { useNavigation } from '@react-navigation/native'


const CookBookScreen = () => {
  const navigation = useNavigation()

  return (
    <View style={tailwind`flex-1 bg-white`}>
      <StandardHeader 
        header='Cookbooks'
        add={true}
        addClick={() => {}}
      />
    </View>
  )
}

export default CookBookScreen

