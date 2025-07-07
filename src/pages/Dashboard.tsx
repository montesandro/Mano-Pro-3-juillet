// Main dashboard with role-based content
// Shows different interfaces for Gestionnaire, Artisan, and Admin

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Building2, 
  Wrench, 
  Shield, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users,
  FileText,
  Euro
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  const getRoleIcon = () => {
    switch (user.role) {
      case 'gestionnaire': return Building2;
      case 'artisan': return Wrench;
      case 'admin': return Shield;
      default: return Building2;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'gestionnaire': return 'from-blue-500 to-blue-600';
      case 'artisan': return 'from-orange-500 to-orange-600';
      case 'admin': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-700 dark:to-teal-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 bg-gradient-to-r ${getRoleColor()} rounded-2xl flex items-center justify-center bg-white/20`}>
              <RoleIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Bonjour, {user.firstName} !
              </h1>
              <p className="text-blue-100 text-lg">
                {user.role === 'gestionnaire' && 'Gérez vos urgences de copropriété'}
                {user.role === 'artisan' && 'Trouvez de nouvelles opportunités'}
                {user.role === 'admin' && 'Supervisez la plateforme Mano-Pro'}
              </p>
            </div>
          </div>
          {user.role === 'gestionnaire' && (
            <Link to="/create-emergency">
              <Button variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Plus className="h-5 w-5 mr-2" />
                Nouvelle Urgence
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Role-specific content */}
      {user.role === 'gestionnaire' && <GestionnaireContent />}
      {user.role === 'artisan' && <ArtisanContent />}
      {user.role === 'admin' && <AdminContent />}
    </div>
  );
};

const GestionnaireContent: React.FC = () => {
  const stats = [
    { label: 'Urgences ouvertes', value: '3', icon: AlertTriangle, color: 'text-orange-600' },
    { label: 'En cours', value: '2', icon: Clock, color: 'text-blue-600' },
    { label: 'Terminées', value: '12', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Budget mensuel', value: '€2,450', icon: Euro, color: 'text-purple-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Emergencies */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Urgences récentes</h2>
          <Button variant="ghost" size="sm">Voir tout</Button>
        </div>
        <div className="space-y-4">
          {[
            { title: 'Fuite d\'eau - 15e arrondissement', status: 'En cours', date: '2 heures', proposals: 3 },
            { title: 'Panne électrique - 8e arrondissement', status: 'Ouvert', date: '1 jour', proposals: 1 },
            { title: 'Serrure cassée - 11e arrondissement', status: 'Terminé', date: '3 jours', proposals: 5 }
          ].map((emergency, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{emergency.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Il y a {emergency.date}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {emergency.proposals} proposition{emergency.proposals > 1 ? 's' : ''}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  emergency.status === 'En cours' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  emergency.status === 'Ouvert' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {emergency.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const ArtisanContent: React.FC = () => {
  const stats = [
    { label: 'Projets en cours', value: '2', icon: Clock, color: 'text-blue-600' },
    { label: 'Nouvelles opportunités', value: '5', icon: AlertTriangle, color: 'text-orange-600' },
    { label: 'CA ce mois', value: '€1,850', icon: Euro, color: 'text-green-600' },
    { label: 'Note moyenne', value: '4.8', icon: TrendingUp, color: 'text-purple-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Opportunities */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nouvelles opportunités</h2>
          <Button variant="ghost" size="sm">Voir tout</Button>
        </div>
        <div className="space-y-4">
          {[
            { title: 'Réparation plomberie - 12e', budget: '€150-200', distance: '2.3 km', time: '30 min' },
            { title: 'Installation électrique - 7e', budget: '€300-400', distance: '4.1 km', time: '1h' },
            { title: 'Dépannage serrurerie - 15e', budget: '€80-120', distance: '1.8 km', time: '45 min' }
          ].map((opportunity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{opportunity.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {opportunity.distance} • Durée estimée: {opportunity.time}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {opportunity.budget}
                </span>
                <Button size="sm">Proposer</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const AdminContent: React.FC = () => {
  const stats = [
    { label: 'Utilisateurs actifs', value: '247', icon: Users, color: 'text-blue-600' },
    { label: 'Projets ce mois', value: '89', icon: FileText, color: 'text-green-600' },
    { label: 'CA plateforme', value: '€12,450', icon: Euro, color: 'text-purple-600' },
    { label: 'Certifications en attente', value: '8', icon: AlertTriangle, color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pending Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Certifications en attente</h2>
          <div className="space-y-3">
            {[
              { name: 'Pierre Martin', trade: 'Plomberie', date: '2 jours' },
              { name: 'Sophie Dubois', trade: 'Électricité', date: '1 jour' },
              { name: 'Marc Leroy', trade: 'Serrurerie', date: '3 heures' }
            ].map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{cert.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{cert.trade} • Il y a {cert.date}</p>
                </div>
                <Button size="sm">Examiner</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Activité récente</h2>
          <div className="space-y-3">
            {[
              { action: 'Nouveau gestionnaire inscrit', time: '5 min' },
              { action: 'Projet terminé - 11e arr.', time: '1h' },
              { action: 'Paiement validé - €250', time: '2h' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-900 dark:text-white">{activity.action}</p>
                <span className="text-sm text-gray-600 dark:text-gray-400">Il y a {activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};