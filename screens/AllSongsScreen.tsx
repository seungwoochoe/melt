import React, { useState, useCallback } from 'react';
import { StyleSheet, Dimensions, StatusBar, Platform, KeyboardAvoidingView, FlatList, useWindowDimensions } from 'react-native';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import layout from '../constants/layout';
import RenderHeader from '../components/Header';
import RenderTitle from '../components/Title';
import RenderSong from '../components/Song';
import { useIsFocused } from '@react-navigation/native';


const { width, height } = Dimensions.get('screen');
const marginBetweenAlbumartAndText = width * 0.029;
const listHeightWithoutScale = width * 0.16;
const bottomBarHeight = listHeightWithoutScale * 1.121;


export default function AllSongsScreen({ navigation, route }: any) {
  const data = route.params;
  const listHeight = listHeightWithoutScale * useWindowDimensions().fontScale;

  const [isScrolled, setIsScrolled] = useState(false);

  const colorScheme = useColorScheme();
  const isFocused = useIsFocused();

  const keyExtractor = useCallback((item) => item.id, []);




  const RenderNoResult = () => {
    return (
      <View style={{ height: height * 0.35, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
        <Text style={{ fontSize: layout.width * 1.2, color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2 }}>
          No results
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
    if (data.length !== 0) {
      return (
        <>
          <RenderSeparator />

          <View style={{
            height: bottomBarHeight * 0.99,
            alignItems: 'center',
            paddingTop: bottomBarHeight * 0.1,
          }} />
        </>
      )
    }
    return (
      <View style={{
        height: bottomBarHeight * 0.99,
        alignItems: 'center',
        paddingTop: bottomBarHeight * 0.1,
      }}
      />
    )
  }


  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>

      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

      <View style={{ flex: 1, alignItems: 'center' }}>
        <FlatList
          data={data}
          ListEmptyComponent={RenderNoResult}
          // stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <View style={{ marginBottom: layout.width }}>
              <RenderTitle title='Songs' />
            </View>
          }
          ItemSeparatorComponent={RenderSeparator}
          ListFooterComponent={RenderBottomMargin}
          renderItem={({ item }) => {
            return (
              <RenderSong item={item} colorScheme={colorScheme} />
            );
          }}
          onScroll={(event) => {
            const scrollOffset = event.nativeEvent.contentOffset.y;

            if (scrollOffset < layout.width * 2.05) {
              if (isScrolled === true) {
                setIsScrolled(false);
              }
            } else {
              if (isScrolled === false) {
                setIsScrolled(true);
              }
            }
          }}
          showsVerticalScrollIndicator={true}
          scrollIndicatorInsets={{ top: layout.ratio * 2.9 * useWindowDimensions().fontScale, left: 0, bottom: bottomBarHeight, right: 0 }}
          keyExtractor={keyExtractor}
          getItemLayout={(data, index) => (
            { length: listHeight + 1, offset: (listHeight + 1) * index, index }
          )}
        />
      </View>

      <RenderHeader title='Songs' blur={isScrolled} />

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
