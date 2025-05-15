// eslint-disable-next-line no-unused-vars
import { db } from '../firebase'
import { 
  collection, 
  doc, 
  setDoc,
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp
} from 'firebase/firestore'

// Database structure definitions
export const collections = {
  USERS: 'users',
  HOUSEHOLDS: 'households',
  TASKS: 'tasks',
  BADGES: 'badges',
  INVITES: 'invites'
}

// User functions
export const getUserById = async (userId) => {
  const docRef = doc(db, collections.USERS, userId)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  }
  return null
}

export const updateUserProfile = async (userId, data) => {
  const userRef = doc(db, collections.USERS, userId)
  await updateDoc(userRef, data)
}

export const createUser = async (userId, userData) => {
  // Use setDoc to create a user document with a specific ID
  await setDoc(doc(db, collections.USERS, userId), {
    ...userData,
    points: 0,
    badges: [],
    createdAt: serverTimestamp()
  });
  return userId;
};

// Household functions
export const createHousehold = async (name, adminId) => {
  // Create new household
  const householdRef = await addDoc(collection(db, collections.HOUSEHOLDS), {
    name,
    adminId,
    createdAt: serverTimestamp()
  })

  // Update the user with the household ID
  const userRef = doc(db, collections.USERS, adminId)
  await updateDoc(userRef, {
    householdId: householdRef.id
  })

  // Return the created household
  const householdSnap = await getDoc(householdRef)
  return { id: householdRef.id, ...householdSnap.data() }
}

export const getHousehold = async (householdId) => {
  const docRef = doc(db, collections.HOUSEHOLDS, householdId)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  }
  return null
}

export const getHouseholdMembers = async (householdId) => {
  const membersQuery = query(
    collection(db, collections.USERS),
    where('householdId', '==', householdId)
  )
  
  const membersSnap = await getDocs(membersQuery)
  const members = []
  
  membersSnap.forEach(doc => {
    members.push({
      id: doc.id,
      ...doc.data()
    })
  })
  
  return members
}

// Invite functions
export const createHouseholdInvite = async (householdId, createdBy) => {
  // Generate a random code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  // Save the invite to Firestore
  await addDoc(collection(db, collections.INVITES), {
    code,
    householdId,
    createdBy,
    createdAt: serverTimestamp()
  })
  
  return code
}

export const joinHouseholdWithInvite = async (inviteCode, userId) => {
  // Find the invite code
  const inviteQuery = query(
    collection(db, collections.INVITES),
    where('code', '==', inviteCode)
  )
  
  const inviteSnap = await getDocs(inviteQuery)
  
  if (inviteSnap.empty) {
    throw new Error('Invalid invite code')
  }
  
  const invite = inviteSnap.docs[0].data()
  
  // Update the user with the household ID
  const userRef = doc(db, collections.USERS, userId)
  await updateDoc(userRef, {
    householdId: invite.householdId
  })
  
  // Return the household
  return await getHousehold(invite.householdId)
}

// Tasks functions
export const createTask = async (taskData, householdId, userId) => {
  return await addDoc(collection(db, collections.TASKS), {
    ...taskData,
    householdId,
    createdAt: serverTimestamp(),
    createdBy: userId
  })
}

export const getHouseholdTasks = async (householdId) => {
  const tasksQuery = query(
    collection(db, collections.TASKS),
    where('householdId', '==', householdId)
  )
  
  const taskSnap = await getDocs(tasksQuery)
  const tasks = []
  
  taskSnap.forEach(doc => {
    tasks.push({ id: doc.id, ...doc.data() })
  })
  
  return tasks
}

export const completeTask = async (taskId, userId, userPoints) => {
  const taskRef = doc(db, collections.TASKS, taskId)
  const taskSnap = await getDoc(taskRef)
  
  if (!taskSnap.exists()) {
    throw new Error('Task not found')
  }
  
  const task = taskSnap.data()
  
  // Update the task as completed
  await updateDoc(taskRef, {
    completedBy: userId,
    completedAt: serverTimestamp()
  })
  
  // Add points to the user
  const userRef = doc(db, collections.USERS, userId)
  await updateDoc(userRef, {
    points: (userPoints || 0) + task.pointsValue
  })
  
  return task.pointsValue
}

// Initialize default badges in the database
export const initializeDefaultBadges = async () => {
  const badges = [
    {
      name: "Cleaning Novice",
      description: "Complete 5 cleaning tasks",
      type: "cleaning",
      requirement: 5
    },
    {
      name: "Cleaning Master",
      description: "Complete 20 cleaning tasks",
      type: "cleaning",
      requirement: 20
    },
    {
      name: "Kitchen Hero",
      description: "Complete 10 cooking tasks",
      type: "cooking",
      requirement: 10
    },
    {
      name: "Handyman",
      description: "Complete 5 maintenance tasks",
      type: "maintenance",
      requirement: 5
    },
    {
      name: "Green Thumb",
      description: "Complete 3 outdoor tasks",
      type: "outdoor",
      requirement: 3
    },
    {
      name: "Shopping Pro",
      description: "Complete 8 shopping tasks",
      type: "shopping",
      requirement: 8
    }
  ]
  
  // Check if badges already exist
  const badgesQuery = query(collection(db, collections.BADGES))
  const existingBadges = await getDocs(badgesQuery)
  
  if (existingBadges.empty) {
    // Add badges if none exist
    for (const badge of badges) {
      await addDoc(collection(db, collections.BADGES), badge)
    }
    console.log('Default badges initialized')
  }
}
