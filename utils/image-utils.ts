import { ImageProps, ImageTransition } from 'expo-image';

/**
 * 默认的模糊哈希占位符
 * 这是一个通用的灰色背景模糊哈希，可以作为大多数图片的默认占位符
 */
export const DEFAULT_BLURHASH =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

/**
 * 默认过渡动画配置
 */
export const DEFAULT_TRANSITION: ImageTransition = {
  duration: 300,
  effect: 'cross-dissolve',
};

/**
 * 获取优化的图片属性
 *
 * @param options 图片优化选项
 * @returns 优化后的图片属性
 */
export function getOptimizedImageProps(options?: {
  blurhash?: string;
  transition?: ImageTransition | boolean;
  cachePriority?: ImageProps['cachePolicy'];
  contentFit?: ImageProps['contentFit'];
}): Partial<ImageProps> {
  // 如果transition为boolean类型，则按照默认transition处理
  const transitionValue =
    options?.transition === false
      ? undefined
      : typeof options?.transition === 'object'
      ? options.transition
      : DEFAULT_TRANSITION;

  return {
    contentFit: options?.contentFit || 'cover',
    placeholder: { blurhash: options?.blurhash || DEFAULT_BLURHASH },
    transition: transitionValue,
    cachePolicy: options?.cachePriority || 'memory-disk',
  };
}

/**
 * 生成带有优化属性的图片源对象
 *
 * @param uri 图片 URI
 * @returns 优化后的图片源对象
 */
export function getOptimizedImageSource(uri: string) {
  return { uri };
}

/**
 * 根据用户名或显示名称生成头像 URL
 *
 * @param displayName 显示名称
 * @param username 用户名
 * @returns 生成的头像 URL
 */
export function generateAvatarUrl(displayName?: string, username?: string): string {
  const name = displayName || username || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
}
