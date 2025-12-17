import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Boot: undefined;
  Entry: undefined;
  Login: { emailPrefill?: string; justRegistered?: boolean } | undefined;
  Register: undefined;
  Main: undefined;
  Library: undefined;
  BookDetails: { id: string };
  AddBook: undefined;
  Search: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
};

