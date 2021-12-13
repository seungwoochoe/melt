import * as React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, StatusBar, SectionList, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import scale from '../constants/scale';
import RenderDarkHeader from '../components/DarkHeader';
import RenderTitle from '../components/Title';

import { RootTabScreenProps } from '../types';
import RenderBottomBar from '../components/BottomBar';

const { width, height } = Dimensions.get("screen");
const itemHeightWithoutScale = width * 0.117;
const marginBetweenIconAndText = itemHeightWithoutScale * 0.3;
const marginHorizontal = width * 0.05;
const borderRadius = 12;

export default function SettingsScreen({ navigation }: RootTabScreenProps<'Settings'>) {
  const colorScheme = useColorScheme();
  const itemHeight = itemHeightWithoutScale * useWindowDimensions().fontScale;

  const settings: { section: string, data: { title: string, iconName: string, iconBackgroundColor: string, position: string }[] }[] = [
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
          iconBackgroundColor: '#ff9b36',
          position: '',
        },
        {
          title: 'Privacy',
          iconName: 'lock-closed',
          iconBackgroundColor: '#63c065',
          position: '',
        },
        {
          title: 'Export',
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
        <TouchableOpacity style={{
          flex: 1,
          flexDirection: 'row',
          marginHorizontal: marginHorizontal,
          alignItems: 'center',
          backgroundColor: colorScheme === 'light' ? '#fff' : '#1e1e22',
          borderRadius: borderRadius,
        }}
        >
          <View style={{
            width: itemHeightWithoutScale * 0.65,
            marginVertical: itemHeightWithoutScale * 0.3,
            height: itemHeightWithoutScale * 0.65,
            marginLeft: itemHeightWithoutScale * 0.35,
            marginRight: marginBetweenIconAndText,
            borderRadius: itemHeightWithoutScale * 0.15,
            backgroundColor: 'orange',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'transparent', marginLeft: itemHeightWithoutScale * 0.016 }}>
              <Ionicons name='star' size={scale.width * 1.18} color={colorScheme === 'light' ? '#fff' : '#e0e0e0'} />
            </View>
          </View>
          <Text style={{ fontSize: scale.width * 1.02, }}>
            You're a star!
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  const RenderItem = ({ item }: { item: { title: string, iconName: string, iconBackgroundColor: string, position: string } }) => {
    return (
      <View
        style={{ width: width, height: itemHeight, backgroundColor: 'transparent' }}
      >
        <TouchableOpacity style={{
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
              <Ionicons name={item.iconName} size={scale.width * 1.18} color={colorScheme === 'light' ? '#fff' : '#e0e0e0'} />
            </View>
          </View>
          <Text style={{ fontSize: scale.width * .95, }}>
            {item.title}
          </Text>
          <View style={{ flex: 1, backgroundColor: 'transparent', alignItems: 'flex-end', marginRight: width * 0.03 }}>
            <Ionicons name='chevron-forward-outline' size={scale.width * 1.25} color={colorScheme === 'light' ? '#d0d0d0' : '#555'} />
          </View>
        </TouchableOpacity>
      </View>
    )
  };

  const RenderSeparator = () => {
    return (
      <View style={{ backgroundColor: 'transparent', flexDirection: 'row' }}>
        <View style={{
          height: .55,
          marginLeft: marginHorizontal,
          width: itemHeightWithoutScale * 0.95 + marginBetweenIconAndText,
          backgroundColor: colorScheme === 'light' ? '#fff' : '#1e1e22',
        }} />
        <View
          style={{
            height: .55,
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

      <RenderBottomBar navigation={navigation} isEventHandler={false} />
    </View>
  );
};
