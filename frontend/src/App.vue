<script setup lang="ts">
import { ref } from "vue";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { getAnalysis } from "./service/http";

const apiResponse = ref(null)
const open = ref<boolean>(false);
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const fileList = ref<any>([]);
const loading = ref(false);

const showModal = () => {
  open.value = !open.value;
};

const handleOk = (e: MouseEvent) => {
  console.log(e);
  open.value = false;
};

const handleSubmit = async() => {
  loading.value = true;
  if (!fileList.value[0].originFileObj) {
    alert('No image uploaded');
    loading.value = false;
    return;
  }
  const response = await getAnalysis(fileList.value[0].originFileObj);
  if ( response ) {
    apiResponse.value = response.data.contents;
    open.value = false;
    loading.value = false;
  }
};

const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};

const handleModalClose = () => {
  open.value = false
};

const  getBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const handlePreview = async (file: any) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

</script>

<template>
  <div class="container">
    <div class="layout-wrapper">
      <div class="modal-section">
        <a-button type="primary" @click="showModal" class="mb-4">Open Modal</a-button>
        <a-modal 
          v-model:open="open" 
          title="Upload Modal" 
          @ok="handleOk" 
        >
          <div class="clearfix">
            <a-upload
              v-model:file-list="fileList"
              list-type="picture-card"
              @preview="handlePreview"
            >
              <div v-if="fileList.length < 8">
                <plus-outlined />
                <div style="margin-top: 8px">Upload</div>
              </div>
            </a-upload>
            <a-modal
              :open="previewVisible"
              :title="previewTitle"
              :footer="null"
              @cancel="handleCancel"
            >
              <img alt="example" style="width: 100%" :src="previewImage" />
            </a-modal>
          </div>
          <template #footer>
            <a-button key="back" @click="handleModalClose">Cancel</a-button>
            <a-button key="submit" type="primary" :loading="loading" @click="handleSubmit">Submit</a-button>
          </template>
        </a-modal>
      </div>
      
      <div class="response-section">
        <div class="response-container">
          <div v-if="loading">
            <LoadingOutlined />
          </div>
         <div v-else>
            <div v-if="apiResponse" class="api-response">
              <ul v-for="item in apiResponse" :key="item">
                <li>{{item}}</li>
              </ul>
            </div>
            <div v-else class="placeholder">
             Upload a file to view response
            </div>
         </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
}

@media (min-width: 768px) {
  .layout-wrapper {
    flex-direction: row;
  }
}

.modal-section {
  width: 100%;
  padding: 20px;
  background-color: #f0f2f5;
}

@media (min-width: 768px) {
  .modal-section {
    width: 50%;
    overflow-y: auto;
  }
}

.response-section {
  width: 100%;
  padding: 20px;
  background-color: #ffffff;
}

@media (min-width: 768px) {
  .response-section {
    width: 50%;
    overflow-y: auto;
  }
}

.response-container {
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 20px;
  min-height: 300px;
}

.placeholder {
  color: #8c8c8c;
  text-align: center;
  padding: 20px;
}

.api-response {
  word-wrap: break-word;
}
</style>
