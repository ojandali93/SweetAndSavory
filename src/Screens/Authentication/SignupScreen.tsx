import React, { useState } from 'react';
import { Text, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import tailwind from 'twrnc';
import TopLogin from '../../Components/Authentication/TopLogin';
import AuthInput from '../../Components/Inputs/Authentication/AuthInput';
import RedButton from '../../Components/Buttons/Authentication/RedButton';
import { useUser } from '../../Context/UserContext';
import { useNavigation } from '@react-navigation/native';
import FixedTopLogin from '../../Components/Authentication/FixedTopLogin';
import supabase from '../../Utils/supabase';
import { Heart } from 'react-native-feather';
import AuthInputSecure from '../../Components/Inputs/Authentication/AuthInputSecure';
import AuthInputValidation from '../../Components/Inputs/Authentication/AuthInputValidation';

const SignupScreen = () => {

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [verifyPassword, setVerifyPassword] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')

  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null); 

  const [loadingUsernameSearch, setLoadingUsernameSearch] = useState<boolean>(false)
  const [loadingEmailSearch, setLoadingEmailSearch] = useState<boolean>(false)
  const [validUsername, setValidUsername] = useState<boolean>(true)
  const [availableUsername, setAvailableUsername] = useState<boolean>(true)
  const [validEmail, setValidEmail] = useState<boolean>(false)
  const [availableEmail, setAvailableEmail] = useState<boolean>(true)
  const [validPassword, setValidPassword] = useState<boolean>(false)
  const [validPasswordAndVerify, setValidPasswordAndVerify] = useState<boolean>(false)

  const navigation = useNavigation()

  const submitUserLogin = () => {
    if (validUsername && validEmail && availableEmail && availableUsername && validPassword && validPasswordAndVerify && username.length > 0) {
      // Reset all input fields to empty strings
      setUsername('');
      setPassword('');
      setVerifyPassword('');
      setEmail('');
      setFirstName('');
      setLastName('');
  
      // Navigate to ProfileSetupScreen with parameters
      navigation.navigate('ProfileSetupScreen', {
        username, 
        firstName, 
        lastName,
        email,
        password,
        name: `${firstName} ${lastName}`,
      });
    } else {
      Alert.alert('Invalid Information', 'There are some fields that are not valid. Correct and resubmit.');
    }
  };

  const validateUsername = (data: string) => {
    setUsername(data)
    setValidUsername(false)
  }

  const validatePassword = (data: string) => {
    setPassword(data)
    const hasUpperCase = /[A-Z]/.test(data);
    const hasLowerCase = /[a-z]/.test(data);
    const hasNumber = /[0-9]/.test(data);
    setValidPassword(hasUpperCase && hasLowerCase && hasNumber)
  }

  const checkValidEmail = async (data: string) => {
    try {
      const { data: emailData, error } = await supabase
        .from('Profiles')
        .select('*')
        .ilike('email', data.toLowerCase());

      if (error) {
        console.error('Error fetching data:', error);
        return;
      }

      if (emailData && emailData.length > 0) {
        setAvailableEmail(false); // Username exists
        setLoadingEmailSearch(false)
      } else {
        setAvailableEmail(true); // Username is available
        setLoadingEmailSearch(false)
      }
    } catch (err) {
      console.error('An error occurred while checking the username:', err);
    }
  }

  const validateEmail = async (data: string) => {
    setEmail(data)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data);
    setValidEmail(emailRegex)

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  
    // Set a new timeout to check username after 1.5 seconds
    setTypingTimeout(
      setTimeout(() => {
        checkValidEmail(data);
      }, 1500)
    );
  }

  const validateVerify = (data: string) => {
    setVerifyPassword(data)
    setValidPasswordAndVerify(data === password)
  }

  const checkValidUsername = async (username: string) => {
    setLoadingUsernameSearch(true)
    try {
      const { data, error } = await supabase
        .from('Profiles')
        .select('*')
        .ilike('username', username.toLowerCase());

      if (error) {
        console.error('Error fetching data:', error);
        return;
      }

      if (data && data.length > 0) {
        setAvailableUsername(false); // Username exists
        setLoadingUsernameSearch(false)
      } else {
        setAvailableUsername(true); // Username is available
        setLoadingUsernameSearch(false)
      }
    } catch (err) {
      console.error('An error occurred while checking the username:', err);
    }
  };


  // Function to handle user typing with debounce
  const handleInputChange = (value: string) => {
  
    setUsername(value);
  
    // Check if the sanitized value is valid
    const validUsername = /^[a-zA-Z0-9_]*$/.test(value);
    setValidUsername(validUsername);
  
    // Clear previous timeout if typing continues
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  
    // Set a new timeout to check username after 1.5 seconds
    setTypingTimeout(
      setTimeout(() => {
        checkValidUsername(value);
      }, 1500)
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjusts based on the platform
      style={tailwind`flex-1 bg-white`}
    >
      <ScrollView contentContainerStyle={tailwind`flex-grow`} showsVerticalScrollIndicator={false}>
        <FixedTopLogin header='Create Account' back={true}/>
        <View style={tailwind`w-full py-6 px-4`}>

          <View style={tailwind`w-full flex flex-row`}>
            <View style={tailwind`w-1/2 pr-2`}>
              <AuthInput
                header='First Name'
                valid={false}
                validation={false}
                placeholder='first name...'
                placeholderColor='grey'
                multi={false}
                value={firstName}
                onChange={setFirstName}
                capitalization={false}
                loading={false}
              />
            </View>
            <View style={tailwind`w-1/2 pl-2`}>
              <AuthInput
                header='Last Name'
                valid={false}
                validation={false}
                placeholder='last name...'
                placeholderColor='grey'
                multi={false}
                value={lastName}
                onChange={setLastName}
                capitalization={false}
                loading={false}
              />
            </View>
          </View>

          {/* Username Input */}
          <View style={tailwind`mt-4`}>
            <AuthInputValidation
              header='Username'
              valid={validUsername}
              validation={validUsername}
              placeholder='Username...'
              placeholderColor='grey'
              multi={false}
              value={username}
              onChange={handleInputChange}
              capitalization={false}
              loading={loadingUsernameSearch}
              available={availableUsername}
            />
          </View>

          <View style={tailwind`mt-4`}>
            <AuthInputValidation
              header='Email'
              valid={validEmail}
              validation={true}
              placeholder='Email...'
              placeholderColor='grey'
              multi={false}
              value={email}
              onChange={validateEmail}
              capitalization={false}
              loading={loadingEmailSearch}
              available={availableEmail}
            />
          </View>

          {/* Password Input */}
          <View style={tailwind`mt-4`}>
            <AuthInputSecure
              header='Password'
              valid={validPassword}
              validation={true}
              placeholder='Password...'
              placeholderColor='grey'
              value={password}
              onChange={validatePassword}
              loading={false}
            />
          </View>

          <View style={tailwind`mt-4`}>
            <AuthInputSecure
              header='Verify Password'
              valid={validPasswordAndVerify}
              validation={true}
              placeholder='Password...'
              placeholderColor='grey'
              value={verifyPassword}
              onChange={validateVerify}
              loading={false}
            />
          </View>

          {/* Login Button */}
          <View style={tailwind`mt-4`}>
            <RedButton header='Login' loading={false} submit={submitUserLogin}/>
          </View>

          {/* Create Account Link */}
          <View style={tailwind`w-full flex flex-row justify-center items-center mt-3`}>
            <Text>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={tailwind`ml-1 font-semibold text-red-500`}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;
