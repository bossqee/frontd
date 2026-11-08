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
                label="ชื่อ"
                v-model="vals.u_name"
                variant="outlined"
                clearable
                required
              />

              <v-text-field
                label="อีเมล"
                type="email"
                v-model="vals.u_email"
                variant="outlined"
                clearable
                required
              />

              <!-- ✅ ช่อง Password ที่สามารถแสดง/ซ่อน -->
              <v-text-field
                :type="showPassword ? 'text' : 'password'"
                label="รหัสผ่าน"
                v-model="vals.u_password"
                variant="outlined"
                disabled
                clearable
                required
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
              />

              <v-select
                label="Role"
                v-model="u_role"
                :items="roles"
                disabled
                variant="outlined"
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
const u_id = route.params.id
const u_role = ref('User')
const showPassword = ref(false); // ✅ state สำหรับ toggle แสดง/ซ่อนรหัสผ่าน

const vals = ref({
  u_name: "",
  u_email: "",
  u_password: "",
});

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get(`api/allusers/list/${u_role.value}/${u_id}`,)
    console.log(data.item)
    vals.value.u_name = data.item.u_name
    vals.value.u_email = data.item.u_email
    vals.value.u_password = data.item.u_password
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}


const handleSubmit = async () => {
  try {
    await $api.put(
      `/api/allusers/list/${u_role.value}/${u_id}`,
      {
        u_name: vals.value.u_name,
        u_email: vals.value.u_email,
      },
    );
    router.push("/admin/user/user_list");
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
