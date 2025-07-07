// Emergency list page for gestionnaires
// Shows all emergencies with filtering and status management

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Search, MapPin, Clock, Euro, AlertTriangle, Eye } from 'lucide-react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PARIS_ARRONDISSEMENTS, TRADES, URGENCY_LEVELS } from '../../types';

export const EmergencyList: React.FC = () => {
  const { emergencies, getEmergenciesByUser, getProposalsByEmergency } = useEmergencyStore();
  const { user } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tradeFilter, setTradeFilter] = useState('all');
  
  const userEmergencies = user ? getEmergenciesByUser(user.id) : [];
  
  const filteredEmergencies = userEmergencies.filter(emergency => {
    const matchesSearch = emergency.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emergency.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emergency.status === statusFilter;
    const matchesTrade = tradeFilter === 'all' || emergency.trade === tradeFilter;
    
    return matchesSearch && matchesStatus && matchesTrade;
  });

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
        <span className={`text-sm ${config.color.replace('bg-', 'text-').replace('dark:bg-', 'dark:text-')}`}>
          {config.label}
        </span>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mes Urgences
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gérez vos demandes d'intervention et suivez leur avancement
          </p>
        </div>
        
        <Link to="/create-emergency">
          <Button className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Nouvelle Urgence</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Tous les statuts</option>
            <option value="open">Ouvert</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
            <option value="closed">Fermé</option>
          </select>
          
          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Tous les métiers</option>
            {TRADES.map(trade => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </select>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Filter className="h-4 w-4 mr-2" />
            {filteredEmergencies.length} résultat{filteredEmergencies.length > 1 ? 's' : ''}
          </div>
        </div>
      </Card>

      {/* Emergency List */}
      <div className="space-y-4">
        {filteredEmergencies.length === 0 ? (
          <Card className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune urgence trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' || tradeFilter !== 'all'
                ? 'Aucune urgence ne correspond à vos critères de recherche.'
                : 'Vous n\'avez pas encore créé d\'urgence.'}
            </p>
            {!searchTerm && statusFilter === 'all' && tradeFilter === 'all' && (
              <Link to="/create-emergency">
                <Button>Créer ma première urgence</Button>
              </Link>
            )}
          </Card>
        ) : (
          filteredEmergencies.map(emergency => {
            const proposals = getProposalsByEmergency(emergency.id);
            const arrondissement = PARIS_ARRONDISSEMENTS.find(arr => arr.id === emergency.arrondissement);
            
            return (
              <Card key={emergency.id} hover className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {emergency.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{arrondissement?.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTimeAgo(emergency.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Euro className="h-4 w-4" />
                            <span>Budget: {emergency.maxBudget}€</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getUrgencyBadge(emergency.urgencyLevel)}
                        {getStatusBadge(emergency.status)}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                      {emergency.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                          {emergency.trade}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {proposals.length} proposition{proposals.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <Link to={`/emergencies/${emergency.id}`}>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>Voir détails</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};