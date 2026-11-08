<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-6 elevation-6">
          <v-card-title class="text-h6 text-center"> แก้ไขข้อมูล </v-card-title>

          <v-card-text>
            <v-form
              @submit.prevent="handleSubmit"
              class="d-flex flex-column ga-4"
            >
              <v-text-field
                label="ชื่อหัวข้อ"
                v-model="vals.t_name"
                variant="outlined"
                clearable
                required
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

const vals = ref({
  t_name: "",
});

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get(`api/topic/list/${t_id}`,)
    console.log(data.item)
    vals.value.t_name = data.item.t_name
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}


const handleSubmit = async () => {
  try {
    await $api.put(
      `/api/topic/list/${t_id}`,
      {
        t_name: vals.value.t_name,
      },
    );
    router.push("/admin/topic/topic_list");
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e.message || "Create failed";
  }
};

onMounted(() => {
  if (!auth.isLogged) {
    router.push('/login')
    return
  }
  load()
})
</script>
