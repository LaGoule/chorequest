<template>
  <div class="kanban-container">
    <div class="kanban-column available">
      <h2 class="column-title">
        <i class="ph ph-clipboard-text"></i>
        To Do
      </h2>
      <div class="tasks-container">
        <TaskCard 
          v-for="task in availableTasks" 
          :key="task.id" 
          :task="task"
          :compact="true"
          :show-complete-button="true"
          @complete="$emit('complete', task.id)"
        />
      </div>
    </div>
    
    <div class="kanban-column completed">
      <h2 class="column-title">
        <i class="ph ph-check-square"></i>
        Completed
      </h2>
      <div class="tasks-container">
        <TaskCard 
          v-for="task in completedTasks" 
          :key="task.id" 
          :task="task"
          :compact="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TaskCard from './TaskCard.vue';

export default {
  name: 'TaskKanbanView',
  components: {
    TaskCard
  },
  props: {
    tasks: {
      type: Array,
      required: true
    }
  },
  emits: ['complete'],
  computed: {
    availableTasks() {
      return this.tasks.filter(task => !task.completedBy);
    },
    completedTasks() {
      return this.tasks.filter(task => task.completedBy);
    }
  }
}
</script>

<style scoped>
.kanban-container {
  display: flex;
  gap: var(--spacing-large);
  margin-top: var(--spacing-large);
  height: calc(100vh - 300px);
  min-height: 400px;
}

.kanban-column {
  flex: 1;
  background-color: var(--color-gray-vlight);
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-medium);
  display: flex;
  flex-direction: column;
  min-width: 250px;
}

.column-title {
  margin-top: 0;
  margin-bottom: var(--spacing-medium);
  padding-bottom: var(--spacing-small);
  border-bottom: 2px solid var(--color--gray-light);
  text-align: center;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-small);
}

.tasks-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-medium);
  padding-right: var(--spacing-small);
}

.available {
  border-top: 4px solid var(--color-primary);
}

.completed {
  border-top: 4px solid var(--color-success);
}

/* Scrollbar styling */
.tasks-container::-webkit-scrollbar {
  width: 8px;
}

.tasks-container::-webkit-scrollbar-track {
  background: var(--color-gray-vlight);
  border-radius: 4px;
}

.tasks-container::-webkit-scrollbar-thumb {
  background: var(--color-gray-medium);
  border-radius: 4px;
}
</style>
