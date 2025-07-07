// Opportunity list page for artisans
// Shows available emergencies matching artisan's skills and location

import React, { useState } from 'react';
import { MapPin, Clock, Euro, AlertTriangle, Send, Filter } from 'lucide-react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PARIS_ARRONDISSEMENTS, URGENCY_LEVELS } from '../../types';

export const OpportunityList: React.FC = () => {
  const { emergencies, createProposal, isLoading } = useEmergencyStore();
  const { user } = useAuthStore();
  
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [proposalData, setProposalData] = useState({
    price: '',
    description: '',
    estimatedDuration: ''
  });
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter emergencies for artisan
  const availableEmergencies = emergencies.filter(emergency => {
    if (emergency.status !== 'open') return false;
    
    // Check if artisan's trades match
    if (user?.trades && !user.trades.includes(emergency.trade)) return false;
    
    // Check if artisan covers this arrondissement
    if (user?.arrondissements && !user.arrondissements.includes(emergency.arrondissement)) return false;
    
    // Apply filters
    const matchesSearch = emergency.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emergency.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || emergency.urgencyLevel === urgencyFilter;
    
    return matchesSearch && matchesUrgency;
  });

  const handleProposal = async () => {
    if (!selectedEmergency || !user) return;
    
    if (!proposalData.price || !proposalData.description || !proposalData.estimatedDuration) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      await createProposal({
        emergencyId: selectedEmergency,
        artisanId: user.id,
        artisanName: `${user.firstName} ${user.lastName}`,
        artisanCompany: user.company,
        artisanRating: user.rating || 4.5,
        price: parseInt(proposalData.price),
        description: proposalData.description,
        estimatedDuration: proposalData.estimatedDuration
      });
      
      setSelectedEmergency(null);
      setProposalData({ price: '', description: '', estimatedDuration: '' });
    } catch (error) {
      alert('Erreur lors de l\'envoi de la proposition');
    }
  };

  const getUrgencyBadge = (urgencyLevel: string) => {
    const config = URGENCY_LEVELS.find(level => level.value === urgencyLevel);
    if (!config) return null;
    
    return (
      <div className="flex items-center space-x-1">
        <AlertTriangle className={`h-4 w-4 ${
          urgencyLevel === 'critical' ? 'text-red-500' :
          urgencyLevel === 'high' ? 'text-orange-500' :
          urgencyLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
        }`} />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  const calculateDistance = (arrondissement: number) => {
    // Mock distance calculation - in real app, use geolocation
    return (Math.random() * 5 + 0.5).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Opportunités
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Trouvez de nouvelles missions près de chez vous
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Rechercher une urgence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Toutes les urgences</option>
            {URGENCY_LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Filter className="h-4 w-4 mr-2" />
            {availableEmergencies.length} opportunité{availableEmergencies.length > 1 ? 's' : ''}
          </div>
        </div>
      </Card>

      {/* Opportunities List */}
      <div className="space-y-4">
        {availableEmergencies.length === 0 ? (
          <Card className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune opportunité disponible
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || urgencyFilter !== 'all'
                ? 'Aucune urgence ne correspond à vos critères.'
                : 'Aucune nouvelle urgence dans vos zones d\'intervention pour le moment.'}
            </p>
          </Card>
        ) : (
          availableEmergencies.map(emergency => {
            const arrondissement = PARIS_ARRONDISSEMENTS.find(arr => arr.id === emergency.arrondissement);
            const distance = calculateDistance(emergency.arrondissement);
            
            return (
              <Card key={emergency.id} hover className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {emergency.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{arrondissement?.name} • {distance} km</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTimeAgo(emergency.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getUrgencyBadge(emergency.urgencyLevel)}
                        <Badge variant="info">{emergency.trade}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {emergency.description}
                    </p>
                    
                    {emergency.photos.length > 0 && (
                      <div className="flex space-x-2 mb-4">
                        {emergency.photos.slice(0, 3).map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ))}
                        {emergency.photos.length > 3 && (
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                            +{emergency.photos.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 font-semibold">
                        <Euro className="h-4 w-4" />
                        <span>Budget: jusqu'à {emergency.maxBudget}€</span>
                      </div>
                      
                      <Button
                        onClick={() => setSelectedEmergency(emergency.id)}
                        className="flex items-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Proposer mes services</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Proposal Modal */}
      <Modal
        isOpen={!!selectedEmergency}
        onClose={() => setSelectedEmergency(null)}
        title="Proposer mes services"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Conseils pour une proposition réussie
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Soyez précis sur votre intervention</li>
              <li>• Proposez un prix compétitif mais juste</li>
              <li>• Indiquez un délai réaliste</li>
              <li>• Mettez en avant votre expérience</li>
            </ul>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                label="Prix proposé (€) *"
                type="number"
                value={proposalData.price}
                onChange={(e) => setProposalData(prev => ({ ...prev, price: e.target.value }))}
                className="pl-10"
                placeholder="250"
                min="1"
              />
            </div>
            
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                label="Délai estimé *"
                value={proposalData.estimatedDuration}
                onChange={(e) => setProposalData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                className="pl-10"
                placeholder="2 heures"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description de votre intervention *
            </label>
            <textarea
              value={proposalData.description}
              onChange={(e) => setProposalData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Décrivez précisément comment vous comptez résoudre le problème, les matériaux nécessaires, et votre méthode d'intervention..."
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setSelectedEmergency(null)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleProposal}
              isLoading={isLoading}
            >
              Envoyer la proposition
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};