import React, { useState, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, StatusBar, Platform, KeyboardAvoidingView, FlatList, useWindowDimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import layout from '../constants/layout';
import RenderHeader from '../components/Header';
import RenderTitle from '../components/Title';
import Player from '../containers/Player';
import RenderSong from '../components/Song';
import { Music } from '../types';

const { width, height } = Dimensions.get('screen');
const marginBetweenAlbumartAndText = width * 0.029;
const listHeightWithoutScale = width * 0.149;
const bottomBarHeight = listHeightWithoutScale * 1.2;
const marginHorizontal = width * 0.05;


export default function LibraryScreen({ navigation }: any) {

  const [isScrolled, setIsScrelled] = useState(false);

  const colorScheme = useColorScheme();
  const listHeight = listHeightWithoutScale * useWindowDimensions().fontScale;


  const keyExtractor = useCallback((item) => item.id, []);


  const RenderTopLists = ({ title, iconName, iconScale, isTop, destination, data }: { title: string, iconName: string, iconScale: number, isTop: boolean, destination: string, data: Music[] }) => {
    return (
      <TouchableOpacity
        onPress={() => { navigation.navigate(destination, data) }}
        style={{ width: width - marginHorizontal, height: width / 7, marginLeft: width * 0.05 }}
      >
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colorScheme === 'light' ? Colors.light.background : Colors.dark.background,
          borderTopWidth: isTop ? .5 : 0,
          borderBottomWidth: .5,
          borderColor: colorScheme === 'light' ? Colors.light.borderColor : Colors.dark.borderColor,
        }}
        >
          <Ionicons
            name={iconName}
            size={layout.width * iconScale}
            color={colorScheme === 'dark' ? Colors.dark.text : Colors.light.text}
            style={{ marginLeft: width * 0.03 }}
          />
          <Text style={{ fontSize: layout.width * 1.1, marginLeft: layout.width * 0.5 }}>
            {title}
          </Text>
          <View style={{ flex: 1, backgroundColor: 'transparent', alignItems: 'flex-end', marginRight: width * 0.03 }}>
            <Ionicons
              name='chevron-forward-outline'
              size={layout.width * 1.5}
              color={colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2}
            />
          </View>
        </View>
      </TouchableOpacity>
    )
  }


  const RenderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          marginLeft: listHeightWithoutScale + marginBetweenAlbumartAndText + width * 0.045,
          marginRight: width * 0.06,
        }}
        lightColor='#dfdfdf'
        darkColor='#343434'
      />
    )
  }

  const RenderBottomMargin = () => {
    return (
      <View style={{ height: bottomBarHeight * 0.99, alignItems: 'center', paddingTop: bottomBarHeight * 0.1 }} />
    )
  }


  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>

      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

      <View style={{ flex: 1, alignItems: 'center' }}>
        <FlatList
          data={Player.musicSelection}

          ListHeaderComponent={
            <View>
              <RenderTitle title='Library' />

              <TouchableOpacity
                onPress={() => { navigation.navigate("SearchScreen") }}
                style={{
                  marginTop: layout.width * 0.5,
                    paddingBottom: layout.width,
                    // marginBottom: layout.width,
                }}>
                <View
                  style={{
                    alignSelf: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: layout.width * 2.6,
                    width: width - marginHorizontal * 2,
                    marginHorizontal: marginHorizontal,
                    paddingLeft: width * 0.03,
                    borderRadius: 11,
                    backgroundColor: colorScheme === 'light' ? Colors.light.searchbarBackground : Colors.dark.searchbarBackground,
                  }}>
                  <Ionicons name="search-outline" size={layout.width * 1.2} color={colorScheme === 'light' ? Colors.light.borderColor : Colors.dark.borderColor} />
                  <Text style={{
                    marginLeft: width * 0.02,
                    fontSize: layout.width * 1.1,
                    color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2,
                  }}
                  >
                    Songs or artists
                  </Text>
                </View>
              </TouchableOpacity>


              <RenderTopLists title='All songs' iconName='musical-note' iconScale={1.6} isTop={true} destination='AllSongsScreen' data={Player.musicList} />
              <RenderTopLists title='Liked songs' iconName='heart' iconScale={1.3} isTop={false} destination='LikedSongsScreen' data={Player.likedSongs} />
            </View>
          }

          renderItem={({ item }) => <RenderSong item={item} colorScheme={colorScheme} />}
          ItemSeparatorComponent={RenderSeparator}
          ListFooterComponent={RenderBottomMargin}

          onScroll={(event) => {
            const scrollOffset = event.nativeEvent.contentOffset.y;

            if (scrollOffset < layout.width * 2.05) {
              if (isScrolled === true) {
                setIsScrelled(false);
              }
            } else {
              if (isScrolled === false) {
                setIsScrelled(true);
              }
            }
          }}

          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          scrollEnabled={true}
          keyExtractor={keyExtractor}
          getItemLayout={(data, index) => (
            { length: listHeight + 1, offset: (listHeight + 1) * index, index }
          )}
        />
      </View>

      <RenderHeader title='Library' blur={isScrolled} />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
  },
  miniArt: {
    width: listHeightWithoutScale * 0.88,
    height: listHeightWithoutScale * 0.88,
    margin: listHeightWithoutScale * 0.06,
    borderRadius: 4.5,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
