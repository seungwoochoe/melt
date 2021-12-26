/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Modal: undefined;
  NotFound: undefined;
  SongsByTitleScreen: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  Screen
>;

export type RootTabParamList = {
  Home: undefined;
  Library: undefined;
  Settings: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, Screen>,
  StackScreenProps<RootStackParamList>
>;

export type Music = {
  url: string,
  title: string,
  artist: string,
  artwork: string,
  miniArt: string,
  lyrics: string,
  isLiked: boolean,
  id: string,
  weight: number,
}

export type Track = {
  url: string,
  title: string,
  artist: string,
  artwork: string,
  id: string,
  isPlayed: boolean,
  isTrigger: boolean,
}

export type History = {
  endTime: number,
  id: string,
  reasonStart: "normal" | "selected" | "returned",
  reasonEnd: "normal" | "skipped",
  playedRatio: number,
  secPlayed: number,
  duration: number,
}

export type LibraryItem = {
  title: string,
  icon: string,
  linkTo: string,
}
