// Payment dashboard for artisans and gestionnaires
// Shows payment history, pending payments, and invoices

import React, { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Euro,
  FileText,
  Calendar
} from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const PaymentDashboard: React.FC = () => {
  const { getPaymentsByUser, generateInvoice, isLoading } = useProjectStore();
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices'>('payments');
  
  const userPayments = user ? getPaymentsByUser(user.id, user.role) : [];
  
  const pendingPayments = userPayments.filter(p => p.status === 'pending');
  const completedPayments = userPayments.filter(p => p.status === 'completed');
  const totalEarnings = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">En attente</Badge>;
      case 'processing':
        return <Badge variant="info">En cours</Badge>;
      case 'completed':
        return <Badge variant="success">Payé</Badge>;
      case 'failed':
        return <Badge variant="danger">Échec</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleGenerateInvoice = async (paymentId: string) => {
    await generateInvoice(paymentId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {user?.role === 'artisan' ? 'Mes Paiements' : 'Factures & Paiements'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {user?.role === 'artisan' 
            ? 'Gérez vos revenus et demandes de paiement'
            : 'Suivez vos factures et paiements'}
        </p>
      </div>

      {/* Stats Cards */}
      {user?.role === 'artisan' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenus totaux</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalEarnings}€
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En attente</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {pendingAmount}€
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Paiements</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userPayments.length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Paiements
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Factures
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {userPayments.length === 0 ? (
            <Card className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun paiement
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.role === 'artisan' 
                  ? 'Vous n\'avez pas encore de demande de paiement.'
                  : 'Aucun paiement à traiter pour le moment.'}
              </p>
            </Card>
          ) : (
            userPayments.map(payment => (
              <Card key={payment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {payment.description}
                      </h3>
                      {getPaymentStatusBadge(payment.status)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Euro className="h-4 w-4" />
                        <span className="font-medium">{payment.amount}€</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(payment.createdAt)}</span>
                      </div>
                      {payment.processedAt && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Payé le {formatDate(payment.processedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {payment.status === 'completed' && (
                      <Button
                        onClick={() => handleGenerateInvoice(payment.id)}
                        size="sm"
                        variant="secondary"
                        isLoading={isLoading}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Facture
                      </Button>
                    )}
                    
                    {payment.invoiceUrl && (
                      <Button
                        onClick={() => window.open(payment.invoiceUrl, '_blank')}
                        size="sm"
                        variant="ghost"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <Card className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Gestion des factures
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Cette section sera disponible prochainement pour gérer toutes vos factures.
          </p>
        </Card>
      )}
    </div>
  );
};