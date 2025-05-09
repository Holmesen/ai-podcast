import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from './theme';

interface RecordControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  onMoreOptions?: () => void;
}

export function RecordControls({ isRecording, onToggleRecording, onMoreOptions }: RecordControlsProps) {
  return (
    <View style={styles.recordFooter}>
      <View style={styles.inputActions}>
        <Text style={[styles.recordStatus, isRecording && styles.recordingText]}>
          {isRecording ? '正在录音...' : '点击麦克风开始录音'}
        </Text>
        <Text style={styles.recordHelp}>{isRecording ? '点击停止录音' : 'AI 主持人正在等待你的回应...'}</Text>
      </View>

      <TouchableOpacity
        style={[styles.micButton, isRecording && styles.micButtonRecording]}
        onPress={onToggleRecording}
      >
        <Ionicons name="mic" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={onMoreOptions}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.neutral700} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  recordFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  inputActions: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  recordStatus: {
    fontWeight: '500',
    marginBottom: 4,
    fontSize: 15,
    color: colors.neutral700,
  },
  recordingText: {
    color: colors.error,
  },
  recordHelp: {
    fontSize: 13,
    color: colors.neutral500,
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  micButtonRecording: {
    backgroundColor: colors.error,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
