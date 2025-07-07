/*
  # Ajouter politique RLS pour l'insertion d'utilisateurs

  1. Politique de sécurité
    - Permet aux utilisateurs authentifiés de créer leur propre profil
    - Vérifie que l'ID utilisateur correspond à l'ID d'authentification
    - Résout l'erreur "Database error saving new user" lors de l'inscription

  2. Sécurité
    - Utilise auth.uid() pour vérifier l'identité
    - Empêche la création de profils pour d'autres utilisateurs
    - Maintient l'intégrité des données utilisateur
*/

-- Ajouter la politique RLS pour permettre aux utilisateurs authentifiés de créer leur propre profil
CREATE POLICY "Allow authenticated users to create their own profile"
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);