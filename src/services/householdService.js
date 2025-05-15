import { db, auth } from '../firebase';
import { 
  collection, doc, getDoc, getDocs, 
  query, where, addDoc, updateDoc, 
  serverTimestamp
} from 'firebase/firestore';
import store from '../store';
import { notificationService } from './notificationService';

export const householdService = {
  /**
   * Crée un nouveau foyer
   * @param {string} name Nom du foyer
   * @returns {Promise<Object>} Données du nouveau foyer
   */
  async createHousehold(name) {
    try {
      if (!auth.currentUser) throw new Error('User is not authenticated');
      
      // Créer le foyer
      const householdData = {
        name,
        adminId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      };
      
      const householdRef = await addDoc(collection(db, 'households'), householdData);
      
      // Mettre à jour l'utilisateur avec l'ID du foyer
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        householdId: householdRef.id
      });
      
      // Mettre à jour le state
      const household = {
        id: householdRef.id,
        ...householdData
      };
      
      store.commit('setHousehold', household);
      store.commit('setUserProfile', {
        ...store.getters.userProfile,
        householdId: householdRef.id
      });
      
      return household;
    } catch (error) {
      console.error('Error creating household:', error);
      notificationService.error('Failed to create household: ' + error.message);
      throw error;
    }
  },
  
  /**
   * Rejoint un foyer existant
   * @param {string} inviteCode Code d'invitation (ID du foyer)
   * @returns {Promise<Object>} Données du foyer rejoint
   */
  async joinHousehold(inviteCode) {
    try {
      if (!auth.currentUser) throw new Error('User is not authenticated');
      
      // Vérifier que le foyer existe
      const householdRef = doc(db, 'households', inviteCode);
      const householdSnap = await getDoc(householdRef);
      
      if (!householdSnap.exists()) {
        throw new Error('Invalid household code');
      }
      
      const householdData = householdSnap.data();
      
      // Mettre à jour l'utilisateur avec l'ID du foyer
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        householdId: inviteCode
      });
      
      // Mettre à jour le state
      const household = {
        id: inviteCode,
        ...householdData
      };
      
      store.commit('setHousehold', household);
      store.commit('setUserProfile', {
        ...store.getters.userProfile,
        householdId: inviteCode
      });
      
      // Charger les tâches du foyer
      await store.dispatch('fetchTasks');
      
      return household;
    } catch (error) {
      console.error('Error joining household:', error);
      notificationService.error('Failed to join household: ' + error.message);
      throw error;
    }
  },
  
  /**
   * Charge les membres d'un foyer
   * @param {string} householdId ID du foyer
   * @returns {Promise<Array>} Liste des membres du foyer
   */
  async getHouseholdMembers(householdId) {
    try {
      if (!householdId) throw new Error('Household ID is required');
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('householdId', '==', householdId));
      const querySnapshot = await getDocs(q);
      
      const members = [];
      querySnapshot.forEach(doc => {
        members.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return members;
    } catch (error) {
      console.error('Error fetching household members:', error);
      throw error;
    }
  }
};
