import React from 'react'
import { View } from 'react-native'
import StandardHeader from '../../Components/Headers/StandardHeader'
import tailwind from 'twrnc'

const ShareScreen = () => {
  return (
    <View style={tailwind`flex-1`}>
      <StandardHeader
        header="Shared"
        back={true}
      />
      <View style={tailwind`flex-1`}>

      </View>
    </View>
  )
}

export default ShareScreen
