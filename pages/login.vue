<!-- ~/pages/login.vue -->
<template>
  <div class="container mx-auto px-4 py-12 max-w-md">
    <v-card>
      <v-card-title class="text-xl">เข้าสู่ระบบ</v-card-title>
      <v-card-text>
        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <v-text-field
                v-model="u_email"
                label="อีเมล"
                type="email"
                :rules="[r => !!r || 'กรอกอีเมล', r => /.+@.+\..+/.test(r) || 'อีเมลไม่ถูกต้อง']"
                prepend-inner-icon="mdi-email-outline"
                required
              />
              <v-text-field
                v-model="u_password"
                label="รหัสผ่าน"
                :type="showPw ? 'text' : 'password'"
                :append-inner-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPw = !showPw"
                prepend-inner-icon="mdi-lock-outline"
                :rules="[r => !!r || 'กรอกรหัสผ่าน']"
                required
              />
          <v-alert v-if="errorMsg" type="error" density="comfortable" variant="tonal">
            {{ errorMsg }}
          </v-alert>
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn :loading="loading" color="primary" type="submit">เข้าสู่ระบบ</v-btn>
          </v-card-actions>
        </form>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup>
definePageMeta({ layout: 'auth-login', ssr: false })// ปิด SSR (ถ้าเปิดจะ error เพราะใช้ localStorage)
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

const { $api } = useNuxtApp()
const router = useRouter()
const auth = useAuthStore()

const errorMsg = ref('')
const showPw = ref(false)
const rememberMe = ref(false)
const loading = ref(false)

const schema = yup.object({
  u_email: yup.string().email('อีเมลไม่ถูกต้อง').required('กรอกอีเมล'),
  u_password: yup.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัว').required('กรอกรหัสผ่าน')
})

const { handleSubmit } = useForm({ validationSchema: schema })
const { value: u_email, errorMessage: emailErr } = useField('u_email')
const { value: u_password, errorMessage: passwordErr } = useField('u_password')

const onSubmit = handleSubmit(async (values) => {
  errorMsg.value = ''
  loading.value = true
  try {
    const { data } = await $api.post('/api/auth/login', { ...values, remember: rememberMe.value })
    if (data?.accessToken) {
      auth.setAuth(data.accessToken, data.user)   // ← เก็บลง localStorage เรียบร้อย
      console.log(data.user)
      const statusPw = data.user.u_pw_status
      if(statusPw === 0 ){
        router.push(`/changePw/${data.user.u_id}`)
      }else if(statusPw === 1 ){
        switch(data.user.u_role){
          case 'Admin' : router.push(`/admin/evaluator/evaluator_list`) 
          break
          case 'Evaluator' : router.push(`/evaluator/list`) 
          break
          case 'User' : router.push(`/user/list`) 
          break
        }
      }
    } else {
      errorMsg.value = 'Invalid response'
    }
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Login error'
    console.error('LOGIN ERROR:', e)
  } finally {
    loading.value = false
  }
})
</script>