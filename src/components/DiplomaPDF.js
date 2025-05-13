import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register custom fonts
Font.register({
  family: 'Montserrat',
  fonts: [
    { src: '/fonts/Montserrat-Regular.ttf' },
    { src: '/fonts/Montserrat-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/Montserrat-Light.ttf', fontWeight: 'light' }
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Montserrat'
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    opacity: 0.9
  },
  header: {
    marginBottom: 40,
    textAlign: 'center',
    position: 'relative'
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    alignSelf: 'center'
  },
  title: {
    fontSize: 36,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 2
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 5,
    color: '#4B5563',
    fontWeight: 'light'
  },
  decorativeLine: {
    width: 100,
    height: 2,
    backgroundColor: '#1E40AF',
    marginVertical: 15,
    alignSelf: 'center'
  },
  content: {
    marginTop: 40,
    padding: 30,
    position: 'relative'
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20
  },
  achievementText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 1.6
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 8
  },
  statBox: {
    width: '30%',
    padding: 15,
    alignItems: 'center',
    borderRight: '1px solid #E2E8F0'
  },
  statBoxLast: {
    width: '30%',
    padding: 15,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center'
  },
  signature: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 10
  },
  date: {
    fontSize: 12,
    color: '#6B7280'
  },
  cornerDecoration: {
    position: 'absolute',
    width: 60,
    height: 60
  },
  topLeft: {
    top: 20,
    left: 20
  },
  topRight: {
    top: 20,
    right: 20,
    transform: 'rotate(90deg)'
  },
  bottomLeft: {
    bottom: 20,
    left: 20,
    transform: 'rotate(-90deg)'
  },
  bottomRight: {
    bottom: 20,
    right: 20,
    transform: 'rotate(180deg)'
  }
});

const DiplomaPDF = ({ player, template, club }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Background with overlay */}
      {template && (
        <>
          <Image src={template.image} style={styles.backgroundImage} />
          <View style={styles.overlay} />
        </>
      )}

      {/* Corner Decorations */}
      <Image src="/images/corner-decoration.png" style={{...styles.cornerDecoration, ...styles.topLeft}} />
      <Image src="/images/corner-decoration.png" style={{...styles.cornerDecoration, ...styles.topRight}} />
      <Image src="/images/corner-decoration.png" style={{...styles.cornerDecoration, ...styles.bottomLeft}} />
      <Image src="/images/corner-decoration.png" style={{...styles.cornerDecoration, ...styles.bottomRight}} />

      {/* Header */}
      <View style={styles.header}>
        <Image src="/images/badminton-logo.png" style={styles.logo} />
        <Text style={styles.title}>Diplom</Text>
        <View style={styles.decorativeLine} />
        <Text style={styles.subtitle}>{club}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.achievementText}>
          har utmerket seg med fremragende prestasjoner i {player.class}-klassen
          og har demonstrert eksepsjonelle ferdigheter gjennom sesongen.
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{player.rankingPoints}</Text>
            <Text style={styles.statLabel}>Rankingpoeng</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{player.matches}</Text>
            <Text style={styles.statLabel}>Kamper</Text>
          </View>
          <View style={styles.statBoxLast}>
            <Text style={styles.statValue}>{player.wins}</Text>
            <Text style={styles.statLabel}>Seiere</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.signature}>
          _______________________
        </Text>
        <Text style={styles.signature}>
          Klubbleder
        </Text>
        <Text style={styles.date}>
          Utstedt {new Date().toLocaleDateString('nb-NO')}
        </Text>
      </View>
    </Page>
  </Document>
);

export default DiplomaPDF; 