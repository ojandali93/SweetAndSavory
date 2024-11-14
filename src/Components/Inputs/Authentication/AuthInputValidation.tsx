import React from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { CheckCircle } from 'react-native-feather';
import tailwind from 'twrnc';
import * as FeatherIcons from 'react-native-feather';

interface AuthInputProps {
  validation: boolean;
  valid: boolean;
  multi: boolean;
  placeholder: string;
  placeholderColor: string;
  value: string;
  onChange: (data: string) => void;
  loading: boolean;
  capitalization: boolean;
  header: string,
  available: boolean,
}

const AuthInputValidation: React.FC<AuthInputProps> = ({
  validation,
  valid,
  multi,
  placeholder,
  placeholderColor,
  value,
  onChange,
  capitalization,
  loading,
  header,
  available
}) => {

  return (
    <View style={tailwind`flex flex-col bg-stone-300 pb-2 px-3 pt-1 border-2 border-stone-300 rounded-2`}>
      <Text style={tailwind`mb-1 text-sm`}>{header}</Text>
      <View style={tailwind`flex flex-row items-center`}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          multiline={multi}
          style={tailwind`border-b-2 border-b-black pb-.5 font-bold text-base px-1 flex-1`}
          autoCapitalize={capitalization ? 'sentences' : 'none'}
        />
        {available && value.length > 0 && (
          loading ? (
            <ActivityIndicator size={'small'} color={'black'} />
          ) : (
            <CheckCircle height={24} width={24} color={valid ? 'green' : 'red'} style={tailwind`ml-3`} />
          )
        )}
      </View>
      {
        value.length < 1
          ? null
          : available
              ? null
              : <Text>{header} is already associated with an account</Text>
      }
      {
        value.length < 1
          ? null
          : validation
              ? null
              : header === 'Username'
                  ? <Text>{header} can only contain a-z, A-Z, 0-9, and (_)</Text>
                  : <Text>{header} must be a valid email</Text>
      }
    </View>
  );
};

export default AuthInputValidation;
