<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-6 elevation-6">
          <v-card-title class="text-h6 text-center"> สร้างตัวชี้วัด </v-card-title>

          <v-card-text>
            <v-form
              @submit.prevent="handleSubmit"
              class="d-flex flex-column ga-4"
            >
              <v-text-field
                label="ชื่อตัวชี้วัด"
                v-model="vals.ind_name"
                variant="outlined"
                :rules="[rules.required]"
                clearable
                required
              />

              <v-select
              v-model="vals.ind_score"
              :items="[
                {title: 'มี/ไม่มี', value:0},
                {title: 'เลือกระดับ 1-4', value:1},
              ]"
              label="เลือกรูปแบบการให้คะแนน"
              density="comfortable"
              class="mb-3"
              clearable
            />

              <v-text-field
                label="คะแนนเต็ม"
                v-model="vals.score_max"
                variant="outlined"
                :rules="[rules.required]"
                clearable
                required
              />

              <v-file-input
              v-model="vals.file"
              accept="*/*"
              label="อัพโหลดตัวอย่างหลักฐาน"
              prepend-icon="mdi-paperclip"
              :rules="[rules.file]"
              density="comfortable"
            />

              <v-alert
                v-if="errorMsg"
                type="error"
                variant="tonal"
                class="mt-2"
              >
                {{ errorMsg }}
              </v-alert>

              <div class="d-flex justify-end mt-4">
                <v-btn
                  variant="tonal"
                  color="grey"
                  class="mr-2"
                  @click="router.back()"
                >
                  ย้อนกลับ
                </v-btn>
                <!-- เปลี่ยนเป็นคลิกตรงๆ และให้ type=button -->
                <v-btn
                  type="button"
                  color="primary"
                  variant="flat"
                  @click="handleSubmit"
                >
                  บันทึก
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '~/stores/auth'
import { useForm, useField } from 'vee-validate'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const auth = useAuthStore()

const loading = ref(false)
const { $api } = useNuxtApp()
const errorMsg = ref('')
const t_id = route.params.id
const showPassword = ref(false); // ✅ state สำหรับ toggle แสดง/ซ่อนรหัสผ่าน

const rules = {
  required: v => (!!v || v === 0) || 'กรอกข้อมูลให้ครบ',
  select: v => !!v || 'โปรดเลือก',
  file: v => !!v || 'เลือกไฟล์',
}

const vals = ref({
  t_name: "",
  ind_name: "",
  ind_score: null,
  score_max: "",
  file: "",
});

const handleSubmit = async () => {

  const fd = new FormData()
  fd.append('t_id', t_id)
  fd.append('ind_name', vals.value.ind_name)
  fd.append('ind_score', vals.value.ind_score)
  fd.append('score_max', vals.value.score_max)
  fd.append('file', vals.value.file)

  try {
    await $api.post(
      `/api/topic/list/${t_id}/indicator`, fd ,{
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    router.push(`/admin/topic/indicator/list/${t_id}`)
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e.message || "Create failed";
  }
};

onMounted(() => {
  if (!auth.isLogged) {
    router.push('/login')
    return
  }
})
</script>
