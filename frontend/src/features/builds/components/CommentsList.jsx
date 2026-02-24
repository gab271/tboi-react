/**
 * CommentsList Component
 * Display and manage comments on a build
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaClock, 
  FaReply, 
  FaTrash, 
  FaFlag,
  FaSpinner 
} from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import { useAddComment, useDeleteComment } from '../hooks';
import { VALIDATION } from '../constants';
import { cn } from '../../../lib/utils';

// Format relative time
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

// Single Comment Component
function Comment({ comment, postId, onLoginRequired, onReport }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();
  
  const isAuthor = user?.id === comment.author_id;

  const handleReply = async () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    
    if (!replyContent.trim()) return;
    
    await addCommentMutation.mutateAsync({
      postId,
      content: replyContent.trim(),
      parentId: comment.id,
    });
    
    setReplyContent('');
    setShowReply(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    await deleteCommentMutation.mutateAsync({
      commentId: comment.id,
      postId,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border-l-2 border-text-ink/20 pl-4 py-2",
        comment.parent_id && "ml-6 border-l-accent-gold/40"
      )}
    >
      {/* Comment Header */}
      <div className="flex items-center gap-2 mb-2">
        {/* Avatar */}
        {comment.author?.avatar_url ? (
          <img
            src={comment.author.avatar_url}
            alt={comment.author.username}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-bg-paper-dark flex items-center justify-center">
            <FaUser className="w-3 h-3 text-text-dim" />
          </div>
        )}
        
        {/* Username */}
        <span className="font-pixel text-xs text-text-heading">
          {comment.author?.username || comment.author?.display_name || 'Anonymous'}
        </span>
        
        {/* Time */}
        <span className="flex items-center gap-1 text-xs text-text-dim">
          <FaClock className="w-3 h-3" />
          {formatRelativeTime(comment.created_at)}
        </span>
      </div>

      {/* Content */}
      <p className="font-handwriting text-lg text-text-ink whitespace-pre-wrap mb-2">
        {comment.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 text-xs">
        {/* Reply */}
        <button
          onClick={() => {
            if (!user) {
              onLoginRequired?.();
              return;
            }
            setShowReply(!showReply);
          }}
          className="flex items-center gap-1 text-text-dim hover:text-accent-blood transition-colors"
        >
          <FaReply className="w-3 h-3" />
          Reply
        </button>

        {/* Delete (author only) */}
        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={deleteCommentMutation.isPending}
            className="flex items-center gap-1 text-text-dim hover:text-accent-blood transition-colors"
          >
            <FaTrash className="w-3 h-3" />
            Delete
          </button>
        )}

        {/* Report (non-author) */}
        {!isAuthor && user && (
          <button
            onClick={() => onReport?.('comment', comment.id)}
            className="flex items-center gap-1 text-text-dim hover:text-accent-blood transition-colors"
          >
            <FaFlag className="w-3 h-3" />
            Report
          </button>
        )}
      </div>

      {/* Reply Form */}
      <AnimatePresence>
        {showReply && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="flex gap-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={t('builds.comments.writeReply')}
                rows={2}
                maxLength={VALIDATION.comment.max}
                className="flex-1 p-2 bg-bg-paper-dark border border-text-ink/30 font-handwriting text-lg focus:outline-none focus:border-accent-blood resize-none"
              />
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleReply}
                  disabled={addCommentMutation.isPending || !replyContent.trim()}
                  className="px-3 py-1 font-pixel text-xs bg-accent-blood text-white hover:bg-accent-blood/90 disabled:opacity-50 transition-all"
                >
                  {addCommentMutation.isPending ? <FaSpinner className="animate-spin" /> : 'Reply'}
                </button>
                <button
                  onClick={() => {
                    setShowReply(false);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 font-pixel text-xs text-text-dim hover:text-text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main CommentsList Component
export function CommentsList({ postId, comments = [], onLoginRequired, onReport }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  
  const addCommentMutation = useAddComment();

  // Organize comments into tree structure
  const rootComments = comments.filter(c => !c.parent_id);
  const childComments = comments.filter(c => c.parent_id);
  
  const getChildComments = (parentId) => 
    childComments.filter(c => c.parent_id === parentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      onLoginRequired?.();
      return;
    }
    
    if (!newComment.trim()) return;
    
    await addCommentMutation.mutateAsync({
      postId,
      content: newComment.trim(),
    });
    
    setNewComment('');
  };

  return (
    <div className="space-y-4">
      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="bg-bg-paper border-2 border-text-ink/30 p-4">
          {user ? (
            <>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('builds.comments.shareThoughts')}
                rows={3}
                maxLength={VALIDATION.comment.max}
                className="w-full p-3 bg-bg-paper-dark border border-text-ink/20 font-handwriting text-lg focus:outline-none focus:border-accent-blood resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-text-dim font-pixel">
                  {newComment.length}/{VALIDATION.comment.max}
                </span>
                <button
                  type="submit"
                  disabled={addCommentMutation.isPending || !newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 font-pixel text-sm bg-accent-blood text-white hover:bg-accent-blood/90 disabled:opacity-50 transition-all"
                >
                  {addCommentMutation.isPending ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Comment'
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="font-handwriting text-lg text-text-dim mb-3">
                Sign in to leave a comment
              </p>
              <button
                type="button"
                onClick={onLoginRequired}
                className="px-4 py-2 font-pixel text-sm border-2 border-accent-blood text-accent-blood hover:bg-accent-blood hover:text-white transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="font-handwriting text-xl text-text-dim">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rootComments.map((comment) => (
            <div key={comment.id}>
              <Comment
                comment={comment}
                postId={postId}
                onLoginRequired={onLoginRequired}
                onReport={onReport}
              />
              
              {/* Child comments */}
              {getChildComments(comment.id).map((child) => (
                <Comment
                  key={child.id}
                  comment={child}
                  postId={postId}
                  onLoginRequired={onLoginRequired}
                  onReport={onReport}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentsList;
