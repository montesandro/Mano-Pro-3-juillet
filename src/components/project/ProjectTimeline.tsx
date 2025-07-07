// Project timeline component showing progress and updates
// Visual timeline of project milestones and communications

import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Camera, 
  CreditCard, 
  AlertTriangle,
  User,
  Loader2
} from 'lucide-react';
import { Project, ProjectTimelineEntry } from '../../types';

interface ProjectTimelineProps {
  project: Project;
  className?: string;
  isLoading?: boolean;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project, className, isLoading = false }) => {
  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return CheckCircle;
      case 'message':
        return MessageSquare;
      case 'photo_upload':
        return Camera;
      case 'payment':
        return CreditCard;
      default:
        return Clock;
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'status_change':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'message':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'photo_upload':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'payment':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Historique du projet
      </h3>
      
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Chargement de l'historique...
            </p>
          </div>
        ) : project.timeline.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucun événement pour le moment
            </p>
          </div>
        ) : (
          project.timeline
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map((entry, index) => {
              const Icon = getTimelineIcon(entry.type);
              const colorClass = getTimelineColor(entry.type);
              
              return (
                <div key={entry.id} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.message}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center mt-1 space-x-2">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {entry.author}
                      </span>
                    </div>
                    
                    {entry.photos && entry.photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {entry.photos.map((photo, photoIndex) => (
                          <img
                            key={photoIndex}
                            src={photo}
                            alt={`Photo ${photoIndex + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {index < project.timeline.length - 1 && (
                    <div className="absolute left-5 mt-10 w-px h-6 bg-gray-200 dark:bg-gray-600" />
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};