import * as React from 'react';
import { TouchableOpacity, Dimensions, StatusBar, SectionList, useWindowDimensions, Alert, Appearance } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNFS from 'react-native-fs';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import layout from '../constants/layout';
import Colors from '../constants/Colors';
import RenderDarkHeader from '../components/DarkHeader';
import RenderTitle from '../components/Title';
import Player from '../containers/Player';

import { RootTabScreenProps } from '../types';

const { width } = Dimensions.get("screen");
const itemHeightWithoutScale = width * 0.117;
const marginBetweenIconAndText = itemHeightWithoutScale * 0.3;
const marginHorizontal = width * 0.05;
const borderRadius = 11;

export default function SettingsScreen({ navigation }:{navigation: any}) {
  const colorScheme = useColorScheme();
  const itemHeight = itemHeightWithoutScale * useWindowDimensions().fontScale;

  const settings: { section: string, data: { title: string, iconName: string, iconBackgroundColor: string, position: string, destination?: string }[] }[] = [
    {
      section: '1',
      data: [
        {
          title: 'Statistics',
          iconName: 'stats-chart',
          iconBackgroundColor: '#ea4e3d',
          position: 'top',
        },
        {
          title: 'History',
          iconName: 'albums',
          iconBackgroundColor: '#3475f8',
          position: 'bottom',
        },
      ]
    },
    {
      section: '2',
      data: [
        // {
        //   title: 'Appearance',
        //   iconName: 'contrast',
        //   iconBackgroundColor: '#a952b3',
        //   position: 'top',
        // },
        // {
        //   title: 'Language',
        //   iconName: 'language',
        //   iconBackgroundColor: '#5555ce',
        //   position: '',
        // },
        {
          title: 'Feedback',
          iconName: 'chatbubble-ellipses',
          iconBackgroundColor: '#5555ce',
          position: 'top',
        },
        {
          title: 'About',
          iconName: 'information',
          iconBackgroundColor: '#ffb908',
          position: '',
        },
        {
          title: 'Manage data',
          iconName: 'file-tray-full-outline',
          iconBackgroundColor: Colors.light.brown,
          position: '',
          destination: 'ManageDataScreen',
        },
        {
          title: 'Delete history',
          iconName: 'lock-closed',
          iconBackgroundColor: '#63c065',
          position: '',
        },
        {
          title: 'Delete image data',
          iconName: 'download',
          iconBackgroundColor: 'grey',
          position: 'bottom',
        },
      ]
    }
  ];


  const RenderSubscriptionStatus = () => {
    return (
      <View
        style={{ width: width, height: itemHeight * 1.2, marginTop: itemHeight / 2, marginBottom: itemHeight / 3, backgroundColor: 'transparent' }}
      >
        <TouchableOpacity 
        style={{
          flex: 1,
          flexDirection: 'row',
          marginHorizontal: marginHorizontal,
          alignItems: 'center',
          backgroundColor: colorScheme === 'light' ? '#fff' : '#1e1e22',
          borderRadius: borderRadius,
        }}
        activeOpacity={0.45}
        >
          <View style={{
            width: itemHeightWithoutScale * 0.65,
            marginVertical: itemHeightWithoutScale * 0.3,
            height: itemHeightWithoutScale * 0.65,
            marginLeft: itemHeightWithoutScale * 0.35,
            marginRight: marginBetweenIconAndText,
            borderRadius: itemHeightWithoutScale * 0.15,
            backgroundColor: '#ffb908',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'transparent', marginLeft: itemHeightWithoutScale * 0.016 }}>
              <Ionicons name='star' size={layout.width * 1.18} color={colorScheme === 'light' ? '#fff' : '#e0e0e0'} />
            </View>
          </View>
          <Text style={{ fontSize: layout.width * 1.05, }}>
            You're a star!
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  const RenderItem = ({ item }: { item: { title: string, iconName: string, iconBackgroundColor: string, position: string, destination?: string } }) => {
    return (
      <View
        style={{ width: width, height: itemHeight, backgroundColor: 'transparent' }}
      >
        <TouchableOpacity
          onPress={async () => {
            if (item.title === "Delete image data") {
              try {
                await AsyncStorage.removeItem('musicList');
                await RNFS.unlink(RNFS.DocumentDirectoryPath + '/assets');
                Alert.alert("Success!");
              } catch (e) {
                Alert.alert("Failed to remove the folder");
              }
            }
            else if (item.title === "Delete history") {
              try {
                await AsyncStorage.removeItem('historyList');
                await AsyncStorage.removeItem('tracks');
                await AsyncStorage.removeItem('musicSelection');
                await AsyncStorage.removeItem('storedPosition');
                await AsyncStorage.removeItem('secPlayed');
                await AsyncStorage.removeItem('likedSongs');
                await AsyncStorage.removeItem('isRepeat');
                await AsyncStorage.removeItem('appliedHistoryTime');
                await AsyncStorage.removeItem('lastHomeUpdateTime');
                Alert.alert("Success!");
              } catch (e) {
                Alert.alert("Failed to delete historyList");
              }
            }
            else if (item.title === "About") {
              console.log(RNFS.DocumentDirectoryPath);
            }
            else if (item.title === 'Appearance') {
            navigation.navigate(item.destination);
            }
          }}
          style={{
            flex: 1,
            flexDirection: 'row',
            marginHorizontal: marginHorizontal,
            alignItems: 'center',
            backgroundColor: colorScheme === 'light' ? '#fff' : '#1a1a1c',
            borderTopLeftRadius: item.position === 'top' ? borderRadius : 0,
            borderTopRightRadius: item.position === 'top' ? borderRadius : 0,
            borderBottomLeftRadius: item.position === 'bottom' ? borderRadius : 0,
            borderBottomRightRadius: item.position === 'bottom' ? borderRadius : 0,
          }}
          activeOpacity={0.45}
        >
          <View style={{
            width: itemHeightWithoutScale * 0.65,
            marginVertical: itemHeightWithoutScale * 0.3,
            height: itemHeightWithoutScale * 0.65,
            marginLeft: itemHeightWithoutScale * 0.35,
            marginRight: marginBetweenIconAndText,
            backgroundColor: item.iconBackgroundColor,
            borderRadius: itemHeightWithoutScale * 0.15,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              flex: 1,
              alignItems: 'center',
              backgroundColor: 'transparent',
              marginLeft:
                item.iconName === 'albums' ||
                  item.iconName === 'stats-chart' ||
                  item.iconName === 'download' ||
                  item.iconName === 'lock-closed'
                  ? itemHeightWithoutScale * 0.03 : itemHeightWithoutScale * 0.016,
            }}
            >
              <Ionicons name={item.iconName} size={layout.width * 1.18} color={colorScheme === 'light' ? '#fff' : '#e0e0e0'} />
            </View>
          </View>
          <Text style={{ fontSize: layout.width * .97, }}>
            {item.title}
          </Text>
          <View style={{ flex: 1, backgroundColor: 'transparent', alignItems: 'flex-end', marginRight: width * 0.03 }}>
            <Ionicons name='chevron-forward-outline' size={layout.width * 1.25} color={colorScheme === 'light' ? '#d0d0d0' : '#555'} />
          </View>
        </TouchableOpacity>
      </View>
    )
  };

  const RenderSeparator = () => {
    return (
      <View style={{ backgroundColor: 'transparent', flexDirection: 'row' }}>
        <View style={{
          height: .52,
          marginLeft: marginHorizontal,
          width: itemHeightWithoutScale * 0.95 + marginBetweenIconAndText,
        }}
          lightColor='#fff'
          darkColor='#1e1e22'
        />
        <View
          style={{
            height: .51,
            width: width - (itemHeightWithoutScale * 0.95 + marginBetweenIconAndText * 0.9 + marginHorizontal * 2),
          }}
          lightColor='#ccc'
          darkColor='#343434'
        />
      </View>
    )
  }

  const RenderBottomMargin = () => {
    return (
      <View style={{ height: width * 0.2, alignItems: 'center', backgroundColor: 'transparent' }} />
    )
  }

  return (
    <View style={{ flex: 1, width: width, backgroundColor: colorScheme === 'light' ? '#f2f2f7' : '#000' }}>

      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

      <SectionList
        sections={settings}
        keyExtractor={item => item.title}
        renderItem={RenderItem}
        ListHeaderComponent={() => {
          return (
            <>
              <RenderTitle title='Settings' />
              <RenderSubscriptionStatus />
            </>
          )
        }}
        ListFooterComponent={RenderBottomMargin}
        ItemSeparatorComponent={RenderSeparator}
        SectionSeparatorComponent={() => { return (<View style={{ height: itemHeightWithoutScale / 2.7, backgroundColor: 'transparent' }} />) }}
        showsVerticalScrollIndicator={false}
      />

      <RenderDarkHeader title='Settings' blur={false} />
    </View>
  );
};
