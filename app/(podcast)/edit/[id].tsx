import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../components/theme';
import { Podcast, PodcastService } from '../../../services/podcast-service';

export default function EditPodcast() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 编辑字段状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isDownloadable, setIsDownloadable] = useState(true);
  const [showAiAttribution, setShowAiAttribution] = useState(true);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published' | 'private'>('draft');

  // 加载播客数据
  useEffect(() => {
    const loadPodcast = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const { podcast } = await PodcastService.getPodcastDetails(id);
        if (podcast) {
          setPodcast(podcast);

          // 设置表单初始值
          setTitle(podcast.title || '');
          setDescription(podcast.description || '');
          setTags(podcast.tags || []);
          setIsDownloadable(podcast.is_downloadable);
          setShowAiAttribution(podcast.show_ai_attribution);
          setPublishStatus(podcast.publish_status);
        }
      } catch (error) {
        console.error('加载播客数据失败:', error);
        Alert.alert('错误', '无法加载播客数据，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };

    loadPodcast();
  }, [id]);

  // 保存编辑
  const handleSave = async () => {
    if (!id || !podcast) return;

    setIsSaving(true);
    try {
      const success = await PodcastService.updatePodcast(id, {
        title,
        description,
        tags,
        is_downloadable: isDownloadable,
        show_ai_attribution: showAiAttribution,
        publish_status: publishStatus,
      });

      if (success) {
        // 更新 AsyncStorage 中的播客信息
        try {
          const topicData = await AsyncStorage.getItem('selectedTopic');
          if (topicData) {
            const parsedTopicInfo = JSON.parse(topicData);
            if (parsedTopicInfo.podcastId === id) {
              // 更新选中的话题信息
              const updatedTopicInfo = {
                ...parsedTopicInfo,
                topicTitle: title,
                topicDescription: description,
              };
              await AsyncStorage.setItem('selectedTopic', JSON.stringify(updatedTopicInfo));
            }
          }
        } catch (error) {
          console.error('更新AsyncStorage中的播客信息失败:', error);
        }

        Alert.alert('成功', '播客信息已更新');
        router.back();
      } else {
        Alert.alert('错误', '更新播客信息失败，请稍后再试');
      }
    } catch (error) {
      console.error('保存播客数据失败:', error);
      Alert.alert('错误', '保存失败，请稍后再试');
    } finally {
      setIsSaving(false);
    }
  };

  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // 删除标签
  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // 切换发布状态
  const togglePublishStatus = (newStatus: 'draft' | 'published' | 'private') => {
    setPublishStatus(newStatus);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>正在加载...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!podcast) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>找不到播客信息</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>编辑播客</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveButton}>保存</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.content}>
          {/* 标题 */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>标题</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="播客标题"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* 描述 */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>描述</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="播客描述"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* 标签 */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>标签</Text>
            <View style={styles.tagsInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="添加标签"
                placeholderTextColor="#9ca3af"
                onSubmitEditing={addTag}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                <Text style={styles.addTagButtonText}>添加</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Ionicons name="close-circle" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* 发布状态 */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>发布状态</Text>
            <View style={styles.statusContainer}>
              <TouchableOpacity
                style={[styles.statusButton, publishStatus === 'draft' && styles.statusButtonActive]}
                onPress={() => togglePublishStatus('draft')}
              >
                <Text style={[styles.statusButtonText, publishStatus === 'draft' && styles.statusButtonTextActive]}>
                  草稿
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, publishStatus === 'published' && styles.statusButtonActive]}
                onPress={() => togglePublishStatus('published')}
              >
                <Text style={[styles.statusButtonText, publishStatus === 'published' && styles.statusButtonTextActive]}>
                  已发布
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, publishStatus === 'private' && styles.statusButtonActive]}
                onPress={() => togglePublishStatus('private')}
              >
                <Text style={[styles.statusButtonText, publishStatus === 'private' && styles.statusButtonTextActive]}>
                  私有
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 开关选项 */}
          <View style={styles.formGroup}>
            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>允许下载</Text>
              <Switch
                value={isDownloadable}
                onValueChange={setIsDownloadable}
                trackColor={{ false: '#d1d5db', true: '#818cf8' }}
                thumbColor={isDownloadable ? '#4f46e5' : '#f4f4f5'}
              />
            </View>
            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>显示AI创作标识</Text>
              <Switch
                value={showAiAttribution}
                onValueChange={setShowAiAttribution}
                trackColor={{ false: '#d1d5db', true: '#818cf8' }}
                thumbColor={showAiAttribution ? '#4f46e5' : '#f4f4f5'}
              />
            </View>
          </View>

          {/* 底部间距 */}
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.neutral700,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  saveButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 100,
  },
  tagsInputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  addTagButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: 'white',
    marginRight: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
  },
  statusButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: 'white',
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
