import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  headerSection: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 26,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  headline: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 8,
    fontSize: 10,
    color: '#94a3b8',
  },
  section: {
    marginTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderRadius: 4,
  },
  scoreGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  scoreBox: {
    flex: 1,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  scoreLabel: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  recommendationBox: {
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    fontStyle: 'italic',
    fontSize: 11,
    color: '#1e40af',
    lineHeight: 1.5,
  },
  bulletList: {
    marginTop: 5,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    width: 15,
    fontSize: 12,
    color: '#3b82f6',
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.4,
  },
  gapItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  gapBullet: {
    width: 15,
    fontSize: 12,
    color: '#ef4444',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
  }
});

export const ApplicantAnalysisPDF = ({ candidate, job, rankedEntry, coveragePercent }: any) => {
  const p = candidate.profileSnapshot || candidate;
  const name = `${p.firstName || ''} ${p.lastName || ''}`.trim();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.headline}>{p.headline || 'Professional Candidate'}</Text>
          <View style={styles.infoRow}>
            <Text>{p.location || 'Location Not Specified'} • </Text>
            <Text>{p.email || 'No email provided'} • </Text>
            <Text>Match Analysis for {job.title}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.scoreGrid}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreValue}>{rankedEntry?.matchScore ?? 'N/A'}%</Text>
              <Text style={styles.scoreLabel}>Match Score</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreValue}>#{rankedEntry?.rank ?? '-'}</Text>
              <Text style={styles.scoreLabel}>Pool Rank</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreValue}>{coveragePercent}%</Text>
              <Text style={styles.scoreLabel}>Skill Coverage</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Match Verdict</Text>
          <View style={styles.recommendationBox}>
            <Text>"{rankedEntry?.reasoning.recommendation ?? 'No analysis recommendation available.'}"</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 10, color: '#059669' }}>Key Strengths</Text>
              <View style={styles.bulletList}>
                {rankedEntry?.reasoning.strengths.map((s: string, i: number) => (
                  <View key={i} style={styles.bulletItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 10, color: '#dc2626' }}>Potential Gaps</Text>
              <View style={styles.bulletList}>
                {rankedEntry?.reasoning.gaps.map((g: string, i: number) => (
                  <View key={i} style={styles.gapItem}>
                    <Text style={styles.gapBullet}>•</Text>
                    <Text style={styles.bulletText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Interview Feedback</Text>
          <View style={styles.bulletList}>
            {rankedEntry?.reasoning.suggestedFeedback?.map((f: string, i: number) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={styles.bullet}>→</Text>
                <Text style={styles.bulletText}>{f}</Text>
              </View>
            )) || (
              <Text style={styles.bulletText}>No specific feedback points generated.</Text>
            )}
          </View>
        </View>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} cogniCV Recruitment Platform • High-Precision AI Talent Matching
        </Text>
      </Page>
    </Document>
  );
};
