import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken } from './auth';
import { triggerErrorHaptic, triggerSuccessHaptic } from './haptics';

// Types
export interface DuaComment {
  id: string;
  duaRequestId: string;
  userId: string;
  userDisplayName: string;
  userProfilePhoto?: string;
  isAnonymous: boolean;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  isOwner: boolean;
  likes: number;
  isLiked: boolean;
  replies: DuaCommentReply[];
}

export interface DuaCommentReply {
  id: string;
  userId: string;
  userDisplayName: string;
  userProfilePhoto?: string;
  isAnonymous: boolean;
  content: string;
  createdAt: Date;
  isOwner: boolean;
}

export interface CommentResult {
  success: boolean;
  comment?: DuaComment;
  error?: string;
}

export interface CommentsResponse {
  success: boolean;
  comments: DuaComment[];
  totalCount: number;
  hasMore: boolean;
  error?: string;
}

// Constants
const API_BASE_URL = 'https://api.hidayet.app/v1';
const COMMENT_CACHE_PREFIX = 'hidayet_comments_';
const MAX_COMMENT_LENGTH = 180;

// Add comment to dua request
export async function addComment(
  duaRequestId: string,
  content: string,
  isAnonymous: boolean = false
): Promise<CommentResult> {
  try {
    // Validate content
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return {
        success: false,
        error: 'Yorum içeriği boş olamaz'
      };
    }

    if (trimmedContent.length > MAX_COMMENT_LENGTH) {
      return {
        success: false,
        error: `Yorum ${MAX_COMMENT_LENGTH} karakterden fazla olamaz`
      };
    }

    // Check auth
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Yorum yapabilmek için giriş yapmalısınız'
      };
    }

    // Send to backend
    const response = await fetch(`${API_BASE_URL}/dua-requests/${duaRequestId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: trimmedContent,
        isAnonymous
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      triggerErrorHaptic();
      return {
        success: false,
        error: data.message || 'Yorum eklenirken hata oluştu'
      };
    }

    // Clear cache for this dua request
    await clearCommentsCache(duaRequestId);

    triggerSuccessHaptic();
    return {
      success: true,
      comment: data.comment
    };

  } catch (error) {
    console.error('Add comment error:', error);
    triggerErrorHaptic();
    return {
      success: false,
      error: 'İnternet bağlantısını kontrol edin'
    };
  }
}

// Get comments for dua request
export async function getComments(
  duaRequestId: string,
  page: number = 1,
  limit: number = 20,
  useCache: boolean = true
): Promise<CommentsResponse> {
  try {
    const cacheKey = `${COMMENT_CACHE_PREFIX}${duaRequestId}_${page}_${limit}`;

    // Try cache first if requested
    if (useCache && page === 1) {
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          const cacheAge = Date.now() - cachedData.timestamp;
          
          // Use cache if less than 2 minutes old
          if (cacheAge < 2 * 60 * 1000) {
            return {
              success: true,
              comments: cachedData.comments,
              totalCount: cachedData.totalCount,
              hasMore: cachedData.hasMore
            };
          }
        }
      } catch (cacheError) {
        console.warn('Cache read error:', cacheError);
      }
    }

    // Fetch from API
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/dua-requests/${duaRequestId}/comments?page=${page}&limit=${limit}`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        comments: [],
        totalCount: 0,
        hasMore: false,
        error: data.message || 'Yorumlar yüklenirken hata oluştu'
      };
    }

    // Cache the results for first page
    if (page === 1) {
      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          comments: data.comments,
          totalCount: data.totalCount,
          hasMore: data.hasMore,
          timestamp: Date.now()
        }));
      } catch (cacheError) {
        console.warn('Cache write error:', cacheError);
      }
    }

    return {
      success: true,
      comments: data.comments,
      totalCount: data.totalCount,
      hasMore: data.hasMore
    };

  } catch (error) {
    console.error('Get comments error:', error);
    return {
      success: false,
      comments: [],
      totalCount: 0,
      hasMore: false,
      error: 'İnternet bağlantısını kontrol edin'
    };
  }
}

