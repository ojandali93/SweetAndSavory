import React, { useState } from 'react';
import { Text, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert, Switch, Modal, Touchable, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
import TopLogin from '../../Components/Authentication/TopLogin';
import AuthInput from '../../Components/Inputs/Authentication/AuthInput';
import RedButton from '../../Components/Buttons/Authentication/RedButton';
import { useUser } from '../../Context/UserContext';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RecipesStackParamList } from '../../Navigation/RecipesStackNavigation';
import FixedTopLogin from '../../Components/Authentication/FixedTopLogin';
import { Check, Plus } from 'react-native-feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { AuthStackParamList } from '../../Navigation/AuthStackNavigation';
import ScrollSelect from '../../Components/Inputs/Content/ScrollSelect';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../Utils/firebaseConfig';
import Video from 'react-native-video';
import CheckBox from '@react-native-community/checkbox';


type SingleRecipeRouteProp = RouteProp<AuthStackParamList, 'ProfileSetupScreen'>;

const ProfileSetupScreen = () => {
  const route = useRoute<SingleRecipeRouteProp>();
  const {username, firstName, lastName, email, password, name} = route.params;

  const navigation = useNavigation()
  const {creatingProfile, createUserAccount} = useUser()

  const [bio, setBio] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [profilePicture, setProfilePicture] = useState<any>(null)
  const [experience, setExperience] = useState<string>('')
  const [isPublic, setIsPublic] = useState<boolean>(false)

  const [showTerms, setShowTerms] = useState<boolean>(false)
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false)

  const [loadingImage, setLoadingImage] = useState<boolean>(false)

  const cookingSkillLevels = [
    {
      label: 'Beginner',
      value: 'Beginner'
    },
    {
      label: 'Novice',
      value: 'Novice'
    },
    {
      label: 'Intermediate',
      value: 'Intermediate'
    },
    {
      label: 'Proficient',
      value: 'Proficient'
    },
    {
      label: 'Advanced',
      value: 'Advanced'
    },
    {
      label: 'Expert',
      value: 'Expert'
    },
    {
      label: 'Professional Chef',
      value: 'Professional Chef'
    },
    {
      label: 'Master Chef',
      value: 'Master Chef'
    }
  ];

  const submitUserLogin = async () => {
    setShowTerms(false)
    
    if(profilePicture != ''){
      createUserAccount(username, email, password, firstName, lastName, profilePicture, bio, experience, navigation)
    } else {
      setShowTerms(false)
      createUserAccount(username, email, password, firstName, lastName, '', bio, experience, navigation)
    }
  }

  const selectAnImage = async () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
      } else if (response.errorCode) {
      } else if (response.assets) {
        setLoadingImage(true)
        uploadImageToDatabase(response.assets[0].uri)
      }
    });
  };

  const uploadImageToDatabase = async (url: string | undefined) => {

    const folderName = 'ProfilePictures'; 
    const profile = await fetch(url);
    const blob = await profile.blob(); 
    const fileKey = `${folderName}/${Date.now()}-${blob.data.name}`;

    const storageRef = ref(storage, fileKey);
    const snapshot = await uploadBytesResumable(storageRef, blob);
  
    const downloadURL = await getDownloadURL(snapshot.ref);
    setLoadingImage(false)
    setProfilePicture(downloadURL)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjusts based on the platform
      style={tailwind`flex-1 bg-white`}
    >
      <ScrollView contentContainerStyle={tailwind`flex-grow`} showsVerticalScrollIndicator={false}>
        <FixedTopLogin header='Create Profile' back={true}/>
        <View style={tailwind`w-full py-6 px-4`}>

          <View style={tailwind`w-full flex flex-row justify-start items-center`}>
            {
              loadingImage 
                ? <View style={tailwind`h-24 w-24 bg-stone-400 rounded-full flex justify-center items-center`}>
                    <ActivityIndicator size={'large'} color={'black'}/>
                  </View>
                : profilePicture != ''
                    ? <TouchableOpacity onPress={() => {selectAnImage()}}>
                        <Image style={tailwind`h-24 w-24 bg-stone-400 rounded-full border-2 border-slate-500`} alt='profilePicture' source={{uri: profilePicture}} />
                      </TouchableOpacity>
                    : <TouchableOpacity onPress={() => {selectAnImage()}} style={tailwind`h-24 w-24 bg-stone-400 rounded-full flex justify-center items-center`}>
                        <Plus height={24} width={24} color={'black'}/>
                      </TouchableOpacity>
            }
            <View style={tailwind`ml-4`}>
              <Text style={tailwind`text-lg font-bold`}>{username}</Text>
              <Text style={tailwind`text-base font-semibold`}>{name}</Text>
            </View>
          </View>

          {/* Username Input */}
          <View style={tailwind`mt-4`}>
            <AuthInput
              header='Bio'
              valid={false}
              validation={false}
              placeholder='Bio...'
              placeholderColor='grey'
              multi={true}
              value={bio}
              onChange={setBio}
              capitalization={false}
              loading={false}
            />
          </View>
          
          <View style={tailwind`mt-4`}>
            <ScrollSelect value={experience} selection={setExperience} items={cookingSkillLevels} title='Experience Cooking'/>
          </View>

          <View style={tailwind`w-full flex flex-row items-center justify-between mt-3`}>
            <Text style={tailwind`text-base`}>Public:</Text>
            <Switch
              trackColor={{ false: "#b5b5b5", true: "#0284c7" }}
              thumbColor={isPublic ? "white" : "white"}
              onValueChange={() => setIsPublic(!isPublic)}
              value={isPublic}
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}  // Scaling the switch down to half size
            />
          </View>

          {/* Login Button */}
          <View style={tailwind`mt-4`}>
            <RedButton header='Create Account' submit={() => {setShowTerms(!showTerms)}} loading={creatingProfile}/>
          </View>

        </View>
      </ScrollView>
      <Modal
        visible={showTerms}
        animationType='slide'
        transparent={true}
      >
         <View style={tailwind`flex-1 flex justify-center items-center bg-slate-950 bg-opacity-50`}>
            <View style={tailwind`w-11/12 h-5/8 bg-white rounded-5 p-4`}>
              <ScrollView style={tailwind`flex-1`}>
                <Text>{`
End User License Agreement (EULA)

Effective Date: ${new Date()}

PLEASE READ THIS AGREEMENT CAREFULLY. BY CREATING AN ACCOUNT OR USING THIS APPLICATION, YOU AGREE TO BE BOUND BY THE TERMS OF THIS EULA.

This End User License Agreement (“EULA”) is a legal agreement between you (“User”) and Sweet and Savory Inc. ("Company," "we," or "us"), the owner of the [App Name] application (“App”). This agreement governs your use of the App, including all updates, additional features, and content.

If you do not agree to these terms, please do not use or create an account on this App.

1. License Grant
We grant you a limited, non-exclusive, non-transferable, revocable license to use the App for your personal, non-commercial purposes, subject to your compliance with this EULA.

2. User Responsibilities
By creating an account and using this App, you agree to:

Provide accurate information during registration.
Keep your login credentials confidential.
Take full responsibility for all activities that occur under your account.
Follow all applicable laws and regulations.
3. Acceptable Use and User Content
You may use the App to upload, share, and interact with content, including images, text, and other materials, as long as such content adheres to this EULA.

Appropriate Content: Content that is respectful, constructive, informative, and suitable for all users.

Inappropriate Content: The following types of content are strictly prohibited and may result in account suspension or termination:

Offensive Content: Content that promotes hate, violence, harassment, discrimination, or abuse.
Illegal Content: Content that violates any laws or regulations, including, but not limited to, content promoting illegal activities or containing copyrighted material without permission.
Sexually Explicit or Violent Content: Content that includes pornography, excessive violence, or other content inappropriate for general audiences.
Spam and Malicious Content: Content intended to spam, scam, defraud, or include viruses, malware, or other harmful components.
Misleading or False Information: Content that is deliberately misleading, unverified, or may cause harm due to false information.
We reserve the right to determine what constitutes inappropriate content and to remove any content or user accounts that violate this EULA.

4. Intellectual Property Rights
All rights, title, and interest in and to the App, including but not limited to graphics, user interface, scripts, and software, are owned by [Your Company Name]. Unauthorized use of our intellectual property is prohibited.

5. Termination
We may suspend or terminate your account at any time, with or without notice, for violations of this EULA or other conduct that we deem harmful to the App, its users, or the Company.

6. Privacy Policy
Your use of the App is also governed by our Privacy Policy, which is incorporated into this EULA by reference. You can view the Privacy Policy here.

7. Disclaimer of Warranties
The App is provided “as is” and without any warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.

8. Limitation of Liability
In no event will [Your Company Name] be liable for any indirect, incidental, special, or consequential damages arising from or in connection with the use or inability to use the App.

9. Changes to the EULA
We reserve the right to modify this EULA at any time. We will notify users of significant changes, and continued use of the App after any modifications indicates acceptance of the revised terms.

10. Governing Law
This EULA shall be governed by and construed in accordance with the laws of the State of [Your State], without regard to its conflict of law principles.

By creating an account, you acknowledge that you have read, understood, and agree to be bound by this End User License Agreement.


                `}</Text>
              </ScrollView>
              <View style={tailwind`w-full flex flex-row items-center justify-between py-2 mt-3`}>
                <CheckBox
                  disabled={false}
                  value={acceptTerms}
                  onValueChange={(newValue) => setAcceptTerms(!acceptTerms)}
                />
                <Text style={tailwind`text-base font-bold underline`}>Accept Terms & Services</Text>
              </View>
              {
                acceptTerms
                  ? <TouchableOpacity onPress={() => {submitUserLogin()}} style={tailwind`w-full p-3 bg-sky-600 rounded-2 flex flex-row justify-center mt-3`}>
                      <Text style={tailwind`text-lg font-bold text-white`}>{'Create Account'}</Text>
                    </TouchableOpacity>
                  : <View style={tailwind`w-full p-3 bg-stone-600 rounded-2 flex flex-row justify-center mt-3`}>
                      <Text style={tailwind`text-lg font-bold text-white`}>{'Create Account'}</Text>
                    </View>
              }
              <TouchableOpacity onPress={() => {setShowTerms(!showTerms)}} style={tailwind`w-full flex flex-row justify-center mt-2`}>
                <Text style={tailwind`text-sky-600 text-base underline`}>Cancel</Text>
              </TouchableOpacity>
            </View>
         </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ProfileSetupScreen;
