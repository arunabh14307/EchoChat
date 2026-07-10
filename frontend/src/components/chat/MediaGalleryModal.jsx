import React, { useState } from 'react';
import { Image, FileText, Video, Download, ExternalLink, Calendar } from 'lucide-react';
import Modal from '../ui/Modal';
import { useChatStore } from '@store/chatStore';
import { formatConversationTime } from '@utils/formatTime';

/**
 * MediaGalleryModal — Displays a categorized layout of shared images, videos, and files.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void
 * }} props
 */
const MediaGalleryModal = ({ isOpen, onClose }) => {
  const { activeConversationId, getMessages } = useChatStore();
  const [activeTab, setActiveTab] = useState('media'); // 'media' (img/video) or 'docs' (pdf/zip/docx)

  const messages = getMessages(activeConversationId);

  // Filter messages containing media attachments
  const mediaMessages = messages.filter(
    (m) => m.media && m.media.url && !m.deletedForEveryone
  );

  const imagesAndVideos = mediaMessages.filter(
    (m) => m.messageType === 'image' || m.messageType === 'video'
  );

  const documents = mediaMessages.filter((m) => m.messageType === 'file');

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shared Files & Media" size="lg">
      <div className="flex flex-col gap-5 min-h-[350px] max-h-[70vh] select-none">
        {/* Tabs header */}
        <div className="flex border-b border-surface-800 shrink-0">
          <button
            onClick={() => setActiveTab('media')}
            className={`
              flex-1 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer
              ${
                activeTab === 'media'
                  ? 'border-primary-500 text-primary-400 font-bold'
                  : 'border-transparent text-surface-400 hover:text-surface-200'
              }
            `}
          >
            Media ({imagesAndVideos.length})
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`
              flex-1 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer
              ${
                activeTab === 'docs'
                  ? 'border-primary-500 text-primary-400 font-bold'
                  : 'border-transparent text-surface-400 hover:text-surface-200'
              }
            `}
          >
            Documents ({documents.length})
          </button>
        </div>

        {/* Tab contents */}
        <div className="flex-1 overflow-y-auto scroll-hidden">
          {activeTab === 'media' ? (
            imagesAndVideos.length > 0 ? (
              // Media grid (Images & Videos)
              <div className="grid grid-cols-3 gap-2.5">
                {imagesAndVideos.map((m) => (
                  <a
                    key={m._id}
                    href={m.media.url}
                    target="_blank"
                    rel="noreferrer"
                    className="relative aspect-square bg-surface-850 rounded-xl overflow-hidden group border border-surface-800"
                  >
                    {m.messageType === 'image' ? (
                      <img
                        src={m.media.url}
                        alt={m.media.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-surface-500 relative">
                        <Video className="w-8 h-8" />
                        <span className="absolute bottom-1.5 right-1.5 text-[9px] bg-surface-950/80 px-1 py-0.5 rounded font-semibold text-surface-300">
                          Video
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-surface-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-surface-500 gap-2">
                <Image className="w-8 h-8 opacity-45" />
                <p className="text-sm">No shared media yet</p>
              </div>
            )
          ) : documents.length > 0 ? (
            // Documents List
            <div className="flex flex-col gap-2">
              {documents.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between p-3.5 bg-surface-900/60 hover:bg-surface-800/40 border border-surface-800/40 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center text-primary-500 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-surface-100 truncate leading-tight">
                        {m.media.name}
                      </span>
                      <span className="text-2xs text-surface-500 flex items-center gap-1.5 mt-0.5 font-medium">
                        <span>{formatBytes(m.media.size)}</span>
                        <span>•</span>
                        <Calendar className="w-3 h-3 text-surface-600" />
                        <span>{formatConversationTime(m.createdAt)}</span>
                      </span>
                    </div>
                  </div>

                  <a
                    href={m.media.url}
                    download={m.media.name}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white rounded-lg transition-colors border border-surface-750"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-surface-500 gap-2">
              <FileText className="w-8 h-8 opacity-45" />
              <p className="text-sm">No shared documents yet</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MediaGalleryModal;
export { MediaGalleryModal };
