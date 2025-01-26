<script setup lang="ts">
import { computed } from 'vue';

interface FileItem {
  uid: string;
  name: string;
  size: number;
  type: string;
  contents?: string[];
}

interface Props {
  files: FileItem[];
  searchTerm?: string;
}

const props = withDefaults(defineProps<Props>(), {
  searchTerm: ''
});

const filteredFiles = computed(() => {
  if (!props.searchTerm) return props.files;
  
  return props.files.filter(file => 
    file.contents?.some(content => 
      content.toLowerCase().includes(props.searchTerm.toLowerCase())
    ) || 
    file.name.toLowerCase().includes(props.searchTerm.toLowerCase())
  );
});

const columns = [
  { 
    title: 'File Name', 
    dataIndex: 'name', 
    key: 'name'
  },
  { 
    title: 'File Size', 
    dataIndex: 'size', 
    key: 'size', 
    customRender: ({ text }: { text: number }) => `${(text / 1024).toFixed(2)} KB` 
  },
  { 
    title: 'File Type', 
    dataIndex: 'type', 
    key: 'type' 
  },
  // { 
  //   title: 'Contents', 
  //   dataIndex: 'contents', 
  //   key: 'contents',
  //   customRender: ({ text }: { text: string[] }) => text ? text.join(', ') : 'No contents'
  // }
];
</script>

<template>
  <div class="table-container">
    <a-table 
      v-if="filteredFiles.length"
      :columns="columns"
      :data-source="filteredFiles"
      :row-key="record => record.uid"
    />
    <div v-else class="placeholder">
      Upload a file to view response
    </div>
  </div>
</template>

<style scoped>
.placeholder {
  color: #8c8c8c;
  text-align: center;
  padding: 20px;
}
</style>