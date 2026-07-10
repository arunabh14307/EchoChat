import React, { useState, useEffect, useRef } from 'react';
import { Send, X, CornerUpLeft, Check, Paperclip, AlertCircle, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useSocketStore } from '@store/socketStore';
import { SOCKET_EVENTS } from '@utils/constants';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

/**
 * MessageInput — composer field with reply, edit previews, media upload progress bars, and retry handlers.
 *
 * @param {{
 *   conversationId: string,
 *   replyToMessage: any | null,
 *   onClearReply: () => void,
 *   editMessage: any | null,
 *   onClearEdit: () => void,
 *   onSend: (text: string) => void,
 *   onSendMedia: (file: File, caption: string, onProgress: (ev: any) => void) => Promise<void>,
 *   onEditSubmit: (messageId: string, text: string) => void
 * }} props
 */
const MessageInput = ({
  conversationId,
  replyToMessage,
  onClearReply,
  editMessage,
  onClearEdit,
  onSend,
  onSendMedia,
  onEditSubmit,
}) => {
  const [text, setText] = useState('');
  const { socket } = useSocketStore();

  // Media upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Focus input on mounting or edits/replies
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversationId, replyToMessage, editMessage]);

  // Load edit content into state
  useEffect(() => {
    if (editMessage) {
      setText(editMessage.content);
    } else {
      setText('');
    }
  }, [editMessage]);

  // Clear previews if conversation changes
  useEffect(() => {
    handleClearFile();
  }, [conversationId]);

  const handleTextChange = (e) => {
    setText(e.target.value);

    // Typing emission indicators via Socket.io
    if (!socket || !conversationId) {
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit(SOCKET_EVENTS.TYPING_START, { conversationId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
    }, 1500);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Size limit check (25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('File size exceeds the 25MB limit.');
      return;
    }

    // Supported formats check
    const allowedTypes = [
      'image/',
      'video/',
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    const isSupported = allowedTypes.some(
      (type) => file.type.startsWith(type) || file.name.endsWith('.zip') || file.name.endsWith('.docx')
    );

    if (!isSupported) {
      toast.error('Supported formats: Images, Videos, PDF, ZIP, DOCX.');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);

    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl('');
    }
  };

  const handleClearFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadProgress(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const executeUpload = async () => {
    if (!selectedFile) return;

    setUploadProgress(0);
    setUploadError(null);

    try {
      await onSendMedia(selectedFile, text.trim(), (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      // Clear states on success
      handleClearFile();
      setText('');
    } catch (err) {
      setUploadError('Upload failed. Please try again.');
      setUploadProgress(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Stop typing indicators immediately on send
    if (socket && conversationId && isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
    }

    if (selectedFile) {
      await executeUpload();
    } else {
      if (!text.trim()) return;

      if (editMessage) {
        onEditSubmit(editMessage._id, text.trim());
      } else {
        onSend(text.trim());
      }
      setText('');
    }
  };

  // Stop typing on component unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const isUploading = uploadProgress !== null;

  return (
    <div className="flex flex-col gap-1.5 shrink-0 bg-surface-900/60 backdrop-blur-md border-t border-surface-800 p-4 select-none">
      {/* Reply Preview Bar */}
      {replyToMessage && (
        <div className="flex justify-between items-center bg-surface-850 border-l-2 border-primary-500/80 p-2.5 rounded-lg text-xs mb-1 animate-fade-up">
          <div className="flex flex-col gap-0.5 truncate pr-4">
            <span className="font-semibold text-primary-400 flex items-center gap-1">
              <CornerUpLeft className="w-3.5 h-3.5" />
              <span>
                Reply to{' '}
                {replyToMessage.sender?.displayName || replyToMessage.sender?.username}
              </span>
            </span>
            <span className="text-surface-400 truncate max-w-lg leading-none">
              {replyToMessage.content}
            </span>
          </div>
          <button
            type="button"
            onClick={onClearReply}
            className="p-1 rounded-md hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit Preview Bar */}
      {editMessage && (
        <div className="flex justify-between items-center bg-surface-850 border-l-2 border-warning-500/80 p-2.5 rounded-lg text-xs mb-1 animate-fade-up">
          <div className="flex flex-col gap-0.5 truncate pr-4">
            <span className="font-semibold text-warning-400">
              Editing Message
            </span>
            <span className="text-surface-400 truncate max-w-lg leading-none">
              {editMessage.content}
            </span>
          </div>
          <button
            type="button"
            onClick={onClearEdit}
            className="p-1 rounded-md hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Media Upload Preview & Progress Drawer */}
      {selectedFile && (
        <div className="bg-surface-850 p-3.5 rounded-xl border border-surface-800 flex flex-col gap-2.5 mb-1.5 animate-fade-up">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-12 h-12 object-cover rounded-lg border border-surface-700 shrink-0"
                />
              ) : selectedFile.type.startsWith('video/') ? (
                <div className="w-12 h-12 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center text-primary-500 shrink-0">
                  <span className="text-3xs font-bold uppercase">Video</span>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center text-primary-500 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-surface-100 truncate leading-tight">
                  {selectedFile.name}
                </span>
                <span className="text-2xs text-surface-500 mt-0.5 font-medium">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>

            {/* Cancel/Dismiss selection */}
            {!isUploading && (
              <button
                type="button"
                onClick={handleClearFile}
                className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {/* Progress state indicator */}
          {isUploading && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-2xs text-surface-400 font-semibold select-none">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-500" />
                  <span>Uploading file...</span>
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-surface-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary-500 h-full transition-all duration-150 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error & Retry options */}
          {uploadError && (
            <div className="flex items-center justify-between bg-danger-950/20 border border-danger-500/20 px-3 py-2 rounded-lg text-xs text-danger-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={executeUpload}
                  className="px-2.5 py-1 bg-danger-600 hover:bg-danger-500 text-white rounded text-2xs font-semibold"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="px-2.5 py-1 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded text-2xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Composer form input field */}
      <form onSubmit={handleFormSubmit} className="flex gap-3">
        {/* Attachment paperclip trigger button */}
        {!editMessage && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2.5 rounded-xl border border-surface-800/80 hover:border-surface-700 bg-surface-900/40 shrink-0"
            title="Attach File"
          >
            <Paperclip className="w-4.5 h-4.5 text-surface-400" />
          </Button>
        )}

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleTextChange}
          disabled={isUploading}
          placeholder={
            editMessage
              ? 'Edit your message...'
              : selectedFile
              ? 'Add a caption (optional)...'
              : 'Type a message...'
          }
          className="flex-1 bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-surface-100 placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
        />

        <Button
          type="submit"
          disabled={isUploading || (!selectedFile && !text.trim())}
          variant={editMessage ? 'outline' : 'primary'}
          className="px-5 shrink-0"
          rightIcon={editMessage ? <Check className="w-4.5 h-4.5" /> : <Send className="w-4.5 h-4.5" />}
        >
          {editMessage ? 'Save' : 'Send'}
        </Button>
      </form>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*,application/pdf,application/zip,application/x-zip-compressed,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
      />
    </div>
  );
};

export default MessageInput;
export { MessageInput };
