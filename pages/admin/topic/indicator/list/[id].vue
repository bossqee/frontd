<script setup>
definePageMeta({ layout: 'default' })
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const items = ref([])
const total = ref(0)
const loading = ref(false)
const errorMsg = ref('')
const confirmDialog = ref(false)
const selectedUser = ref(null)

const t_id = route.params.id
const t_name = ref('')
const ind_id =ref('')

// โหลดข้อมูล
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get(`/api/topic/list/${t_id}/indicator`)
    console.log(data.item)
    items.value = data.item.list
    t_name.value = data.item.topic.t_name
    total.value = data.total
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!auth.isLogged) {
    router.push('/login')
    return
  }
  load()
})

function logout() {
  auth.logout()
  router.push('/login')
}

/* ✅ เรียกตอนกดปุ่ม Delete */
function askDelete(user) {
  selectedUser.value = user
  console.log(user)
  confirmDialog.value = true
}

/* ✅ เมื่อกดยืนยันใน dialog */
async function confirmDelete() {
  try {
    await $api.delete(`/api/topic/list/${t_id}/indicator/${selectedUser.value.ind_id}`)
    confirmDialog.value = false
    selectedUser.value = null
    await load()
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Delete failed'
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">หัวข้อ ( {{ t_name }} )</h1>
        <v-btn color="error" @click="logout">ออกจากระบบ</v-btn>
    </div>

    <v-card>
      <v-card-text>
        <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</v-alert>

            <div v-for="(item, index) in items" :key="ind_id">
                <div class="flex justify-between items-center pa-4">
                    <div>
                        <v-card-title>ตัวชี้วัดที่ {{index+1}} {{ item.ind_name }}</v-card-title>
                        <p class="ml-4 mt-2" >{{ item.detail }}</p>
                        <span class="ml-4 mt-2">รูปแบบการให้คะแนน </span><v-btn rounded="1" variant="outlined">{{ ind_score === 0 ? 'มี/ไม่มี' : 'เลือกระดับ 1-4' }}</v-btn>
                        <div class="flex gap-2 mt-2 ml-4">
                        <NuxtLink :to="`/admin/topic/indicator/edit/${t_id}/${item.ind_id}`">
                            <v-btn size="small" rounded="1" variant="tonal">แก้ไข</v-btn>
                        </NuxtLink>
                        <v-btn
                            size="small"
                            color="error"
                            variant="tonal"
                            rounded="1"
                            @click="askDelete(item)"
                            >
                            ลบ
                        </v-btn>
                        </div>
                    </div>
                    <div>
                        <v-card-title>{{ item.score_max }} คะแนน</v-card-title>
                    </div>
                </div>
                <hr class="my-3">
            </div>
            <div class="py-3">
                <NuxtLink :to="`/admin/topic/indicator/create/${t_id}`">
                    <v-btn size="small" rounded="1" height="40" block>สร้างตัวชี้วัด</v-btn>
                </NuxtLink>
            </div>
      </v-card-text>
    </v-card>
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">ยืนยันการลบ</v-card-title>
        <v-card-text>
          ต้องการลบตัวชี้วัด<strong>({{ selectedUser?.ind_name }})</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">ยกเลิก</v-btn>
          <v-btn color="error" variant="flat" @click="confirmDelete">ลบ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
