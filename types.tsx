/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Modal: undefined;
  NotFound: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type RootTabParamList = {
  Home: undefined;
  Songs: undefined;
  Settings: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;

export type Music = {
  url: string,
  title: string,
  artist: string,
  artwork: string,
  weight?: number,
  id: string, // Will be title + artist.
}

export type Track = {
  url: string,
  title: string,
  artist: string,
  duration?: number,
  artwork: number,
}

export type Action = {
  time: number,
  title: string,
  artist: string,
  id: string,
  action: string,
}

export type History = {
  endTime: number,
  title: string,
  artist: string,
  duration: number,
  artwork: number,
  id: string,
  secPlayed: number,
}
