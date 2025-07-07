// Project list page for both gestionnaires and artisans
// Shows all projects with filtering and status management

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, MapPin, Euro, Clock, Eye, Star } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const ProjectList: React.FC = () => {
  const { getProjectsByUser } = useProjectStore();
  const { user } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const userProjects = user ? getProjectsByUser(user.id, user.role) : [];
  
  const filteredProjects = userProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const formatTimeAgo = (date?: Date) => {
    if (!date) return '';
    
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mes Projets
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {user?.role === 'gestionnaire' 
            ? 'Suivez l\'avancement de vos projets en cours'
            : 'Gérez vos interventions et projets'}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un projet..."
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
            <option value="accepted">Accepté</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
            <option value="paid">Payé</option>
          </select>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Filter className="h-4 w-4 mr-2" />
            {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''}
          </div>
        </div>
      </Card>

      {/* Project List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun projet trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all'
                ? 'Aucun projet ne correspond à vos critères de recherche.'
                : 'Vous n\'avez pas encore de projet en cours.'}
            </p>
          </Card>
        ) : (
          filteredProjects.map(project => (
            <Card key={project.id} hover className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {project.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{project.address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Euro className="h-4 w-4" />
                          <span>{project.price}€</span>
                        </div>
                        {project.startDate && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTimeAgo(project.startDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {user?.role === 'gestionnaire' ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 dark:text-orange-300 text-sm font-medium">
                              {project.artisan.firstName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {project.artisan.firstName} {project.artisan.lastName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {project.artisan.company}
                            </p>
                          </div>
                          {project.artisan.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {project.artisan.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                              {project.gestionnaire.firstName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {project.gestionnaire.firstName} {project.gestionnaire.lastName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {project.gestionnaire.company}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Link to={`/projects/${project.id}`}>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>Voir détails</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};