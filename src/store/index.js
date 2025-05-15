import { createStore } from 'vuex'
import { db, auth } from '../firebase'
import { 
  doc, getDoc, collection, 
  query, where, getDocs, updateDoc, arrayUnion, setDoc, addDoc, serverTimestamp 
} from 'firebase/firestore'
import { 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile 
} from 'firebase/auth'
import { authService } from '../services/authService';

export default createStore({
  state: {
    userProfile: null,
    household: null,
    tasks: [],
    badges: []
  },
  getters: {
    userProfile: state => state.userProfile,
    household: state => state.household,
    tasks: state => state.tasks,
    badges: state => state.badges
  },
  mutations: {
    setUserProfile(state, profile) {
      state.userProfile = profile
    },
    setHousehold(state, household) {
      state.household = household
    },
    setTasks(state, tasks) {
      state.tasks = tasks
    },
    setBadges(state, badges) {
      state.badges = badges
    }
  },
  actions: {
    async signup({ dispatch }, { email, password, name }) {
      try {
        // Créer l'utilisateur dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Créer un document pour l'utilisateur dans Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: name,
          email: email,
          points: 0,
          createdAt: serverTimestamp()
        });
        
        // Mettre à jour le profil dans Firebase Auth
        await updateProfile(userCredential.user, {
          displayName: name
        });
        
        // Récupérer le profil utilisateur
        dispatch('fetchUserProfile', userCredential.user);
      } catch (error) {
        console.error('Error signing up:', error);
        throw error;
      }
    },
    
    async login({ dispatch }, { email, password }) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        dispatch('fetchUserProfile', userCredential.user);
      } catch (error) {
        console.error('Error logging in:', error);
        throw error;
      }
    },
    
    // Version fusionnée de fetchUserProfile - suppression de dispatch des paramètres car non utilisé
    async fetchUserProfile({ commit }, user) {
      try {
        // D'abord effacer les données de foyer existantes pour éviter les problèmes d'héritage
        commit('setHousehold', null);
        
        // Récupérer le document utilisateur
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          // Document utilisateur existe
          const userData = userDoc.data();
          
          // Formater correctement les timestamps avant de les ajouter au state
          const formattedData = {
            ...userData,
            id: user.uid
          };
          
          // Assurer que les timestamps sont bien gérés
          if (formattedData.createdAt && typeof formattedData.createdAt.toDate === 'function') {
            // Garder l'objet Firestore Timestamp tel quel pour éviter les problèmes de conversion
            // Ne pas faire formattedData.createdAt = formattedData.createdAt.toDate()
          }
          
          commit('setUserProfile', formattedData);
          
          // Si l'utilisateur a un householdId, récupérer les informations du household
          if (userData.householdId) {
            console.log(`User has householdId: ${userData.householdId}`);
            const householdRef = doc(db, 'households', userData.householdId);
            const householdSnap = await getDoc(householdRef);
            
            if (householdSnap.exists()) {
              const householdData = householdSnap.data();
              
              // Formater correctement les timestamps avant de les ajouter au state
              const formattedHousehold = { 
                id: householdSnap.id,
                ...householdData
              };
              
              // Assurer que les timestamps sont bien gérés
              if (formattedHousehold.createdAt && typeof formattedHousehold.createdAt.toDate === 'function') {
                // Garder l'objet Firestore Timestamp tel quel
              }
              
              commit('setHousehold', formattedHousehold);
              console.log("Set household data:", formattedHousehold);
            } else {
              console.log(`Household with ID ${userData.householdId} not found`);
              // Si le foyer n'existe pas, effacer le householdId de l'utilisateur
              await updateDoc(userRef, { householdId: null });
            }
          } else {
            console.log("User doesn't have a household");
          }
        } else {
          // Le document n'existe pas, le créer
          console.log('User document does not exist. Creating it now...');
          
          // Créer un profil utilisateur par défaut
          const defaultProfile = {
            name: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
            email: user.email || '',
            points: 0,
            createdAt: serverTimestamp()
          };
          
          // Sauvegarder dans Firestore
          await setDoc(doc(db, 'users', user.uid), defaultProfile);
          
          // Mettre à jour le state
          commit('setUserProfile', {
            ...defaultProfile,
            id: user.uid
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        // Ne pas propager l'erreur mais retourner un profil vide pour éviter de bloquer l'application
        commit('setUserProfile', { id: user.uid, name: 'Guest' });
      }
    },
    
    async fetchTasks({ commit, state }) {
      if (!state.household) return
      
      // Make sure household.id exists before querying
      if (!state.household.id) {
        console.warn('Household object exists but has no ID property')
        return
      }
      
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('householdId', '==', state.household.id)
        )
        const taskSnap = await getDocs(tasksQuery)
        const tasks = []
        
        taskSnap.forEach(doc => {
          tasks.push({ id: doc.id, ...doc.data() })
        })
        
        commit('setTasks', tasks)
      } catch (error) {
        console.error('Error fetching tasks:', error)
        commit('setTasks', [])
      }
    },
    async completeTask({ commit, state, dispatch }, { taskId, userId }) {
      try {
        // Vérifier que l'utilisateur est authentifié
        if (!authService.isAuthenticated()) {
          throw new Error('User not authenticated');
        }
        
        // Reference to the task
        const taskRef = doc(db, 'tasks', taskId);
        const taskSnap = await getDoc(taskRef);
        
        if (!taskSnap.exists()) {
          console.error('Task not found:', taskId);
          return false;
        }
        
        const task = taskSnap.data();
        
        // Update the task as completed
        await updateDoc(taskRef, {
          completedBy: userId,
          completedAt: serverTimestamp()
        });
        
        // Get current user points
        const currentPoints = state.userProfile?.points || 0;
        const newPoints = currentPoints + task.pointsValue;
        
        // Add points to the user
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          points: newPoints
        });
        
        // Update local state
        commit('setUserProfile', {
          ...state.userProfile,
          points: newPoints
        });
        
        // Check for badges
        const badgesQuery = query(
          collection(db, 'badges'),
          where('type', '==', task.category)
        );
        const badgesSnap = await getDocs(badgesQuery);
        
        for (const badgeDoc of badgesSnap.docs) {
          const badge = badgeDoc.data();
          const userTasksQuery = query(
            collection(db, 'tasks'),
            where('completedBy', '==', userId),
            where('category', '==', task.category)
          );
          const userTasksSnap = await getDocs(userTasksQuery);
          
          if (userTasksSnap.size >= badge.requirement) {
            // Award badge
            await updateDoc(userRef, {
              badges: arrayUnion(badgeDoc.id)
            });
          }
        }
        
        // Reload tasks to reflect changes
        dispatch('fetchTasks');
        
        // Vérifier l'état d'authentification après toutes ces opérations
        await authService.verifyAuthState();
        
        return true;
      } catch (error) {
        console.error('Error completing task:', error);
        
        // Tenter de récupérer l'état d'authentification si possible
        authService.verifyAuthState().catch(err => {
          console.error('Failed to verify auth state after error:', err);
        });
        
        throw error;
      }
    },
    async createHousehold({ commit, state }, householdName) {
      try {
        // Vérifier que l'utilisateur est connecté
        if (!auth.currentUser) throw new Error('User is not authenticated');
        
        // Créer le document de foyer
        const householdData = {
          name: householdName,
          adminId: auth.currentUser.uid,
          createdAt: serverTimestamp()
        };
        
        const householdRef = await addDoc(collection(db, 'households'), householdData);
        
        // Mettre à jour le document de l'utilisateur
        const userRef = doc(db, 'users', auth.currentUser.uid);
        
        // Vérifier si le document utilisateur existe
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // Si le document n'existe pas, le créer d'abord
          await setDoc(userRef, {
            name: state.userProfile.name || auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
            email: auth.currentUser.email,
            points: 0,
            createdAt: serverTimestamp()
          });
        }
        
        // Puis mettre à jour avec l'ID du foyer
        await updateDoc(userRef, {
          householdId: householdRef.id
        });
        
        // Mettre à jour le state
        const household = {
          id: householdRef.id,
          ...householdData
        };
        
        commit('setHousehold', household);
        
        // Mettre à jour le profil utilisateur
        commit('setUserProfile', {
          ...state.userProfile,
          householdId: householdRef.id
        });
        
        return household;
      } catch (error) {
        console.error('Error creating household:', error);
        throw error;
      }
    },
    async updateProfile({ commit, state }, updatedData) {
      try {
        // Vérifier que l'utilisateur est connecté
        if (!auth.currentUser) throw new Error('User is not authenticated');
        
        const userRef = doc(db, 'users', auth.currentUser.uid);
        
        // Vérifier si le document utilisateur existe
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // Si le document n'existe pas, le créer d'abord
          await setDoc(userRef, {
            name: updatedData.name || auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
            email: auth.currentUser.email,
            points: 0,
            createdAt: serverTimestamp()
          });
        } else {
          // Sinon, mettre à jour le document
          await updateDoc(userRef, updatedData);
        }
        
        // Mettre à jour aussi le displayName dans Firebase Auth si nécessaire
        if (updatedData.name) {
          await updateProfile(auth.currentUser, {
            displayName: updatedData.name
          });
        }
        
        // Mettre à jour le state
        commit('setUserProfile', {
          ...state.userProfile,
          ...updatedData
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    },
    async fetchHouseholdMembers({ state }) {
      if (!state.household?.id) {
        console.warn('No household ID available');
        return [];
      }
      
      try {
        console.log('Fetching members for household:', state.household.id);
        const usersQuery = query(
          collection(db, 'users'),
          where('householdId', '==', state.household.id)
        );
        
        const snapshot = await getDocs(usersQuery);
        const members = [];
        
        snapshot.forEach(doc => {
          members.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log('Found household members:', members);
        return members;
      } catch (error) {
        console.error('Error fetching household members:', error);
        return [];
      }
    },
    async joinHousehold({ commit, state, dispatch }, inviteCode) {
      try {
        // Vérifier que l'utilisateur est connecté
        if (!auth.currentUser) throw new Error('User is not authenticated');
        
        // Vérifier que le household existe
        // Utiliser directement getDoc avec doc() au lieu de query avec documentId()
        const householdRef = doc(db, 'households', inviteCode);
        const householdSnap = await getDoc(householdRef);
        
        if (!householdSnap.exists()) {
          throw new Error('Invalid household code');
        }
        
        const householdData = householdSnap.data();
        
        // Mettre à jour le document utilisateur avec l'ID du household
        const userRef = doc(db, 'users', auth.currentUser.uid);
        
        await updateDoc(userRef, {
          householdId: inviteCode
        });
        
        // Mettre à jour le state avec le household
        const household = {
          id: inviteCode,
          ...householdData
        };
        
        commit('setHousehold', household);
        
        // Mettre à jour le profil utilisateur dans le state
        commit('setUserProfile', {
          ...state.userProfile,
          householdId: inviteCode
        });
        
        // Charger les tâches du household
        dispatch('fetchTasks');
        
        return household;
      } catch (error) {
        console.error('Error joining household:', error);
        throw error;
      }
    }
  }
})
