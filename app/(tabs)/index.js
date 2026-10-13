import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>RAS</Text>
        </View>

        <Text style={styles.title}>Welcome to RAS</Text>
        <Text style={styles.subtitle}>Resource Allocation System</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Signed in as</Text>
          <Text style={styles.cardValue}>{user?.full_name ?? 'Guest'}</Text>
          <Text style={styles.cardMeta}>{user?.role ?? ''} · {user?.account_status ?? ''}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dashboard</Text>
          <Text style={styles.cardText}>Coming soon…</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  container: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 24 },
  logoBox: {
    width: 80, height: 80, borderRadius: 20, backgroundColor: '#4A90E2',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#666666', marginBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%',
    marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
  cardValue: { fontSize: 20, fontWeight: '600', color: '#1A1A1A', marginTop: 4 },
  cardMeta: { fontSize: 14, color: '#666', marginTop: 4, textTransform: 'capitalize' },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  cardText: { fontSize: 14, color: '#666666' },
  logoutButton: {
    marginTop: 'auto', marginBottom: 32,
    backgroundColor: '#E74C3C', paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: 12,
  },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});