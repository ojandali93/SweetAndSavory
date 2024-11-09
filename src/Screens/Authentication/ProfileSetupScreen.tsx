import React, { useState } from 'react';
import { Text, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert, Switch } from 'react-native';
import tailwind from 'twrnc';
import TopLogin from '../../Components/Authentication/TopLogin';
import AuthInput from '../../Components/Inputs/Authentication/AuthInput';
import RedButton from '../../Components/Buttons/Authentication/RedButton';
import { useUser } from '../../Context/UserContext';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RecipesStackParamList } from '../../Navigation/RecipesStackNavigation';
import FixedTopLogin from '../../Components/Authentication/FixedTopLogin';
import { Plus } from 'react-native-feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { AuthStackParamList } from '../../Navigation/AuthStackNavigation';
import ScrollSelect from '../../Components/Inputs/Content/ScrollSelect';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../Utils/firebaseConfig';

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
    const folderName = 'ProfilePictures'; 
    const response = await fetch(profilePicture.uri);
    const blob = await response.blob(); 
    const fileKey = `${folderName}/${Date.now()}-${blob.data.name}`;

    const storageRef = ref(storage, fileKey);
    const snapshot = await uploadBytesResumable(storageRef, blob);
  
    const downloadURL = await getDownloadURL(snapshot.ref);
    if(downloadURL){
      createUserAccount(username, email, password, firstName, lastName, downloadURL, bio, experience, navigation)
    } else {
      createUserAccount(username, email, password, firstName, lastName, '', bio, experience, navigation)
    }
  }

  const selectAnImage = () => {
    launchImageLibrary({ mediaType: 'mixed' }, (response) => {
      if (response.didCancel) {
      } else if (response.errorCode) {
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];

        // Check the video duration
        if (asset.duration && asset.duration > 60) {
          Alert.alert("Video exceeds limit.", "Please select a video that is 60 seconds or less.");
        } else {
          const selectedFile = {
            uri: asset.uri,
            fileType: asset.type,
          };
          setProfilePicture(selectedFile)
        }
      }
    });
  };

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
              profilePicture && profilePicture.uri
                ? <Image style={tailwind`h-24 w-24 bg-stone-400 rounded-full`} alt='profilePicture' source={{uri: profilePicture.uri}} />
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
              icon='MessageSquare'
              valid={false}
              validation={false}
              placeholder='Bio...'
              placeholderColor='grey'
              multi={true}
              secure={false}
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
              trackColor={{ false: "#b5b5b5", true: "#c72828" }}
              thumbColor={isPublic ? "white" : "white"}
              onValueChange={() => setIsPublic(!isPublic)}
              value={isPublic}
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}  // Scaling the switch down to half size
            />
          </View>

          {/* Login Button */}
          <View style={tailwind`mt-4`}>
            <RedButton submit={submitUserLogin} loading={creatingProfile}/>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileSetupScreen;
