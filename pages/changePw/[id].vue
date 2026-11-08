<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-6 elevation-6">
          <v-card-title class="text-h6 text-center"> กำหนดรหัสผ่านใหม่ </v-card-title>

          <v-card-text>
            <v-form
              @submit.prevent="handleSubmit"
              class="d-flex flex-column ga-4"
            >
              <!-- ✅ ช่อง Password ที่สามารถแสดง/ซ่อน -->
              <v-text-field
                :type="showPassword ? 'text' : 'password'"
                label="รหัสผ่าน"
                v-model="vals.u_password"
                variant="outlined"
                clearable
                required
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
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
const u_id = route.params.id
const showPassword = ref(true); // ✅ state สำหรับ toggle แสดง/ซ่อนรหัสผ่าน

const vals = ref({
  u_password: '12345678',
});

async function load() {
  loading.value = true
  errorMsg.value = ''
}
onMounted(() => {
  if (!auth.isLogged) {
    router.push('/login')
    return
  }
  load()
})

const handleSubmit = async () => {
    if(!vals.value.u_password || vals.value.u_password === '12345678'){
        errorMsg.value = 'กรุณากำหนดรหัสผ่านใหม่'
        return
    }
  try {
    await $api.put(
      `/api/allusers/changePw/${u_id}`,
      {
        u_password : vals.value.u_password
      },
    );
    router.push("/login");
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e.message || "Create failed";
  }
};
</script>
