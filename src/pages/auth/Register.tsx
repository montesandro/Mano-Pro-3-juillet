// Registration page with role-specific fields
// Includes file upload for artisan documents

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Building, Lock, Upload } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { UserRole, PARIS_ARRONDISSEMENTS, TRADES } from '../../types';

export const Register: React.FC = () => {
  const location = useLocation();
  const selectedRole = location.state?.selectedRole as UserRole;
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    role: selectedRole || 'gestionnaire' as UserRole,
    arrondissements: [] as number[],
    trades: [] as string[]
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'arrondissements' | 'trades', value: number | string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.company || !formData.password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    if (formData.role === 'artisan' && formData.arrondissements.length === 0) {
      setError('Veuillez sélectionner au moins un arrondissement');
      return;
    }
    
    if (formData.role === 'artisan' && formData.trades.length === 0) {
      setError('Veuillez sélectionner au moins un corps de métier');
      return;
    }
    
    try {
      const success = await register(formData);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Erreur lors de l\'inscription. Veuillez vérifier vos informations et réessayer.');
      }
    } catch (error) {
      console.error('Registration submission error:', error);
      setError('Une erreur inattendue s\'est produite. Veuillez réessayer dans quelques instants.');
    }
  };

  if (!selectedRole) {
    navigate('/role-selection');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">MP</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Inscription {formData.role === 'gestionnaire' ? 'Gestionnaire' : 
                       formData.role === 'artisan' ? 'Artisan' : 'Admin'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Créez votre compte pour accéder à Mano-Pro
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <Input
                  label="Prénom *"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="pl-10"
                  placeholder="Jean"
                  required
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <Input
                  label="Nom *"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="pl-10"
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                placeholder="jean.dupont@email.com"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Phone className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <Input
                  label="Téléphone *"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10"
                  placeholder="01 23 45 67 89"
                  required
                />
              </div>
              <div className="relative">
                <Building className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <Input
                  label="Entreprise *"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="pl-10"
                  placeholder="Nom de votre entreprise"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <Input
                  label="Mot de passe *"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <Input
                  label="Confirmer le mot de passe *"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Artisan-specific fields */}
            {formData.role === 'artisan' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Zones d'intervention * (Arrondissements de Paris)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    {PARIS_ARRONDISSEMENTS.map((arr) => (
                      <label key={arr.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.arrondissements.includes(arr.id)}
                          onChange={() => handleArrayChange('arrondissements', arr.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{arr.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Corps de métier * (Spécialités)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {TRADES.map((trade) => (
                      <label key={trade} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.trades.includes(trade)}
                          onChange={() => handleArrayChange('trades', trade)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{trade}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Documents (Diplômes, Assurance professionnelle)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      id="documents"
                    />
                    <label htmlFor="documents" className="cursor-pointer">
                      <span className="text-blue-600 dark:text-blue-400 hover:underline">
                        Cliquez pour sélectionner des fichiers
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        PDF, JPG, PNG (max 10MB par fichier)
                      </p>
                    </label>
                    {documents.length > 0 && (
                      <div className="mt-3 text-left">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Fichiers sélectionnés :
                        </p>
                        {documents.map((file, index) => (
                          <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                            {file.name}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                required
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                J'accepte les{' '}
                <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                  politique de confidentialité
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Vous avez déjà un compte ?{' '}
              <Link
                to="/login"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};