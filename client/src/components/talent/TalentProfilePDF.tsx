import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 15,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headline: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  contactRow: {
    flexDirection: 'row',
    marginTop: 10,
    fontSize: 9,
    color: '#94a3b8',
    gap: 10,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 5,
    marginBottom: 10,
  },
  bio: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.6,
  },
  experienceItem: {
    marginBottom: 15,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  role: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  company: {
    fontSize: 11,
    color: '#2563eb',
    marginTop: 2,
  },
  date: {
    fontSize: 9,
    color: '#94a3b8',
  },
  description: {
    fontSize: 10,
    color: '#475569',
    marginTop: 5,
    lineHeight: 1.5,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    fontSize: 9,
    color: '#334155',
  },
  educationItem: {
    marginBottom: 10,
  },
  institution: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  degree: {
    fontSize: 10,
    color: '#64748b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#cbd5e1',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  }
});

export const TalentProfilePDF = ({ profile }: any) => {
  const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.headline}>{profile.headline || 'Professional Talent'}</Text>
          <View style={styles.contactRow}>
            <Text>{profile.email}</Text>
            {profile.location && <Text>• {profile.location}</Text>}
            <Text>• {profile.availability?.status || 'Available'}</Text>
          </View>
        </View>

        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        )}

        {profile.experience && profile.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {profile.experience.map((exp: any, i: number) => (
              <View key={i} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.role}>{exp.role}</Text>
                  <Text style={styles.date}>{exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}</Text>
                </View>
                <Text style={styles.company}>{exp.company}</Text>
                {exp.description && <Text style={styles.description}>{exp.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Expertise</Text>
            <View style={styles.skillsGrid}>
              {profile.skills.map((skill: any, i: number) => (
                <View key={i} style={styles.skillBadge}>
                  <Text>{skill.name} ({skill.level})</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {profile.education && profile.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((edu: any, i: number) => (
              <View key={i} style={styles.educationItem}>
                <Text style={styles.institution}>{edu.institution}</Text>
                <Text style={styles.degree}>{edu.degree} in {edu.fieldOfStudy} ({edu.startYear} - {edu.endYear})</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Generated via cogniCV Recruitment Platform • Professional Talent Profile
        </Text>
      </Page>
    </Document>
  );
};
