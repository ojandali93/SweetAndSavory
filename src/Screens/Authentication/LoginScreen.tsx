import React, { useState } from 'react';
import { Text, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import tailwind from 'twrnc';
import TopLogin from '../../Components/Authentication/TopLogin';
import AuthInput from '../../Components/Inputs/Authentication/AuthInput';
import RedButton from '../../Components/Buttons/Authentication/RedButton';
import { useUser } from '../../Context/UserContext';
import { useNavigation } from '@react-navigation/native';
import AuthInputSecure from '../../Components/Inputs/Authentication/AuthInputSecure';

const LoginScreen = () => {

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const {loginUser} = useUser()
  const navigation = useNavigation()

  const submitUserLogin = () => {
    loginUser(username.toLowerCase(), password, navigation, 'ProfileScreen')
  }

  const handleUsername = (data: string) => {
    setUsername(data.toLocaleLowerCase())
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjusts based on the platform
      style={tailwind`flex-1 bg-white`}
    >
      <ScrollView contentContainerStyle={tailwind`flex-grow`} showsVerticalScrollIndicator={false}>
        <TopLogin />
        <View style={tailwind`w-full py-6 px-4`}>
          {/* Username Input */}
          <View style={tailwind``}>
            <AuthInput
              header='Username'
              valid={false}
              validation={false}
              placeholder='Username...'
              placeholderColor='grey'
              multi={false}
              value={username}
              onChange={handleUsername}
              loading={false}
              capitalization={false}
            />
          </View>

          {/* Password Input */}
          <View style={tailwind`mt-4`}>
            <AuthInputSecure
              header='Password'
              valid={false}
              validation={false}
              placeholder='Password...'
              placeholderColor='grey'
              value={password}
              onChange={setPassword}
              loading={false}
            />
          </View>

          {/* Forgot Password */}
          <View style={tailwind`w-full flex flex-row justify-end mt-1`}>
            <Text>Forgot Password?</Text>
          </View>

          {/* Login Button */}
          <View style={tailwind`mt-4`}>
            <RedButton header='Login' submit={submitUserLogin} loading={false}/>
          </View>

          {/* Create Account Link */}
          <View style={tailwind`w-full flex flex-row justify-center items-center mt-3`}>
            <Text>Don't have an account?</Text>
            <TouchableOpacity onPress={() => {navigation.navigate('SignupScreen')}}>
              <Text style={tailwind`ml-1 font-semibold text-red-500`}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
