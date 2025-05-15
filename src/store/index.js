import { createStore } from 'vuex'
import { db } from '../firebase'
import { 
  doc, getDoc, collection, 
  query, where, getDocs, updateDoc, arrayUnion 
} from 'firebase/firestore'

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
    async fetchUserProfile({ commit }, userId) {
      try {
        // First clear any existing household data to prevent inheritance issues
        commit('setHousehold', null)
        
        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          const userData = userSnap.data()
          commit('setUserProfile', userData)
          
          // Fetch household only if the user actually has one
          if (userData.householdId) {
            console.log(`User has householdId: ${userData.householdId}`)
            const householdRef = doc(db, 'households', userData.householdId)
            const householdSnap = await getDoc(householdRef)
            
            if (householdSnap.exists()) {
              // Include ID with the household data
              commit('setHousehold', { 
                id: householdSnap.id, 
                ...householdSnap.data() 
              })
              console.log("Set household data:", { id: householdSnap.id, ...householdSnap.data() })
            } else {
              console.log(`Household with ID ${userData.householdId} not found`)
              // If the household doesn't exist, clear the user's householdId
              await updateDoc(userRef, { householdId: null })
            }
          } else {
            console.log("User doesn't have a household")
          }
        } else {
          console.log(`User with ID ${userId} not found`)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
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
    async completeTask({ state }, { taskId, userId }) {
      // Reference to the task
      const taskRef = doc(db, 'tasks', taskId)
      const taskSnap = await getDoc(taskRef)
      
      if (taskSnap.exists()) {
        const task = taskSnap.data()
        
        // Update the task as completed
        await updateDoc(taskRef, {
          completedBy: userId,
          completedAt: new Date()
        })
        
        // Add points to the user
        const userRef = doc(db, 'users', userId)
        await updateDoc(userRef, {
          points: (state.userProfile.points || 0) + task.pointsValue
        })
        
        // Check for badges
        const badgesQuery = query(
          collection(db, 'badges'),
          where('type', '==', task.category)
        )
        const badgesSnap = await getDocs(badgesQuery)
        
        badgesSnap.forEach(async badgeDoc => {
          const badge = badgeDoc.data()
          const userTasksQuery = query(
            collection(db, 'tasks'),
            where('completedBy', '==', userId),
            where('category', '==', task.category)
          )
          const userTasksSnap = await getDocs(userTasksQuery)
          
          if (userTasksSnap.size >= badge.requirement) {
            // Award badge
            await updateDoc(userRef, {
              badges: arrayUnion(badgeDoc.id)
            })
          }
        })
      }
    }
  }
})
