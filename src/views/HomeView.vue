<template>
  <div class="home">
    <h1>Welcome to ChoreQuest, {{ userProfile?.name }}!</h1>
    
    <div v-if="household" class="household-info">
      <h2>Household: {{ household.name }}</h2>
      <p>Your Points: {{ userProfile?.points || 0 }}</p>
    </div>
    
    <div v-else class="no-household">
      <p>You are not part of a household yet.</p>
      <router-link to="/household" class="btn">Join or Create Household</router-link>
    </div>
    
    <div class="dashboard" v-if="household">
      <div class="recent-activity">
        <h3>Recent Activity</h3>
        <!-- Activity list would go here -->
        <p v-if="!recentActivity.length">No recent activity</p>
        <ul v-else>
          <li v-for="activity in recentActivity" :key="activity.id">
            {{ activity.message }}
          </li>
        </ul>
      </div>
      
      <div class="upcoming-tasks">
        <h3>Upcoming Tasks</h3>
        <p v-if="!upcomingTasks.length">No upcoming tasks</p>
        <ul v-else>
          <li v-for="task in upcomingTasks" :key="task.id">
            {{ task.name }} - {{ task.pointsValue }} points
          </li>
        </ul>
        <router-link to="/tasks" class="btn">View All Tasks</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'HomeView',
  setup() {
    const store = useStore()
    const recentActivity = ref([])
    const upcomingTasks = ref([])
    
    const userProfile = computed(() => store.getters.userProfile)
    const household = computed(() => store.getters.household)
    
    onMounted(() => {
      if (household.value) {
        store.dispatch('fetchTasks')
        // Fetch recent activity (would implement this method)
      }
    })
    
    return {
      userProfile,
      household,
      recentActivity,
      upcomingTasks
    }
  }
}
</script>

<style scoped>
.household-info {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 30px;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 15px;
}

.recent-activity, .upcoming-tasks {
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}
</style>
