import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import store from '../store';
import router from '../router';

/**
 * Service pour gérer toutes les opérations liées à l'authentification et aux sessions
 */
export const authService = {
  /**
   * Initialise la surveillance de l'état d'authentification
   */
  initAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Utilisateur connecté
        console.log('User is authenticated:', user.uid);
        
        // Charger le profil utilisateur si ce n'est pas déjà fait
        if (!store.getters.userProfile || store.getters.userProfile.id !== user.uid) {
          try {
            await store.dispatch('fetchUserProfile', user);
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
          }
        }
      } else {
        // Utilisateur déconnecté
        console.log('User is signed out');
        
        // Nettoyer l'état
        store.commit('setUserProfile', null);
        store.commit('setHousehold', null);
        store.commit('setTasks', []);
        
        // Rediriger vers login si sur une page protégée
        const requiresAuth = router.currentRoute.value.meta.requiresAuth;
        if (requiresAuth) {
          router.push('/login');
        }
      }
    });
  },
  
  /**
   * Récupère l'utilisateur actuel
   * @returns {Object|null} L'utilisateur actuel ou null
   */
  getCurrentUser() {
    return auth.currentUser;
  },
  
  /**
   * Vérifie si un utilisateur est authentifié
   * @returns {boolean} True si authentifié
   */
  isAuthenticated() {
    return !!auth.currentUser;
  },
  
  /**
   * Connexion d'un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} Promise avec les données utilisateur
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Inscription d'un nouvel utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @param {string} name - Nom d'affichage
   * @returns {Promise<Object>} Promise avec les données utilisateur
   */
  async signup(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        points: 0,
        createdAt: serverTimestamp()
      });
      
      // Mettre à jour le profil Firebase Auth
      await updateProfile(userCredential.user, { displayName: name });
      
      return userCredential.user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  
  /**
   * Déconnexion de l'utilisateur
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  /**
   * Met à jour le profil utilisateur
   * @param {Object} userData - Données à mettre à jour
   * @returns {Promise<void>}
   */
  async updateProfile(userData) {
    try {
      if (!auth.currentUser) throw new Error('User not authenticated');
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, userData);
      
      // Mettre à jour le displayName Firebase Auth si nécessaire
      if (userData.name) {
        await updateProfile(auth.currentUser, { displayName: userData.name });
      }
      
      // Mettre à jour le state
      store.commit('setUserProfile', {
        ...store.getters.userProfile,
        ...userData
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
  
  /**
   * Récupère les données utilisateur depuis Firestore
   * @param {string} userId - ID utilisateur
   * @returns {Promise<Object>} Promise avec les données utilisateur
   */
  async getUserData(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return {
          id: userId,
          ...userDoc.data()
        };
      } else {
        throw new Error('User document not found');
      }
    } catch (error) {
      console.error('Get user data error:', error);
      throw error;
    }
  },
  
  /**
   * Vérifie et répare l'état d'authentification si nécessaire
   * Utile après des opérations qui pourraient perturber l'état
   * @returns {Promise<boolean>} Promise avec succès/échec
   */
  async verifyAuthState() {
    try {
      if (!auth.currentUser) return false;
      
      // Vérifier si le store a les données utilisateur
      if (!store.getters.userProfile) {
        console.log('Auth state repair: loading user profile');
        await store.dispatch('fetchUserProfile', auth.currentUser);
      }
      
      // Vérifier si le household est chargé si l'utilisateur en a un
      if (store.getters.userProfile?.householdId && !store.getters.household) {
        console.log('Auth state repair: loading household');
        await store.dispatch('fetchHousehold', store.getters.userProfile.householdId);
      }
      
      return true;
    } catch (error) {
      console.error('Auth state verification error:', error);
      return false;
    }
  }
};
