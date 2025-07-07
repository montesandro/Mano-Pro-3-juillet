// Project detail page with chat, timeline, and management tools
// Complete project management interface for both gestionnaires and artisans

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Euro, 
  Clock, 
  Camera, 
  Upload,
  CheckCircle,
  CreditCard,
  Star
} from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ChatInterface } from '../../components/chat/ChatInterface';
import { ProjectTimeline } from '../../components/project/ProjectTimeline';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    getProjectById, 
    updateProjectStatus, 
    uploadProjectPhotos, 
    createPaymentRequest,
    isLoading 
  } = useProjectStore();
  
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<'before' | 'during' | 'after'>('before');
  const [photos, setPhotos] = useState<File[]>([]);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const project = id ? getProjectById(id) : undefined;

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projet non trouvé</h1>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const isGestionnaire = user?.role === 'gestionnaire';
  const isArtisan = user?.role === 'artisan';
  const canManageProject = (isGestionnaire && project.gestionnaire.id === user?.id) || 
                          (isArtisan && project.artisan.id === user?.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="info">Accepté</Badge>;
      case 'in_progress':
        return <Badge variant="warning">En cours</Badge>;
      case 'completed':
        return <Badge variant="success">Terminé</Badge>;
      case 'paid':
        return <Badge variant="success">Payé</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    updateProjectStatus(project.id, newStatus as any);
  };

  const handlePhotoUpload = () => {
    if (photos.length === 0) return;
    
    const photoUrls = photos.map(photo => URL.createObjectURL(photo));
    uploadProjectPhotos(project.id, selectedPhase, photoUrls);
    setPhotos([]);
    setShowPhotoModal(false);
  };

  const handlePaymentRequest = () => {
    createPaymentRequest(
      project.id,
      project.artisan.id,
      project.price,
      `Paiement pour: ${project.title}`
    );
    setShowPaymentModal(false);
  };

  const handleRatingSubmit = () => {
    // In real app, save rating and review
    console.log('Rating:', rating, 'Review:', review);
    setShowRatingModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {project.title}
            </h1>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{project.address}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Euro className="h-4 w-4" />
                <span>{project.price}€</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusBadge(project.status)}
          {canManageProject && (
            <div className="flex space-x-2">
              {isArtisan && project.status === 'accepted' && (
                <Button
                  onClick={() => handleStatusUpdate('in_progress')}
                  size="sm"
                >
                  Démarrer
                </Button>
              )}
              {isArtisan && project.status === 'in_progress' && (
                <Button
                  onClick={() => handleStatusUpdate('completed')}
                  size="sm"
                  variant="secondary"
                >
                  Marquer terminé
                </Button>
              )}
              {isArtisan && project.status === 'completed' && (
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  size="sm"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Demander paiement
                </Button>
              )}
              {isGestionnaire && project.status === 'completed' && !project.rating && (
                <Button
                  onClick={() => setShowRatingModal(true)}
                  size="sm"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Noter l'artisan
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Project Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Détails du projet
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {project.description}
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Gestionnaire
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300 font-medium">
                      {project.gestionnaire.firstName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {project.gestionnaire.firstName} {project.gestionnaire.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.gestionnaire.company}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Artisan
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 dark:text-orange-300 font-medium">
                      {project.artisan.firstName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {project.artisan.firstName} {project.artisan.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.artisan.company}
                    </p>
                    {project.artisan.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {project.artisan.rating}/5
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Photos */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Photos du projet
              </h2>
              {canManageProject && (
                <Button
                  onClick={() => setShowPhotoModal(true)}
                  size="sm"
                  variant="secondary"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Ajouter photos
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {(['before', 'during', 'after'] as const).map(phase => (
                <div key={phase}>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 capitalize">
                    {phase === 'before' ? 'Avant' : phase === 'during' ? 'En cours' : 'Après'}
                    <span className="text-sm text-gray-500 ml-2">
                      ({project.photos[phase].length} photo{project.photos[phase].length > 1 ? 's' : ''})
                    </span>
                  </h3>
                  
                  {project.photos[phase].length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {project.photos[phase].map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`${phase} ${index + 1}`}
                          className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Aucune photo pour cette phase
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Chat */}
          <ChatInterface projectId={project.id} />
        </div>

        {/* Right Column - Timeline */}
        <div>
          <ProjectTimeline project={project} />
        </div>
      </div>

      {/* Photo Upload Modal */}
      <Modal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        title="Ajouter des photos"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phase du projet
            </label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="before">Avant intervention</option>
              <option value="during">En cours d'intervention</option>
              <option value="after">Après intervention</option>
            </select>
          </div>
          
          <div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && setPhotos(Array.from(e.target.files))}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="block w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500"
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cliquez pour sélectionner des photos
              </p>
            </label>
          </div>
          
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(photo)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-20 object-cover rounded"
                />
              ))}
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowPhotoModal(false)}>
              Annuler
            </Button>
            <Button onClick={handlePhotoUpload} disabled={photos.length === 0}>
              Ajouter photos
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Request Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Demander le paiement"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Récapitulatif du projet
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {project.title}
            </p>
            <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 mt-2">
              Montant: {project.price}€
            </p>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Une demande de paiement sera envoyée à l'administrateur pour validation.
            Une facture sera automatiquement générée.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
              Annuler
            </Button>
            <Button onClick={handlePaymentRequest} isLoading={isLoading}>
              Demander le paiement
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="Noter l'artisan"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note (1 à 5 étoiles)
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Partagez votre expérience avec cet artisan..."
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowRatingModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleRatingSubmit}>
              Publier l'avis
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};