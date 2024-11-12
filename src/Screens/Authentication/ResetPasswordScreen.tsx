import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import StandardHeader from '../../Components/Headers/StandardHeader';
import tailwind from 'twrnc';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import AuthInput from '../../Components/Inputs/Authentication/AuthInput';
import AuthInputSecure from '../../Components/Inputs/Authentication/AuthInputSecure';
import MainButton from '../../Components/Buttons/Content/MainButton';
import { FeedStackParamList } from '../../Navigation/FeedStackNavigation';

type SingleRecipeRouteProp = RouteProp<FeedStackParamList, 'ResetPasswordScreen'>;

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<SingleRecipeRouteProp>();
  const { token, email } = route.params; // Extract token and email from deep link

  const [password, setPassword] = useState('');
  const [verify, setVerify] = useState('');

  const handleResetPassword = async () => {
    if (password !== verify) {
      Alert.alert('Error', 'Passwords do not match. Please ensure both fields are the same.');
      return;
    }

    try {
      // Use Supabase's REST API to reset password
      const response = await fetch('https://flrppwgsdjmhoazldryw.supabase.co/auth/v1/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Pass the token in the Authorization header
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message || 'There was an issue resetting the password.');
      } else {
        Alert.alert('Success', 'Your password has been reset successfully. Please log in with your new password.');
        navigation.navigate('FeedScreen'); // Redirect to FeedScreen
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <View style={tailwind`flex-1 bg-white`}>
      <StandardHeader header='Reset Password' back={true} />
      <View style={tailwind`flex-1 bg-white flex h-full w-full justify-end p-2`}>
        <Text style={tailwind`text-xl font-semibold mb-4`}>Reset your password</Text>
        
        <AuthInputSecure
          header='New Password'
          valid={false}
          validation={false}
          placeholder='*******'
          placeholderColor='grey'
          value={password}
          onChange={setPassword}
          loading={false}
        />

        <AuthInputSecure
          header='Verify Password'
          valid={false}
          validation={false}
          placeholder='*******'
          placeholderColor='grey'
          value={verify}
          onChange={setVerify}
          loading={false}
        />

        <MainButton header='Reset Password' clickButton={handleResetPassword} loading={false} />
      </View>
    </View>
  );
};

export default ResetPasswordScreen;
