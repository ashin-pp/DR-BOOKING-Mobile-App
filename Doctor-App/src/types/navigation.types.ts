import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  PatientHome: undefined;
  PatientProfile: undefined;
  PatientAppointments: { upcomingOnly?: boolean } | undefined;
  BookAppointment: undefined;
  AllDoctors: undefined;
  DoctorHome: undefined;
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
