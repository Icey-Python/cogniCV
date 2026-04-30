import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  section: { margin: 10, padding: 10 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginBottom: 10, color: '#666' },
  text: { fontSize: 12, marginBottom: 5 },
  header: { fontSize: 20, marginBottom: 10, borderBottom: '1px solid #ccc' },
});

export const ApplicantAnalysisPDF = ({ candidate, job, rankedEntry, coveragePercent }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>{candidate.firstName} {candidate.lastName}</Text>
        <Text style={styles.subtitle}>Analysis Report for: {job.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Match Score</Text>
        <Text style={styles.text}>Score: {rankedEntry?.matchScore ?? 'N/A'}%</Text>
        <Text style={styles.text}>Ranking: #{rankedEntry?.rank ?? '-'}</Text>
        <Text style={styles.text}>Requirement Coverage: {coveragePercent}%</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>AI Match Analysis</Text>
        <Text style={styles.text}>{rankedEntry?.reasoning.recommendation ?? 'No analysis available.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Strengths</Text>
        {rankedEntry?.reasoning.strengths.map((s: string, i: number) => (
          <Text key={i} style={styles.text}>• {s}</Text>
        ))}
      </View>
    </Page>
  </Document>
);
