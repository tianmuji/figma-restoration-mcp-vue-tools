<template>
  <div class="hello-world">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    <el-button type="primary" @click="handleClick">
      Click me!
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElButton } from 'element-plus'

const title = ref('Hello World')
const message = ref('This is an example component for testing the Figma Restoration Kit.')

const handleClick = () => {
  message.value = 'Button clicked! The kit is working correctly.'
}
</script>

<style scoped>
.hello-world {
  padding: 20px;
  text-align: center;
  font-family: Arial, sans-serif;
}

h1 {
  color: #2c3e50;
  margin-bottom: 16px;
}

p {
  color: #7f8c8d;
  margin-bottom: 20px;
  line-height: 1.6;
}
</style>
