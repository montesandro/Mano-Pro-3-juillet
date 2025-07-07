// Emergency detail page for gestionnaires
// Complete emergency management with proposals, selection, and project creation

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Euro, 
  Clock, 
  AlertTriangle,
  User,
  Star,
  Phone,
  Mail,
  Building,
  CheckCircle,
  X,
  Eye,
  MessageSquare,
  Camera
} from 'lucide-react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PARIS_ARRONDISSEMENTS, URGENCY_LEVELS } from '../../types';

export const EmergencyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    getEmergencyById, 
    getProposalsByEmergency, 
    updateProposalStatus,
    updateEmergencyStatus,
    isLoading 
  } = useEmergencyStore();
  
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactProposal, setContactProposal] = useState<string | null>(null);

  const emergency = id ? getEmergencyById(id) : undefined;
  const proposals = id ? getProposalsByEmergency(id) : [];

  if (!emergency) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Urgence non trouvée</h1>
        <Button onClick={() => navigate('/emergencies')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux urgences
        </Button>
      </div>
    );
  }

  // Check if user is the owner of this emergency
  const isOwner = user?.id === emergency.createdBy;
  if (!isOwner) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accès non autorisé</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Vous n'avez pas l'autorisation de voir cette urgence.
        </p>
        <Button onClick={() => navigate('/emergencies')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux urgences
        </Button>
      </div>
    );
  }

  const arrondissement = PARIS_ARRONDISSEMENTS.find(arr => arr.id === emergency.arrondissement);
  const urgencyConfig = URGENCY_LEVELS.find(level => level.value === emergency.urgencyLevel);

  const handleAcceptProposal = async (proposalId: string) => {
    await updateProposalStatus(proposalId, 'accepted');
    await updateEmergencyStatus(emergency.id, 'in_progress');
    setSelectedProposal(null);
  };

  const handleRejectProposal = async (proposalId: string) => {
    await updateProposalStatus(proposalId, 'rejected');
    setSelectedProposal(null);
  };

  const handleContactArtisan = (proposalId: string) => {
    setContactProposal(proposalId);
    setShowContactModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="warning">Ouvert</Badge>;
      case 'in_progress':
        return <Badge variant="info">En cours</Badge>;
      case 'completed':
        return <Badge variant="success">Terminé</Badge>;
      case 'closed':
        return <Badge variant="default">Fermé</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getProposalStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">En attente</Badge>;
      case 'accepted':
        return <Badge variant="success">Acceptée</Badge>;
      case 'rejected':
        return <Badge variant="danger">Refusée</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const acceptedProposal = proposals.find(p => p.status === 'accepted');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/emergencies')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {emergency.title}
            </h1>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTimeAgo(emergency.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{arrondissement?.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Euro className="h-4 w-4" />
                <span>Budget max: {emergency.maxBudget}€</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {urgencyConfig && (
            <div className="flex items-center space-x-1">
              <AlertTriangle className={`h-4 w-4 ${
                emergency.urgencyLevel === 'critical' ? 'text-red-500' :
                emergency.urgencyLevel === 'high' ? 'text-orange-500' :
                emergency.urgencyLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
              }`} />
              <span className="text-sm font-medium">{urgencyConfig.label}</span>
            </div>
          )}
          {getStatusBadge(emergency.status)}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Emergency Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Emergency Information */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Détails de l'urgence
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">{emergency.description}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Adresse</h3>
                  <p className="text-gray-700 dark:text-gray-300">{emergency.address}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Corps de métier</h3>
                  <Badge variant="info">{emergency.trade}</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Photos */}
          {emergency.photos.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Photos ({emergency.photos.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {emergency.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Proposals */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Propositions reçues ({proposals.length})
              </h2>
              {emergency.status === 'open' && pendingProposals.length > 0 && (
                <Badge variant="warning">
                  {pendingProposals.length} en attente
                </Badge>
              )}
            </div>
            
            {proposals.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucune proposition
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Aucun artisan n'a encore proposé ses services pour cette urgence.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map(proposal => (
                  <div
                    key={proposal.id}
                    className={`border rounded-lg p-6 transition-all ${
                      proposal.status === 'accepted'
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : proposal.status === 'rejected'
                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {proposal.artisanName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {proposal.artisanCompany}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {proposal.artisanRating}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getProposalStatusBadge(proposal.status)}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(proposal.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 font-semibold">
                          <Euro className="h-4 w-4" />
                          <span>{proposal.price}€</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Prix proposé</p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-semibold">
                          <Clock className="h-4 w-4" />
                          <span>{proposal.estimatedDuration}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Durée estimée</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {proposal.description}
                    </p>
                    
                    {proposal.status === 'pending' && emergency.status === 'open' && (
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={() => setSelectedProposal(proposal.id)}
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Accepter</span>
                        </Button>
                        <Button
                          onClick={() => handleRejectProposal(proposal.id)}
                          variant="danger"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <X className="h-4 w-4" />
                          <span>Refuser</span>
                        </Button>
                        <Button
                          onClick={() => handleContactArtisan(proposal.id)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Contacter</span>
                        </Button>
                      </div>
                    )}
                    
                    {proposal.status === 'accepted' && (
                      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Proposition acceptée</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Résumé
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
                {getStatusBadge(emergency.status)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Propositions</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {proposals.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Budget max</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {emergency.maxBudget}€
                </span>
              </div>
              
              {proposals.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Prix moyen</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(proposals.reduce((sum, p) => sum + p.price, 0) / proposals.length)}€
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions
            </h3>
            
            <div className="space-y-3">
              {emergency.status === 'open' && (
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate(`/emergencies/${emergency.id}/edit`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Modifier l'urgence
                </Button>
              )}
              
              {acceptedProposal && (
                <Button
                  className="w-full justify-start"
                  onClick={() => navigate(`/projects/${emergency.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir le projet
                </Button>
              )}
              
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => window.print()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
            </div>
          </Card>

          {/* Emergency Timeline */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Historique
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Urgence créée
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(emergency.createdAt)}
                  </p>
                </div>
              </div>
              
              {proposals.map(proposal => (
                <div key={proposal.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    proposal.status === 'accepted' ? 'bg-green-500' :
                    proposal.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Proposition de {proposal.artisanName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(proposal.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Accept Proposal Modal */}
      <Modal
        isOpen={!!selectedProposal}
        onClose={() => setSelectedProposal(null)}
        title="Accepter la proposition"
      >
        {selectedProposal && (
          <div className="space-y-4">
            {(() => {
              const proposal = proposals.find(p => p.id === selectedProposal);
              if (!proposal) return null;
              
              return (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Vous êtes sur le point d'accepter cette proposition :
                    </h4>
                    <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <p><strong>Artisan :</strong> {proposal.artisanName} ({proposal.artisanCompany})</p>
                      <p><strong>Prix :</strong> {proposal.price}€</p>
                      <p><strong>Durée :</strong> {proposal.estimatedDuration}</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Important :</strong> En acceptant cette proposition, vous créez automatiquement 
                      un projet et l'urgence passera en statut "En cours". Les autres propositions seront refusées.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedProposal(null)}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={() => handleAcceptProposal(selectedProposal)}
                      isLoading={isLoading}
                    >
                      Confirmer l'acceptation
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Contact Artisan Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contacter l'artisan"
      >
        {contactProposal && (
          <div className="space-y-4">
            {(() => {
              const proposal = proposals.find(p => p.id === contactProposal);
              if (!proposal) return null;
              
              return (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-8 w-8 text-orange-600 dark:text-orange-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {proposal.artisanName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{proposal.artisanCompany}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      variant="secondary"
                      className="w-full justify-start"
                      onClick={() => window.open(`tel:+33123456789`)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler l'artisan
                    </Button>
                    
                    <Button
                      variant="secondary"
                      className="w-full justify-start"
                      onClick={() => window.open(`mailto:artisan@example.com`)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer un email
                    </Button>
                    
                    <Button
                      variant="secondary"
                      className="w-full justify-start"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Envoyer un message
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => setShowContactModal(false)}
                    >
                      Fermer
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};