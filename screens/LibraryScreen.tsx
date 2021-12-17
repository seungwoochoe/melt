import React, { useState, useCallback, useEffect } from 'react';
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


  const RenderButtonToSongsScreen = () => {
    return (
      <TouchableOpacity
        onPress={() => { navigation.navigate("SongsScreen") }}
        style={{ width: width, height: width / 7, alignSelf: 'center', }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 15, backgroundColor: 'pink', marginHorizontal: marginHorizontal }}>
          <Ionicons name='musical-note' size={layout.width * 1.5} color={colorScheme === 'light' ? Colors.dark.text : Colors.light.text} />
          <Text style={{ fontSize: layout.width * 1.1 }}>
            Songs
          </Text>
          <View style={{ flex: 1, backgroundColor: 'transparent', alignItems: 'flex-end', marginRight: width * 0.03 }}>
            <Ionicons name='chevron-forward-outline' size={layout.width * 1.5} color={colorScheme === 'light' ? '#d0d0d0' : '#555'} />
          </View>
        </View>
      </TouchableOpacity>
    )
  }



  const RenderInitialScreen = () => {
    return (
      <View style={{ width: width }}>
        <FlatList
          ListHeaderComponent={RenderButtonToSongsScreen}
          data={[]}
          renderItem={(item) => {
            return (
              <RenderSong item={item} colorScheme={colorScheme} />
            )
          }}
          ListEmptyComponent={<RenderNoResult text="Welcome!" />}
        />
      </View>
    )
  }

  const RenderNoResult = ({ text }: { text: string }) => {
    return (
      <View style={{ height: height * 0.35, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
        <Text style={{ fontSize: layout.width * 1.2, color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2 }}>
          {text}
        </Text>
      </View>
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
      <>
        {Player.musicList.length !== 0 &&
          <RenderSeparator />
        }

        <View style={{ height: bottomBarHeight * 0.99, alignItems: 'center', paddingTop: bottomBarHeight * 0.1 }} />
      </>
    )
  }


  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>

      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

      <View style={{ flex: 1, alignItems: 'center' }}>
        <FlatList
          data={[]}

          ListHeaderComponent={
            <View>
              <RenderTitle title='Library' />

              <TouchableOpacity
                onPress={() => { navigation.navigate("SearchScreen") }}
                style={{
                  alignSelf: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: layout.width * 2.4,
                  width: width * 0.89,
                  marginHorizontal: marginHorizontal,
                  paddingLeft: width * 0.03,
                  marginTop: layout.width * 0.5,
                  marginBottom: layout.width,
                  borderRadius: 11,
                  backgroundColor: colorScheme === 'light' ? Colors.light.text4 : Colors.dark.text4,
                }}>
                <Ionicons name="search-outline" size={layout.width * 1.15} color={colorScheme === 'light' ? Colors.light.text3 : Colors.dark.text3} />
                <Text style={{
                  marginLeft: width * 0.02,
                  fontSize: layout.width * 1.03,
                  color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2,
                }}
                >
                  Songs or artists
                </Text>
              </TouchableOpacity>
            </View>
          }

          ListEmptyComponent={RenderInitialScreen}
          renderItem={RenderSong}
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
