// Role selection page - first step of registration
// Allows users to choose between Gestionnaire, Artisan, or Admin roles

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Wrench, Shield } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { UserRole } from '../../types';

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    navigate('/register', { state: { selectedRole: role } });
  };

  const roles = [
    {
      id: 'gestionnaire' as UserRole,
      title: 'Je suis un Gestionnaire',
      description: 'Gérez les urgences de votre copropriété et trouvez des artisans qualifiés',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      features: [
        'Publier des urgences',
        'Recevoir des propositions',
        'Gérer les interventions',
        'Suivre les factures'
      ]
    },
    {
      id: 'artisan' as UserRole,
      title: 'Je suis un Artisan',
      description: 'Trouvez des missions près de chez vous et développez votre activité',
      icon: Wrench,
      color: 'from-orange-500 to-orange-600',
      features: [
        'Recevoir des alertes',
        'Proposer vos services',
        'Gérer vos projets',
        'Facturer vos prestations'
      ]
    },
    {
      id: 'admin' as UserRole,
      title: 'Administration',
      description: 'Accès administrateur pour la gestion de la plateforme',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      features: [
        'Gérer les utilisateurs',
        'Valider les certifications',
        'Superviser les projets',
        'Analyser les données'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">MP</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Bienvenue sur Mano-Pro
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            La plateforme qui connecte les gestionnaires de copropriété avec des artisans qualifiés à Paris
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                className="cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl border-2 hover:border-blue-200 dark:hover:border-blue-700"
                onClick={() => handleRoleSelect(role.id)}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {role.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {role.description}
                  </p>
                  
                  <ul className="space-y-2 text-left">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className={`mt-6 px-6 py-3 bg-gradient-to-r ${role.color} text-white rounded-lg font-medium`}>
                    Choisir ce rôle
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 dark:text-gray-400">
            Vous avez déjà un compte ?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};