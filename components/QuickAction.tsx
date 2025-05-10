import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: string;
  actionText: string;
  href: string;
}

export function QuickAction({ title, subtitle, icon, actionText, href }: QuickActionProps) {
  return (
    <View style={styles.quickAction}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon as any} size={24} color="white" />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        <Link href={href as any} asChild>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionButtonText}>{actionText}</Text>
            <Ionicons name="arrow-forward" size={16} color="#6366f1" style={styles.buttonIcon} />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickAction: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  quickActionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  quickActionButtonText: {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  quickActionIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
});
