import React, { useState, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, StatusBar, Platform, KeyboardAvoidingView, FlatList, useWindowDimensions } from 'react-native';
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
import { useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get('screen');
const marginBetweenAlbumartAndText = width * 0.029;
const listHeightWithoutScale = width * 0.149;
const bottomBarHeight = listHeightWithoutScale * 1.2;
const marginHorizontal = width * 0.05;


export default function LibraryScreen({ navigation }: any) {

  const [isScrolled, setIsScrelled] = useState(false);

  const colorScheme = useColorScheme();
  const isFocused = useIsFocused();
  const listHeight = listHeightWithoutScale * useWindowDimensions().fontScale;


  const keyExtractor = useCallback((item) => item.title, []);
  const keyExtractorForTheMostPlayedSongs = useCallback((item) => item.id, []);

  const RenderTopLists = ({ item }: { item: { title: string, iconName: string, iconScale: number, destination: string, data: Music[] } }) => {
    return (
      <TouchableOpacity
        onPress={() => { navigation.navigate(item.destination, item.data) }}
        style={{ width: width - marginHorizontal, height: width / 7, marginLeft: width * 0.05 }}
      >
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colorScheme === 'light' ? Colors.light.background : Colors.dark.background,
        }}
        >
          <Ionicons
            name={item.iconName}
            size={layout.width * item.iconScale}
            // color={colorScheme === 'dark' ? Colors.dark.text : Colors.light.text}
            color='#145da0'
            style={{ width: width * 0.1, marginLeft: width * 0.03 }}
          />
          <Text style={{ fontSize: layout.width * 1.1, }}>
            {item.title}
          </Text>
          <View style={{ flex: 1, backgroundColor: 'transparent', alignItems: 'flex-end', marginRight: width * 0.03 }}>
            <View style={{ flex: .99, flexDirection: 'row', alignItems: 'center', }}>
              <Text style={{
                fontSize: layout.width * 0.85,
                color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2,
                marginRight: layout.width * 0.2,
              }}>
                {item.data.length}
              </Text>
              <Ionicons
                name='chevron-forward-outline'
                size={layout.width * 1.32}
                color={colorScheme === 'light' ? Colors.light.borderColor : Colors.dark.borderColor}
              />
            </View>
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
          marginLeft: width * 0.05,
          width: width * 0.95,
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
          data={[
            {
              title: "All songs",
              iconName: 'musical-note',
              iconScale: 1.6,
              destination: 'AllSongsScreen',
              data: Player.musicList,
            },
            {
              title: "Liked songs",
              iconName: 'heart',
              iconScale: 1.3,
              destination: 'LikedSongsScreen',
              data: Player.likedSongs,
            }
          ]}

          ListHeaderComponent={
            <View>
              <RenderTitle title='Library' />

              <TouchableOpacity
                onPress={() => { navigation.navigate("SearchScreen") }}
                style={{
                  marginTop: layout.width * 0.5,
                  paddingBottom: layout.width,
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
                  }}>
                    Songs or artists
                  </Text>
                </View>
              </TouchableOpacity>
              <View
                style={{
                  height: 1,
                  marginLeft: width * 0.05,
                  width: width * 0.95,
                }}
                lightColor='#dfdfdf'
                darkColor='#343434'
              />


            </View>
          }

          renderItem={RenderTopLists}
          ItemSeparatorComponent={RenderSeparator}
          ListFooterComponent={() => {
            return (
              <FlatList
                ListHeaderComponent={() => {
                  return (
                    <>
                      <RenderSeparator />

                      <Text style={{
                        width: width * 0.94,
                        fontSize: layout.width * 1.28,
                        fontWeight: 'bold',
                        marginLeft: width * 0.06,
                        marginTop: layout.height * 1.5,
                        marginBottom: layout.height * 0.6,
                        color: colorScheme === 'light' ? Colors.light.text : Colors.dark.text,
                      }}>
                        Most played songs
                      </Text>
                    </>
                  )
                }}
                ListEmptyComponent={() => {
                  return (
                    <View style={{ height: height * 0.26, width: width, flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ flex: 1, textAlign: 'center', fontSize: layout.width * 1.1, fontWeight: '400', color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2 }}>
                        Play your favourite songs
                      </Text>
                    </View>
                  )
                }}

                data={Player.musicSelection}
                renderItem={({ item }) => {
                  return (
                    <RenderSong item={item} colorScheme={colorScheme} />
                  )
                }}

                ListFooterComponent={RenderBottomMargin}

                keyExtractor={keyExtractorForTheMostPlayedSongs}
              />
            )
          }}


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
          scrollEnabled={true}
          keyExtractor={keyExtractor}
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