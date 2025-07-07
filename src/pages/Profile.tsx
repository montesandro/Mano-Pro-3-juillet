// Profile page for gestionnaires and artisans
// Role-based profile management with editing capabilities

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Wrench, 
  Star,
  Camera,
  Save,
  Edit,
  CreditCard,
  Shield,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { PARIS_ARRONDISSEMENTS, TRADES } from '../types';

export const Profile: React.FC = () => {
  const { user, updateUser, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    arrondissements: user?.arrondissements || [],
    trades: user?.trades || [],
    bankDetails: {
      iban: user?.bankDetails?.iban || '',
      bic: user?.bankDetails?.bic || '',
      accountHolder: user?.bankDetails?.accountHolder || ''
    }
  });

  if (!user) return null;

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('bankDetails.')) {
      const bankField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bankField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayChange = (field: 'arrondissements' | 'trades', value: number | string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSave = async () => {
    const success = await updateUser(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      company: user.company,
      arrondissements: user.arrondissements || [],
      trades: user.trades || [],
      bankDetails: {
        iban: user.bankDetails?.iban || '',
        bic: user.bankDetails?.bic || '',
        accountHolder: user.bankDetails?.accountHolder || ''
      }
    });
    setIsEditing(false);
  };

  const handleDocumentUpload = () => {
    // In real app, upload documents to cloud storage
    console.log('Uploading documents:', documents);
    setDocuments([]);
    setShowDocumentModal(false);
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case 'gestionnaire': return Building;
      case 'artisan': return Wrench;
      case 'admin': return Shield;
      default: return User;
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-700 dark:to-teal-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className={`w-20 h-20 bg-gradient-to-r ${getRoleColor()} rounded-2xl flex items-center justify-center bg-white/20`}>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <RoleIcon className="h-10 w-10 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-blue-100 text-lg capitalize">
                {user.role}
              </p>
              <p className="text-blue-100">
                {user.company}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                {user.isVerified ? (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-green-300">Vérifié</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm text-yellow-300">Non vérifié</span>
                  </div>
                )}
                {user.role === 'artisan' && (
                  <>
                    {user.isCertified ? (
                      <div className="flex items-center space-x-1">
                        <Shield className="h-4 w-4 text-green-300" />
                        <span className="text-sm text-green-300">Certifié</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <Shield className="h-4 w-4 text-yellow-300" />
                        <span className="text-sm text-yellow-300">En attente de certification</span>
                      </div>
                    )}
                    {user.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-300 fill-current" />
                        <span className="text-sm text-yellow-300">{user.rating}/5</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Camera className="h-4 w-4 mr-2" />
              Changer photo
            </Button>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  isLoading={isLoading}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Informations personnelles
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                <Input
                  label="Prénom"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
              
              <div className="relative">
                <User className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                <Input
                  label="Nom"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="relative">
                <Mail className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
              
              <div className="relative">
                <Phone className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                <Input
                  label="Téléphone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="relative">
                <Building className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                <Input
                  label="Entreprise"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </Card>

          {/* Artisan-specific sections */}
          {user.role === 'artisan' && (
            <>
              {/* Service Areas */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Zones d'intervention
                  </h2>
                  <Badge variant="info">
                    {formData.arrondissements.length} zone{formData.arrondissements.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Conseil :</strong> Sélectionnez les arrondissements où vous souhaitez intervenir. 
                    Plus vous couvrez de zones, plus vous recevrez d'opportunités !
                  </p>
                </div>
                
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    {PARIS_ARRONDISSEMENTS.map((arr) => (
                      <label key={arr.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.arrondissements.includes(arr.id)}
                          onChange={() => handleArrayChange('arrondissements', arr.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{arr.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>
                    {user.arrondissements && user.arrondissements.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {user.arrondissements.map(arrId => {
                          const arr = PARIS_ARRONDISSEMENTS.find(a => a.id === arrId);
                          return arr ? (
                            <div key={arrId} className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{arr.name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">Aucune zone d'intervention définie</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Cliquez sur "Modifier" pour ajouter vos zones
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Trades */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Wrench className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                    Corps de métier
                  </h2>
                  <Badge variant="warning">
                    {formData.trades.length} spécialité{formData.trades.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    <strong>Important :</strong> Sélectionnez uniquement les métiers que vous maîtrisez parfaitement. 
                    Votre réputation dépend de la qualité de vos interventions !
                  </p>
                </div>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TRADES.map((trade) => (
                      <label key={trade} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.trades.includes(trade)}
                          onChange={() => handleArrayChange('trades', trade)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2"
                        />
                        <div className="flex items-center space-x-2">
                          <Wrench className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{trade}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>
                    {user.trades && user.trades.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {user.trades.map(trade => (
                          <div key={trade} className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-3 flex-shrink-0" />
                            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">{trade}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <Wrench className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">Aucun corps de métier défini</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Cliquez sur "Modifier" pour ajouter vos spécialités
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Bank Details */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Informations bancaires
                  </h2>
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="space-y-4">
                  <Input
                    label="IBAN"
                    value={formData.bankDetails.iban}
                    onChange={(e) => handleInputChange('bankDetails.iban', e.target.value)}
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                    disabled={!isEditing}
                  />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="BIC/SWIFT"
                      value={formData.bankDetails.bic}
                      onChange={(e) => handleInputChange('bankDetails.bic', e.target.value)}
                      placeholder="BNPAFRPP"
                      disabled={!isEditing}
                    />
                    
                    <Input
                      label="Titulaire du compte"
                      value={formData.bankDetails.accountHolder}
                      onChange={(e) => handleInputChange('bankDetails.accountHolder', e.target.value)}
                      placeholder="Nom du titulaire"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </Card>

              {/* Documents */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Documents et certifications
                  </h2>
                  <Button
                    onClick={() => setShowDocumentModal(true)}
                    size="sm"
                    variant="secondary"
                  >
                    Ajouter document
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {/* Mock documents */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Assurance professionnelle
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Valide jusqu'au 31/12/2024
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Validé</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Qualification RGE
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Électricité générale
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Validé</Badge>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Right Column - Stats & Activity */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Statut du compte
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Email vérifié</span>
                {user.isVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
              </div>
              
              {user.role === 'artisan' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Certifié</span>
                  {user.isCertified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Profil complet</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </Card>

          {/* Stats for Artisan */}
          {user.role === 'artisan' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Statistiques
              </h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {user.rating || '4.8'}
                  </div>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= (user.rating || 4.8)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Note moyenne
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.completedProjects || 12}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Projets terminés
                    </p>
                  </div>
                  
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      98%
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Taux de satisfaction
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions rapides
            </h3>
            
            <div className="space-y-2">
              {user.role === 'gestionnaire' && (
                <Button variant="ghost" className="w-full justify-start">
                  Créer une urgence
                </Button>
              )}
              
              {user.role === 'artisan' && (
                <>
                  <Button variant="ghost" className="w-full justify-start">
                    Voir les opportunités
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Mes projets en cours
                  </Button>
                </>
              )}
              
              <Button variant="ghost" className="w-full justify-start">
                Paramètres de notification
              </Button>
              
              <Button variant="ghost" className="w-full justify-start">
                Centre d'aide
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Document Upload Modal */}
      <Modal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        title="Ajouter un document"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de document
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <option>Assurance professionnelle</option>
              <option>Certification RGE</option>
              <option>Diplôme professionnel</option>
              <option>Attestation de formation</option>
              <option>Autre</option>
            </select>
          </div>
          
          <div>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => e.target.files && setDocuments(Array.from(e.target.files))}
              className="hidden"
              id="document-upload"
            />
            <label
              htmlFor="document-upload"
              className="block w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500"
            >
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cliquez pour sélectionner des fichiers
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                PDF, JPG, PNG (max 10MB par fichier)
              </p>
            </label>
          </div>
          
          {documents.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fichiers sélectionnés :
              </p>
              {documents.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                  <button
                    onClick={() => setDocuments(prev => prev.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowDocumentModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleDocumentUpload} disabled={documents.length === 0}>
              Télécharger
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};