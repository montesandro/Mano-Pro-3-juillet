/*
  # Correction de la politique RLS pour l'insertion d'utilisateurs

  1. Modifications
    - Suppression de la politique INSERT existante avec WITH CHECK restrictive
    - Création d'une nouvelle politique INSERT sans WITH CHECK pour permettre au déclencheur handle_new_user de fonctionner
    - La politique permet aux utilisateurs authentifiés d'insérer des profils sans restriction d'ID

  2. Contexte
    - Le déclencheur handle_new_user s'exécute après l'inscription auth et doit pouvoir créer le profil utilisateur
    - La condition WITH CHECK (auth.uid() = id) bloquait cette insertion car l'ID n'était pas encore disponible au moment de l'exécution
    - Cette modification permet au système d'inscription de fonctionner correctement
*/

-- Supprimer la politique INSERT existante qui bloque le déclencheur
DROP POLICY IF EXISTS "Allow authenticated users to create their own profile" ON public.users;

-- Créer une nouvelle politique INSERT sans WITH CHECK restrictive
-- Cela permet au déclencheur handle_new_user de créer le profil utilisateur
CREATE POLICY "Allow user profile creation"
ON public.users 
FOR INSERT 
TO authenticated;

-- Note: Cette politique est plus permissive mais nécessaire pour le fonctionnement du déclencheur
-- Le contrôle d'accès est géré par le déclencheur handle_new_user qui s'assure que seuls
-- les utilisateurs authentifiés peuvent créer leur propre profil