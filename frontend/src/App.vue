<script setup lang="ts">
import { ref } from "vue";
import {
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons-vue";
import { getAnalysis } from "./service/http";
import Table from "./components/Table.vue";

interface FileItem {
  uid: string;
  name: string;
  size: number;
  type: string;
  originFileObj: File;
  contents?: string[];
}

const apiResponse = ref<FileItem[]>([]);
const open = ref<boolean>(false);
const fileList = ref<FileItem[]>([]);
const loading = ref(false);
const searchTerm = ref("");

const showModal = () => {
  open.value = !open.value;
};

const handleSubmit = async () => {
  if (!fileList.value.length) {
    alert("No file uploaded");
    return;
  }

  loading.value = true;
  const currentFile = fileList.value[0];

  try {
    const response = await getAnalysis(currentFile.originFileObj);

    if (response) {
      currentFile.contents = response.data.contents;

      const existingFileIndex = apiResponse.value.findIndex(
        (f) => f.uid === currentFile.uid
      );
      if (existingFileIndex === -1) {
        apiResponse.value.push(currentFile);
      } else {
        apiResponse.value[existingFileIndex] = currentFile;
      }
    }
  } catch (error) {
    console.error("Analysis failed", error);
  } finally {
    fileList.value = [];
    loading.value = false;
    open.value = false;
  }
};

const handleModalClose = () => {
  open.value = false;
  fileList.value = [];
};
</script>

<template>
  <div class="file-upload-container">
    <div
      class="upload-section"
      style="
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        padding: 24px;">
      <a-button
        type="primary"
        @click="showModal"
        style="
          background-color: #4a90e2;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          font-weight: 600;
          border-radius: 8px;
          transition: all 0.3s ease;"
        class="upload-btn">
        <cloud-upload-outlined />
        Upload File
      </a-button>

      <a-modal
        v-model:open="open"
        title="Upload File"
        :footer="null"
        centered
        style="max-width: 500px">
        <div
          class="upload-modal-content"
          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :max-count="1"
            style="margin-bottom: 16px;">
            <div
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #8c8c8c;">
              <plus-outlined style="font-size: 24px" />
              <div style="margin-top: 8px; font-size: 14px">Upload</div>
            </div>
          </a-upload>

          <div
            class="modal-actions"
            style="
              display: flex;
              justify-content: center;
              gap: 12px;
              width: 100%;">
            <a-button
              @click="handleModalClose"
              style="border: 1px solid #d9d9d9; border-radius: 8px">
              Cancel
            </a-button>
            <a-button
              type="primary"
              :loading="loading"
              :disabled="!fileList.length"
              @click="handleSubmit"
              style="
                background-color: #4a90e2;
                border: none;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 8px;">
              <file-text-outlined v-if="!loading" />
              {{ loading ? "Processing..." : "Submit" }}
            </a-button>
          </div>
        </div>
      </a-modal>
    </div>

    <div
      class="response-section"
      style="
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        padding: 24px;">
      <div
        class="search-container"
        style="margin-bottom: 20px; position: relative">
        <a-input-search
          v-model:value="searchTerm"
          placeholder="Search files or contents"
          style="
            width: 100%;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <template #prefix>
            <search-outlined style="color: #8c8c8c" />
          </template>
        </a-input-search>
      </div>
      <div
        class="response-container"
        style="
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 20px;
          min-height: 300px;
          background-color: #f9f9f9;">
        <div
          v-if="loading"
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;">
          <img src="/ai-loading.gif" height="60px" alt="Loading" />
        </div>
        <Table :files="apiResponse" :search-term="searchTerm" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-upload-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 0 auto;
  padding: 24px;
  background-color: #f4f6f9;
  min-height: 100vh;
}

@media (min-width: 768px) {
  .file-upload-container {
    flex-direction: row;
  }

  .upload-section,
  .response-section {
    width: 50%;
  }
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}
</style>
