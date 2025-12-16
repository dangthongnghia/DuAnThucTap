import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect trực tiếp vào app, không cần check auth
  return <Redirect href="/(app)" />;
}
