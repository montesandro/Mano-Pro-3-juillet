// Emergency creation page for gestionnaires
// Comprehensive form for creating new emergency requests

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, AlertTriangle, Euro, Camera } from 'lucide-react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { PARIS_ARRONDISSEMENTS, TRADES, URGENCY_LEVELS } from '../../types';

export const CreateEmergency: React.FC = () => {
  const navigate = useNavigate();
  const { createEmergency, isLoading } = useEmergencyStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    arrondissement: 0,
    trade: '',
    maxBudget: '',
    urgencyLevel: 'medium' as const
  });
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 5)); // Max 5 photos
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title || !formData.description || !formData.address || 
        !formData.arrondissement || !formData.trade || !formData.maxBudget) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (parseInt(formData.maxBudget) < 50) {
      setError('Le budget minimum est de 50€');
      return;
    }
    
    try {
      // Convert photos to URLs (in real app, upload to cloud storage)
      const photoUrls = photos.map(photo => URL.createObjectURL(photo));
      
      const emergencyId = await createEmergency({
        title: formData.title,
        description: formData.description,
        address: formData.address,
        arrondissement: formData.arrondissement,
        trade: formData.trade,
        maxBudget: parseInt(formData.maxBudget),
        urgencyLevel: formData.urgencyLevel,
        createdBy: user!.id,
        photos: photoUrls
      });
      
      navigate('/emergencies');
    } catch (err) {
      setError('Erreur lors de la création de l\'urgence');
    }
  };

  const urgencyLevelConfig = URGENCY_LEVELS.find(level => level.value === formData.urgencyLevel);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Nouvelle Urgence
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Décrivez votre urgence pour recevoir des propositions d'artisans qualifiés
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Title and Description */}
          <div className="space-y-4">
            <Input
              label="Titre de l'urgence *"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ex: Fuite d'eau dans la cuisine"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description détaillée *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Décrivez précisément le problème, sa localisation, et tout détail utile pour l'artisan..."
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
              <Input
                label="Adresse complète *"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="pl-10"
                placeholder="15 Rue de Rivoli, 75001 Paris"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Arrondissement *
              </label>
              <select
                value={formData.arrondissement}
                onChange={(e) => handleInputChange('arrondissement', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                required
              >
                <option value={0}>Sélectionner un arrondissement</option>
                {PARIS_ARRONDISSEMENTS.map(arr => (
                  <option key={arr.id} value={arr.id}>{arr.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Trade and Budget */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Corps de métier *
              </label>
              <select
                value={formData.trade}
                onChange={(e) => handleInputChange('trade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="">Sélectionner un métier</option>
                {TRADES.map(trade => (
                  <option key={trade} value={trade}>{trade}</option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <Euro className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
              <Input
                label="Budget maximum *"
                type="number"
                value={formData.maxBudget}
                onChange={(e) => handleInputChange('maxBudget', e.target.value)}
                className="pl-10"
                placeholder="300"
                min="50"
                required
              />
              <span className="absolute right-3 top-9 text-gray-400">€</span>
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Niveau d'urgence *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {URGENCY_LEVELS.map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleInputChange('urgencyLevel', level.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.urgencyLevel === level.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className={`h-4 w-4 ${
                      level.value === 'critical' ? 'text-red-500' :
                      level.value === 'high' ? 'text-orange-500' :
                      level.value === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {level.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photos (optionnel)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="text-center">
                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photos"
                />
                <label htmlFor="photos" className="cursor-pointer">
                  <span className="text-blue-600 dark:text-blue-400 hover:underline">
                    Ajouter des photos
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    JPG, PNG (max 5 photos, 10MB chacune)
                  </p>
                </label>
              </div>
              
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/emergencies')}
            >
              Annuler
            </Button>
            
            <Button
              type="submit"
              isLoading={isLoading}
              className="px-8"
            >
              Publier l'urgence
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};