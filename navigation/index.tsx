/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { ColorSchemeName, Dimensions } from 'react-native';

import layout from '../constants/layout';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import ModalScreen from '../screens/ModalScreen';
import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SongsScreen from '../screens/SongsScreen';
import RenderBottomBar from '../components/BottomBar';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import SearchScreen from '../screens/SearchScreen';

const { height } = Dimensions.get('screen');


export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createStackNavigator<any>();

// const config = {
//   animation: 'spring',
//   config: {
//     stiffness: 1000,
//     damping: 500,
//     mass: 3,
//     overshootClamping: true,
//     restDisplacementThreshold: 0.01,
//     restSpeedThreshold: 0.01,
//   },
// };

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Root" component={BottomTabNavigator} />
      <Stack.Screen
        name="Modal"
        component={ModalScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forCustomModalPresentationIOS,
          gestureDirection: 'vertical',
          gestureResponseDistance: height * 0.78,
          // transitionSpec: {
          //   open: config,
          //   close: config,
          // },
        }} />
    </Stack.Navigator >
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <>
      <BottomTab.Navigator
        initialRouteName="Home"
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          headerShown: false,
        }}>
        <BottomTab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Home',
            tabBarLabelStyle: {
              fontSize: layout.width * 0.6,
              fontWeight: '700',
            },
            lazy: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="home-outline" color={color} />,
          }}
        />
        <BottomTab.Screen
          name="Library"
          component={LibraryScreenNavigator}
          options={{
            title: 'Library',
            tabBarLabelStyle: {
              fontSize: layout.width * 0.6,
              fontWeight: '700',
            },
            lazy: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="musical-notes-outline" color={color} />,
          }}
        />
        <BottomTab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarLabelStyle: {
              fontSize: layout.width * 0.6,
              fontWeight: '700',
            },
            lazy: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="settings-outline" color={color} />,
          }}
        />
      </BottomTab.Navigator>

      <RenderBottomBar />
    </>
  );
}

const forFade = ({ current }: {current: any}) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

function LibraryScreenNavigator() {
  return (
    <Stack.Navigator  
    screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibraryScreen" component={LibraryScreen} />
      <Stack.Screen name="SongsScreen" component={SongsScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} options={{cardStyleInterpolator: forFade}} />
    </Stack.Navigator >
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons`.expo.fyi/
 */
function TabBarIcon(props: {
  name: string;
  color: string;
}) {

  return <Ionicons size={layout.width * 1.58} style={{ marginBottom: -3 }} {...props} />;
}