// Delete comment
export async function deleteComment(
  duaRequestId: string,
  commentId: string
): Promise<CommentResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Oturum süresi dolmuş'
      };
    }

    const response = await fetch(
      `${API_BASE_URL}/dua-requests/${duaRequestId}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      triggerErrorHaptic();
      return {
        success: false,
        error: data.message || 'Yorum silinirken hata oluştu'
      };
    }

    // Clear cache for this dua request
    await clearCommentsCache(duaRequestId);

    triggerSuccessHaptic();
    return {
      success: true
    };

  } catch (error) {
    console.error('Delete comment error:', error);
    triggerErrorHaptic();
    return {
      success: false,
      error: 'İnternet bağlantısını kontrol edin'
    };
  }
}

// Like/unlike comment
export async function toggleCommentLike(
  duaRequestId: string,
  commentId: string
): Promise<CommentResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Beğenmek için giriş yapmalısınız'
      };
    }

    const response = await fetch(
      `${API_BASE_URL}/dua-requests/${duaRequestId}/comments/${commentId}/like`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      triggerErrorHaptic();
      return {
        success: false,
        error: data.message || 'Beğeni işleminde hata oluştu'
      };
    }

    // Clear cache for this dua request
    await clearCommentsCache(duaRequestId);

    triggerSuccessHaptic();
    return {
      success: true,
      comment: data.comment
    };

  } catch (error) {
    console.error('Toggle comment like error:', error);
    triggerErrorHaptic();
    return {
      success: false,
      error: 'İnternet bağlantısını kontrol edin'
    };
  }
}

// Report comment
export async function reportComment(
  duaRequestId: string,
  commentId: string,
  reason: string
): Promise<CommentResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Şikayet için giriş yapmalısınız'
      };
    }

    const response = await fetch(
      `${API_BASE_URL}/dua-requests/${duaRequestId}/comments/${commentId}/report`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      triggerErrorHaptic();
      return {
        success: false,
        error: data.message || 'Şikayet gönderilirken hata oluştu'
      };
    }

    triggerSuccessHaptic();
    return {
      success: true
    };

  } catch (error) {
    console.error('Report comment error:', error);
    triggerErrorHaptic();
    return {
      success: false,
      error: 'İnternet bağlantısını kontrol edin'
    };
  }
}

// Edit comment
export async function editComment(
  duaRequestId: string,
  commentId: string,
  newContent: string
): Promise<CommentResult> {
  try {
    // Validate content
    const trimmedContent = newContent.trim();
    if (!trimmedContent) {
      return {
        success: false,
        error: 'Yorum içeriği boş olamaz'
      };
    }

    if (trimmedContent.length > MAX_COMMENT_LENGTH) {
      return {
        success: false,
        error: `Yorum ${MAX_COMMENT_LENGTH} karakterden fazla olamaz`
      };
    }

    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Oturum süresi dolmuş'
      };
    }

    const response = await fetch(
      `${API_BASE_URL}/dua-requests/${duaRequestId}/comments/${commentId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: trimmedContent
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      triggerErrorHaptic();
      return {
        success: false,
        error: data.message || 'Yorum güncellenirken hata oluştu'
      };
    }

    // Clear cache for this dua request
    await clearCommentsCache(duaRequestId);

    triggerSuccessHaptic();
    return {
      success: true,
      comment: data.comment
    };

  } catch (error) {
    console.error('Edit comment error:', error);
    triggerErrorHaptic();
    return {
      success: false,
      error: 'İnternet bağlantısını kontrol edin'
    };
  }
}

// Get comment statistics
export async function getCommentStats(duaRequestId: string): Promise<{
  totalComments: number;
  recentCommenters: Array<{ displayName: string; profilePhoto?: string }>;
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dua-requests/${duaRequestId}/comments/stats`
    );

    if (!response.ok) {
      return {
        totalComments: 0,
        recentCommenters: []
      };
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Get comment stats error:', error);
    return {
      totalComments: 0,
      recentCommenters: []
    };
  }
}

// Validate comment content
export function validateCommentContent(content: string): {
  isValid: boolean;
  error?: string;
  cleanContent?: string;
} {
  const trimmed = content.trim();
  
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Yorum boş olamaz'
    };
  }

  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return {
      isValid: false,
      error: `En fazla ${MAX_COMMENT_LENGTH} karakter girebilirsiniz`
    };
  }

  // Check for inappropriate content patterns
  const inappropriatePatterns = [
    /telefon|phone|\d{10,}/i,
    /email|@.*\./i,
    /adres|address/i,
    /para|money|₺|\$/i,
    /link|http|www\./i
  ];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Kişisel bilgi veya uygunsuz içerik paylaşmayın'
      };
    }
  }

  return {
    isValid: true,
    cleanContent: trimmed
  };
}

// Clear comments cache for a specific dua request
async function clearCommentsCache(duaRequestId: string): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => 
      key.startsWith(`${COMMENT_CACHE_PREFIX}${duaRequestId}_`)
    );
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.warn('Clear comments cache error:', error);
  }
}

// Get max comment length constant
export function getMaxCommentLength(): number {
  return MAX_COMMENT_LENGTH;
}

// Format comment time
export function formatCommentTime(createdAt: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(createdAt).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'şimdi';
  } else if (diffMins < 60) {
    return `${diffMins}dk önce`;
  } else if (diffHours < 24) {
    return `${diffHours}s önce`;
  } else if (diffDays < 7) {
    return `${diffDays}g önce`;
  } else {
    return new Date(createdAt).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    });
  }
} 